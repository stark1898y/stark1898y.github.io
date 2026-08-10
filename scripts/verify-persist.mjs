/**
 * localStorage 持久化浏览器验证脚本
 *
 * 启动本地静态服务器 + 无头 Chrome（CDP 协议），对三个工具页执行：
 *   设置输入 → 刷新多次 → 验证输入/偏好/草稿是否真实持久化。
 *
 * 运行：npm run verify:persist   （需先 npm run build 生成 dist）
 */
import http from 'node:http'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DIST = path.join(ROOT, '.vitepress', 'dist')
const PORT = 8124
const DEBUG_PORT = 9224
const RELOAD_TIMES = 3 // 刷新次数

const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
]
const CHROME = CHROME_CANDIDATES.find((p) => p && fs.existsSync(p))

if (!CHROME) {
  console.error('✖ 未找到 Chrome/Edge，无法运行浏览器验证')
  process.exit(1)
}

/* ================= 静态服务器 ================= */
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
}
const server = http.createServer((req, res) => {
  let urlPath = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (urlPath.endsWith('/')) urlPath += 'index.html'
  const filePath = path.join(DIST, urlPath)
  if (!filePath.startsWith(DIST) || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
    res.writeHead(404)
    res.end('404 Not Found')
    return
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'application/octet-stream' })
  res.end(fs.readFileSync(filePath))
})

/* ================= CDP 客户端 ================= */
class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl)
    this.id = 0
    this.pending = new Map()
    this.eventHandlers = new Map()
  }
  async connect() {
    await new Promise((resolve, reject) => {
      this.ws.onopen = resolve
      this.ws.onerror = reject
    })
    this.ws.onmessage = (ev) => {
      const msg = JSON.parse(ev.data)
      if (msg.id && this.pending.has(msg.id)) {
        const { resolve, reject } = this.pending.get(msg.id)
        this.pending.delete(msg.id)
        msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result)
      } else if (msg.method && this.eventHandlers.has(msg.method)) {
        for (const fn of this.eventHandlers.get(msg.method)) fn(msg.params)
      }
    }
  }
  send(method, params = {}) {
    const id = ++this.id
    return new Promise((resolve, reject) => {
      this.pending.set(id, { resolve, reject })
      this.ws.send(JSON.stringify({ id, method, params }))
    })
  }
  once(method, timeout = 15000) {
    return new Promise((resolve, reject) => {
      const handler = (p) => {
        clearTimeout(timer)
        this.eventHandlers.set(method, this.eventHandlers.get(method).filter((f) => f !== handler))
        resolve(p)
      }
      const timer = setTimeout(() => {
        this.eventHandlers.set(method, this.eventHandlers.get(method).filter((f) => f !== handler))
        reject(new Error('等待事件超时: ' + method))
      }, timeout)
      if (!this.eventHandlers.has(method)) this.eventHandlers.set(method, [])
      this.eventHandlers.get(method).push(handler)
    })
  }
  async evaluate(expression) {
    const r = await this.send('Runtime.evaluate', { expression, returnByValue: true })
    if (r.exceptionDetails) throw new Error('页面 JS 异常: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text))
    return r.result?.value
  }
  async navigate(url) {
    const loaded = this.once('Page.loadEventFired')
    await this.send('Page.navigate', { url })
    await loaded
    await new Promise((r) => setTimeout(r, 300))
  }
  async reload() {
    const loaded = this.once('Page.loadEventFired')
    await this.send('Page.reload', { ignoreCache: true })
    await loaded
    await new Promise((r) => setTimeout(r, 300))
  }
}

/* ================= 工具 ================= */
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)) }

