/**
 * JSON 工具集持久化（偏好 + 草稿自动保存）单元测试
 *
 * 从 public/dev-tools/json-formatter/index.html 中提取"偏好恢复 + 草稿自动保存"
 * 逻辑，在 Node 沙箱中以 mock 的 localStorage / document 环境执行，验证：
 *   - 空 localStorage（用户清除缓存后）不报错、保持默认值
 *   - 有保存数据时正确恢复 Tab / 缩进 / 各输入草稿
 *   - 输入事件触发时自动写入 localStorage
 *   - switchTab 切换时写入 jt-tab
 *
 * 运行：npm test
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const HTML_PATH = path.join(ROOT, 'public', 'dev-tools', 'json-formatter', 'index.html')
const html = fs.readFileSync(HTML_PATH, 'utf-8')

const DRAFT_IDS = ['jsonInput', 'escInput', 'viewInput', 'cmpA', 'cmpB']

/** 提取两个标记之间的源码片段 */
function extractBetween(src, startMarker, endMarker) {
  const start = src.indexOf(startMarker)
  if (start === -1) return null
  const end = src.indexOf(endMarker, start)
  if (end === -1) return null
  return src.slice(start + startMarker.length, end)
}

/** 提取具名函数的完整函数体（含首尾大括号） */
function extractFunctionBody(src, name) {
  const re = new RegExp(`function\\s+${name}\\s*\\([^)]*\\)\\s*\\{`)
  const start = src.search(re)
  if (start === -1) return null
  const openIdx = src.indexOf('{', start)
  let depth = 0
  for (let i = openIdx; i < src.length; i++) {
    if (src[i] === '{') depth++
    else if (src[i] === '}') {
      depth--
      if (depth === 0) return src.slice(openIdx, i + 1)
    }
  }
  return null
}

/** mock localStorage（Map 实现） */
function makeLocalStorage(initial = {}) {
  const store = new Map(Object.entries(initial))
  return {
    getItem: (k) => (store.has(k) ? store.get(k) : null),
    setItem: (k, v) => store.set(k, String(v)),
    removeItem: (k) => store.delete(k),
    _store: store,
  }
}

/** mock DOM 元素 */
function makeEl(id) {
  const handlers = {}
  const el = {
    id,
    value: '',
    classList: {
      toggle(_name, force) {
        el._active = force === undefined ? !el._active : !!force
      },
    },
    addEventListener: (type, fn) => { handlers[type] = fn },
    getAttribute: () => (el.id === 2 ? '2' : el.id === 4 ? '4' : ''),
    _handlers: handlers,
    _active: false,
  }
  return el
}

/** 在沙箱中执行"偏好恢复 + 草稿自动保存" IIFE，返回执行后状态 */
function runPersistLogic({ ls, tabCalls = [] } = {}) {
  const code = extractBetween(html, '/* ===== 偏好恢复 + 草稿自动保存 ===== */', '/* ===== URL 参数 ===== */')
  assert.ok(code, '未提取到偏好恢复逻辑')

  const elements = {}
  DRAFT_IDS.forEach((id) => (elements[id] = makeEl(id)))
  const segBtns = [makeEl(2), makeEl(4)]

  const document = {
    getElementById: (id) => {
      if (id.startsWith('panel-')) return { classList: { add() {} } }
      return elements[id] ?? null
    },
    querySelectorAll: (sel) => (sel === '#indentSeg button' ? segBtns : []),
  }

  const switchTab = (name) => tabCalls.push(name)

  const fn = new Function('localStorage', 'document', 'switchTab', `
    var indent = 2;
    ${code}
    return { indent: indent };
  `)
  const result = fn(ls, document, switchTab)
  return { elements, segBtns, indent: result.indent }
}

/** 执行完整 switchTab 函数，验证 jt-tab 写入 */
function runSwitchTab(ls, name) {
  const body = extractFunctionBody(html, 'switchTab')
  assert.ok(body, '未提取到 switchTab 函数')
  const tabBtns = [
    { classList: { toggle() {} }, getAttribute: () => 'format' },
    { classList: { toggle() {} }, getAttribute: () => 'view' },
  ]
  const document = {
    getElementById: () => ({ classList: { add() {} } }),
    querySelectorAll: () => [{ classList: { remove() {} } }],
  }
  const fn = new Function('localStorage', 'document', 'tabBtns', 'name', `${body}`)
  fn(ls, document, tabBtns, name)
}

test('持久化逻辑: 空 localStorage（清除缓存）不报错且保持默认', () => {
  const ls = makeLocalStorage()
  const { elements, indent } = runPersistLogic({ ls })
  assert.equal(indent, 2, '缩进应为默认 2')
  DRAFT_IDS.forEach((id) => assert.equal(elements[id].value, '', `${id} 草稿应为空`))
  assert.equal(ls._store.size, 0, '不应产生多余写入')
})

test('持久化逻辑: 恢复保存的 Tab', () => {
  const ls = makeLocalStorage({ 'jt-tab': 'compare' })
  const calls = []
  runPersistLogic({ ls, tabCalls: calls })
  assert.deepEqual(calls, ['compare'], '应调用 switchTab 恢复 Tab')
})

test('持久化逻辑: 恢复缩进偏好并同步按钮激活态', () => {
  const ls = makeLocalStorage({ 'jt-indent': '4' })
  const { segBtns, indent } = runPersistLogic({ ls })
  assert.equal(indent, 4, '缩进应恢复为 4')
  assert.equal(segBtns[1]._active, true, '4 空格按钮应激活')
  assert.equal(segBtns[0]._active, false, '2 空格按钮不应激活')
})

test('持久化逻辑: 恢复各输入草稿', () => {
  const ls = makeLocalStorage({
    'jt-draft-jsonInput': '{"a":1}',
    'jt-draft-cmpA': '{"x":1}',
    'jt-draft-cmpB': '{"y":2}',
  })
  const { elements } = runPersistLogic({ ls })
  assert.equal(elements.jsonInput.value, '{"a":1}')
  assert.equal(elements.cmpA.value, '{"x":1}')
  assert.equal(elements.cmpB.value, '{"y":2}')
  assert.equal(elements.escInput.value, '', '未保存的草稿应保持为空')
})

test('持久化逻辑: 输入事件自动写入草稿', () => {
  const ls = makeLocalStorage()
  const { elements } = runPersistLogic({ ls })
  elements.jsonInput.value = '{"updated":true}'
  elements.jsonInput._handlers.input()
  assert.equal(ls.getItem('jt-draft-jsonInput'), '{"updated":true}', 'input 事件应写入草稿')
})

test('switchTab: 切换时写入 jt-tab', () => {
  const ls = makeLocalStorage()
  runSwitchTab(ls, 'view')
  assert.equal(ls.getItem('jt-tab'), 'view')
})

test('switchTab: localStorage 不可用时静默降级（无异常）', () => {
  // 模拟 setItem 抛异常（如隐私模式）
  const brokenLs = {
    getItem: () => { throw new Error('SecurityError') },
    setItem: () => { throw new Error('SecurityError') },
    removeItem: () => { throw new Error('SecurityError') },
  }
  assert.doesNotThrow(() => runPersistLogic({ ls: brokenLs }), '恢复逻辑应吞掉异常')
  assert.doesNotThrow(() => runSwitchTab(brokenLs, 'view'), 'switchTab 应吞掉异常')
})
