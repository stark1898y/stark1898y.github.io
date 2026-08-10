/**
 * Base64 工具页"保存本地"逻辑单元测试
 *
 * 从 public/dev-tools/base64/index.html 中提取 saveLocal() 函数体，
 * 在 Node 沙箱中以 mock 的 document / Blob / URL 环境执行，验证：
 *   - 输出为空时提示错误、不触发下载
 *   - 输出非空时创建 Blob 并触发下载，文件名按模式区分
 *
 * 运行：npm test
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const HTML_PATH = path.join(ROOT, 'public', 'dev-tools', 'base64', 'index.html')
const html = fs.readFileSync(HTML_PATH, 'utf-8')

/** 从源码中提取具名函数的函数体（含首尾大括号），失败返回 null */
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

/** 以 mock 环境执行 saveLocal，返回调用记录 */
function runSaveLocal({ outputValue = '', mode = 'encode' } = {}) {
  const calls = { errs: [], blobs: [], clicked: 0, downloadName: null }

  // mock 环境
  const sandbox = {
    output: { value: outputValue },
    mode,
    showErr: (msg) => calls.errs.push(msg),
    setTimeout: (fn) => fn(),
    document: {
      body: { appendChild() {}, removeChild() {} },
      createElement: () => ({
        href: '',
        download: '',
        click() {
          calls.clicked++
          calls.downloadName = this.download
        },
      }),
    },
    URL: {
      createObjectURL: () => 'blob:mock',
      revokeObjectURL: () => {},
    },
  }
  // Node 18+ 自带全局 Blob；这里显式传入，保证函数体内 Blob 生效
  const fnBody = extractFunctionBody(html, 'saveLocal')
  assert.ok(fnBody, '未从 HTML 中提取到 saveLocal 函数')
  const fn = new Function(
    'output',
    'mode',
    'showErr',
    'setTimeout',
    'document',
    'URL',
    'Blob',
    fnBody,
  )
  fn(
    sandbox.output,
    sandbox.mode,
    sandbox.showErr,
    sandbox.setTimeout,
    sandbox.document,
    sandbox.URL,
    Blob,
  )
  return calls
}

test('saveLocal: 页面源码中包含保存本地按钮', () => {
  assert.match(html, /onclick="saveLocal\(\)"/, '缺少保存本地按钮')
  assert.match(html, /保存本地/, '缺少按钮文案')
  assert.match(html, /window\.saveLocal = saveLocal;/, 'saveLocal 未挂载到 window')
})

test('saveLocal: 输出为空时提示错误且不触发下载', () => {
  const calls = runSaveLocal({ outputValue: '', mode: 'encode' })
  assert.ok(calls.errs.length === 1, '应提示一次错误')
  assert.match(calls.errs[0], /输出为空/, '错误文案应提示输出为空')
  assert.equal(calls.blobs.length, 0)
  assert.equal(calls.clicked, 0, '不应触发下载点击')
})

test('saveLocal: 编码模式下生成 output.txt 并触发下载', () => {
  const calls = runSaveLocal({ outputValue: 'SGVsbG8=', mode: 'encode' })
  assert.equal(calls.errs.length, 0, '不应有错误提示')
  assert.equal(calls.clicked, 1, '应触发一次下载点击')
  assert.equal(calls.downloadName, 'output.txt')
})

test('saveLocal: 解码模式下生成 decoded.txt 并触发下载', () => {
  const calls = runSaveLocal({ outputValue: 'Hello 你好', mode: 'decode' })
  assert.equal(calls.clicked, 1, '应触发一次下载点击')
  assert.equal(calls.downloadName, 'decoded.txt')
})
