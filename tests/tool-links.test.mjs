/**
 * 工具页链接跳转单元测试
 *
 * 验证 public/dev-tools/<tool>/ 下各工具页的内部链接目标都存在，
 * 防止硬编码旧路径（/tools/ 等）导致线上 404。
 *
 * 运行：npm test
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const TOOLS = ['timestamp-converter', 'json-formatter', 'base64']

/**
 * 将站内绝对路径（/xxx/yyy/）映射到仓库中的源文件路径。
 * 优先匹配 public/dev-tools 下的静态工具页，其次匹配 VitePress 源码 .md。
 */
function resolveSourcePath(url) {
  const clean = url.replace(/^\/+|\/+$/g, '')
  if (!clean) return path.join(ROOT, 'index.md') // '/' -> 首页

  const parts = clean.split('/')
  if (parts[0] === 'dev-tools') {
    if (parts.length === 1) return path.join(ROOT, 'dev-tools', 'index.md')
    const staticHtml = path.join(ROOT, 'public', 'dev-tools', parts[1], 'index.html')
    if (fs.existsSync(staticHtml)) return staticHtml
    return path.join(ROOT, 'dev-tools', parts[1], 'index.md')
  }
  if (parts[0] === 'open-source') {
    const staticHtml = path.join(ROOT, 'public', parts[1], 'index.html')
    if (fs.existsSync(staticHtml)) return staticHtml
    return path.join(ROOT, 'open-source', parts[1], 'index.md')
  }
  if (parts[0] === 'docs') {
    // docs 下可能是嵌套目录，逐级尝试找 .md
    for (let i = parts.length; i >= 1; i--) {
      const candidate = path.join(ROOT, 'docs', ...parts.slice(1, i), `${parts[i - 1] ?? 'intro'}.md`)
      if (fs.existsSync(candidate)) return candidate
    }
    return path.join(ROOT, 'docs', ...parts.slice(1), '.md')
  }
  return null // 未知路径，跳过
}

function extractInternalHrefs(htmlPath) {
  const html = fs.readFileSync(htmlPath, 'utf-8')
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1])
  return [...new Set(hrefs)]
}

function isInternal(url) {
  return url.startsWith('/') && !url.startsWith('//')
}

for (const tool of TOOLS) {
  const htmlPath = path.join(ROOT, 'public', 'dev-tools', tool, 'index.html')

  test(`${tool}: 工具页存在`, () => {
    assert.ok(fs.existsSync(htmlPath), `${htmlPath} 不存在`)
  })

  test(`${tool}: 所有内部链接目标均存在（无 404）`, () => {
    const hrefs = extractInternalHrefs(htmlPath)
    assert.ok(hrefs.length > 0, '未提取到任何链接')

    const broken = []
    for (const href of hrefs) {
      if (!isInternal(href)) continue
      const target = resolveSourcePath(href)
      if (target === null) continue
      if (!fs.existsSync(target)) broken.push(`${href} -> ${target}`)
    }
    assert.deepEqual(broken, [], `存在失效链接:\n${broken.join('\n')}`)
  })

  test(`${tool}: 包含返回开发工具链接`, () => {
    const hrefs = extractInternalHrefs(htmlPath)
    assert.ok(hrefs.includes('/dev-tools/'), `缺少 /dev-tools/ 返回链接`)
  })

  test(`${tool}: 不包含旧路径 /tools/ 链接`, () => {
    const hrefs = extractInternalHrefs(htmlPath)
    const old = hrefs.filter((h) => /^\/tools\//.test(h))
    assert.deepEqual(old, [], '检测到废弃旧路径 /tools/ 链接')
  })
}