async function waitForDebugPort() {
  for (let i = 0; i < 50; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/version`)
      if (res.ok) return true
    } catch (e) { /* 未就绪 */ }
    await sleep(200)
  }
  return false
}

async function createPage() {
  const res = await fetch(`http://127.0.0.1:${DEBUG_PORT}/json/new?url=about:blank`, { method: 'PUT' })
  const target = await res.json()
  const cdp = new CDP(target.webSocketDebuggerUrl)
  await cdp.connect()
  await cdp.send('Page.enable')
  await cdp.send('Runtime.enable')
  return cdp
}

/* ================= 断言 ================= */
let passed = 0
let failed = 0

function check(name, cond, detail = '') {
  if (cond) {
    passed++
    console.log(`  ✓ ${name}`)
  } else {
    failed++
    console.log(`  ✖ ${name}${detail ? '  → ' + detail : ''}`)
  }
}

/* ================= 各页面测试 ================= */
async function testJson(cdp, base) {
  console.log('\n[1] JSON 工具集 草稿 + Tab 记忆')
  await cdp.navigate(`${base}/dev-tools/json-formatter/`)
  await cdp.evaluate(`document.getElementById('jsonInput').value='{"draft":${RELOAD_TIMES + 1}}'; document.getElementById('jsonInput').dispatchEvent(new Event('input',{bubbles:true})); document.querySelector('.tab-btn[data-tab="compare"]').click()`)
  for (let i = 0; i < RELOAD_TIMES; i++) {
    await cdp.reload()
    const val = await cdp.evaluate(`document.getElementById('jsonInput').value`)
    const activeTab = await cdp.evaluate(`document.querySelector('.tab-btn.active')?.getAttribute('data-tab')`)
    check(`刷新第 ${i + 1} 次后草稿保留`, val === '{"draft":' + (RELOAD_TIMES + 1) + '}', `值=${JSON.stringify(val)}`)
    check(`刷新第 ${i + 1} 次后 Tab 保留(compare)`, activeTab === 'compare', `Tab=${activeTab}`)
  }
}

async function testBase64(cdp, base) {
  console.log('\n[2] Base64 模式记忆 + 草稿')
  await cdp.navigate(`${base}/dev-tools/base64/`)
  await cdp.evaluate(`document.getElementById('modeDecode').click(); document.getElementById('input').value='SGVsbG8gd29ybGQ='; document.getElementById('input').dispatchEvent(new Event('input',{bubbles:true}))`)
  for (let i = 0; i < RELOAD_TIMES; i++) {
    await cdp.reload()
    const val = await cdp.evaluate(`document.getElementById('input').value`)
    const modeActive = await cdp.evaluate(`document.getElementById('modeDecode').classList.contains('active')`)
    check(`刷新第 ${i + 1} 次后草稿保留`, val === 'SGVsbG8gd29ybGQ=', `值=${JSON.stringify(val)}`)
    check(`刷新第 ${i + 1} 次后解码模式保留`, modeActive === true, `mode=${modeActive}`)
  }
}

async function testTimestamp(cdp, base) {
  console.log('\n[3] 时间戳 批量草稿 + 时区记忆')
  await cdp.navigate(`${base}/dev-tools/timestamp-converter/`)
  await cdp.evaluate(`document.getElementById('batchInput').value='1780713460\\n1780713460000'; document.getElementById('batchInput').dispatchEvent(new Event('input',{bubbles:true}))`)
  // 选东京时区（TIMEZONES 索引 29，offset 9）
  await cdp.evaluate(`localStorage.setItem('ts-tz','29')`)
  for (let i = 0; i < RELOAD_TIMES; i++) {
    await cdp.reload()
    const val = await cdp.evaluate(`document.getElementById('batchInput').value`)
    const tzLabel = await cdp.evaluate(`document.getElementById('tzLabel').textContent`)
    check(`刷新第 ${i + 1} 次后批量草稿保留`, val === '1780713460\n1780713460000', `值=${JSON.stringify(val)}`)
    check(`刷新第 ${i + 1} 次后时区保留(东京)`, tzLabel.includes('UTC+09:00'), `标签=${tzLabel}`)
  }
}

/* ================= 主流程 ================= */
async function main() {
  if (!fs.existsSync(DIST)) {
    console.error('✖ 未找到 .vitepress/dist，请先运行 npm run build')
    process.exit(1)
  }

  await new Promise((resolve) => server.listen(PORT, resolve))
  console.log(`静态服务器: http://localhost:${PORT}`)

  const profileDir = fs.mkdtempSync(path.join(os.tmpdir(), 'trae-persist-'))
  const chrome = spawn(
    CHROME,
    [
      '--headless=new', '--disable-gpu', '--no-sandbox',
      `--remote-debugging-port=${DEBUG_PORT}`,
      `--user-data-dir=${profileDir}`,
      '--disable-logging',
      'about:blank',
    ],
    { stdio: 'ignore' },
  )

  try {
    const ready = await waitForDebugPort()
    if (!ready) {
      console.error('✖ Chrome 调试端口未就绪')
      process.exitCode = 1
      return
    }

    const cdp = await createPage()
    const base = `http://127.0.0.1:${PORT}`

    await testJson(cdp, base)
    await testBase64(cdp, base)
    await testTimestamp(cdp, base)

    await cdp.send('Page.close')
  } finally {
    if (chrome && !chrome.killed) chrome.kill()
    // 等待 Chrome 进程完全退出后再删除 profile 目录，避免 EPERM
    await new Promise((resolve) => {
      const timer = setInterval(() => {
        try {
          fs.rmSync(profileDir, { recursive: true, force: true })
          clearInterval(timer)
          resolve()
        } catch (e) { /* 目录仍被占用，继续等待 */ }
      }, 200)
      setTimeout(() => { clearInterval(timer); resolve() }, 5000)
    })
    server.close()
  }

  console.log(`\n===== 结果: ${passed} 通过 / ${failed} 失败 =====`)
  process.exitCode = failed > 0 ? 1 : 0
}

main().catch((e) => {
  console.error('✖ 脚本异常:', e.message)
  process.exit(1)
})
