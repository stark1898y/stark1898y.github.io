/**
 * Check local links in independent HTML tools against built Zensical output.
 * Run after Zensical build + restore_tools.py + restore_legacy_urls.py.
 */
import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const SITE = path.join(ROOT, 'site')
const TOOLS = ['timestamp-converter', 'json-formatter', 'base64']

function resolveSitePath(rawHref) {
  const url = new URL(rawHref, 'https://www.stark1898y.cc/')
  if (url.origin !== 'https://www.stark1898y.cc') return null
  const decoded = decodeURIComponent(url.pathname)
  const rel = decoded.replace(/^\/+/, '')
  const isDirectory = !rel || rel.endsWith('/') || !path.extname(rel)
  const suffix = isDirectory ? (rel.endsWith('/') || !rel ? rel : rel + '/') + 'index.html' : rel
  const target = path.resolve(SITE, suffix)
  assert.ok(target.startsWith(SITE + path.sep), 'Out-of-root link: ' + rawHref)
  return target
}

for (const tool of TOOLS) {
  const file = path.join(ROOT, 'public', 'dev-tools', tool, 'index.html')

  test(tool + ': HTML tool source exists', () => {
    assert.ok(fs.existsSync(file))
  })

  test(tool + ': browser links point to built pages', () => {
    assert.ok(fs.existsSync(SITE), 'Build the site before running Node tests')
    const html = fs.readFileSync(file, 'utf-8')
    const hrefs = [...new Set([...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]))]
    const broken = []
    for (const href of hrefs) {
      if (!href.startsWith('/') || href.startsWith('//')) continue
      const target = resolveSitePath(href)
      if (target && !fs.existsSync(target)) broken.push(href)
    }
    assert.deepEqual(broken, [], 'Broken internal links: ' + broken.join(', '))
  })

  test(tool + ': returns to /dev-tools/', () => {
    const html = fs.readFileSync(file, 'utf-8')
    assert.ok(html.includes('href="/dev-tools/"'))
    assert.ok(!/href="\/tools\//.test(html))
  })
}
