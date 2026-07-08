import fs from 'fs'
import path from 'path'

interface CategoryJson {
  label: string
  position: number
  link?: { type: string; id?: string; description?: string }
}

interface SidebarItem {
  text: string
  link?: string
  collapsed?: boolean
  items?: SidebarItem[]
}

const DOCS_DIR = path.resolve(__dirname, '../docs')
const OPEN_SOURCE_DIR = path.resolve(__dirname, '../open-source')

/**
 * 读取 markdown 文件的标题（第一个 # 标题，或 frontmatter 中的 title）
 */
function getMdTitle(filePath: string): string {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    // 先看 frontmatter 中的 title
    const fmMatch = content.match(/^---\s*\ntitle:\s*(.+?)\s*\n/)
    if (fmMatch) return fmMatch[1]
    // 再看第一个 # 标题
    const h1Match = content.match(/^#\s+(.+)/m)
    if (h1Match) return h1Match[1]
    // 回退：用文件名
    return path.basename(filePath, '.md')
  } catch {
    return path.basename(filePath, '.md')
  }
}

/**
 * 读取 _category_.json
 */
function readCategory(dirPath: string): CategoryJson | null {
  const catPath = path.join(dirPath, '_category_.json')
  try {
    return JSON.parse(fs.readFileSync(catPath, 'utf-8'))
  } catch {
    return null
  }
}

/**
 * 扫描目录，自动生成侧边栏条目
 */
function scanDir(dirPath: string, routePrefix: string): SidebarItem[] {
  const items: SidebarItem[] = []
  if (!fs.existsSync(dirPath)) return items

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  // 收集顶层 .md 文件（排除 index.md，它通常是分类首页）
  const mdFiles: string[] = []
  const subDirs: string[] = []

  for (const entry of entries) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue
    if (entry.isDirectory()) {
      subDirs.push(entry.name)
    } else if (entry.isFile() && entry.name.endsWith('.md')) {
      if (entry.name !== 'index.md') {
        mdFiles.push(entry.name)
      }
    }
  }

  // 分类本身作为一个 group（如果存在 _category_.json）
  const category = readCategory(dirPath)
  const topLabel = category?.label ?? path.basename(dirPath)

  // 如果存在 index.md，则该 group 标题可点击
  const hasIndex = fs.existsSync(path.join(dirPath, 'index.md'))

  // 顶层 md 文件作为该分类下的条目
  const topItems: SidebarItem[] = []
  for (const md of mdFiles.sort()) {
    const filePath = path.join(dirPath, md)
    const title = getMdTitle(filePath)
    const link = `${routePrefix}/${md.replace('.md', '')}`
    topItems.push({ text: title, link })
  }

  // 子目录作为可折叠分组
  for (const subDir of subDirs) {
    const subPath = path.join(dirPath, subDir)
    const subCategory = readCategory(subPath)
    const subRoute = `${routePrefix}/${subDir}`

    // 递归扫描子目录
    const children = scanDirFlat(subPath, subRoute)

    if (children.length > 0) {
      items.push({
        text: subCategory?.label ?? subDir,
        collapsed: false,
        items: children,
      })
    }
  }

  // 按 position 排序子分组
  const positioned = items.map((item, idx) => {
    const dirName = item.items?.[0]?.link?.split('/').slice(-2, -1)[0] ?? ''
    const subDir = path.join(dirPath, dirName)
    const cat = readCategory(subDir)
    return { item, position: cat?.position ?? idx + 100 }
  })
  positioned.sort((a, b) => a.position - b.position)

  const result: SidebarItem[] = []
  // 如果有 index.md，分类标题可点击跳转；否则仅作为分组标题
  const topGroup: SidebarItem = {
    text: topLabel,
    items: topItems,
  }
  if (hasIndex) {
    topGroup.link = `${routePrefix}/`
  }
  if (topItems.length > 0 || hasIndex) {
    result.push(topGroup)
  }
  result.push(...positioned.map((p) => p.item))

  return result
}

/**
 * 扁平扫描子目录（获取其中所有 .md 文件）
 */
function scanDirFlat(dirPath: string, routePrefix: string): SidebarItem[] {
  const items: SidebarItem[] = []
  if (!fs.existsSync(dirPath)) return items

  const entries = fs.readdirSync(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue
    if (entry.isFile() && entry.name.endsWith('.md')) {
      const filePath = path.join(dirPath, entry.name)
      const title = getMdTitle(filePath)
      const link = `${routePrefix}/${entry.name.replace('.md', '')}`
      items.push({ text: title, link })
    }
  }

  return items
}

/**
 * 生成 docs/ 侧边栏
 */
function generateDocsSidebar(): Record<string, SidebarItem[]> {
  const sidebar: Record<string, SidebarItem[]> = {
    '/docs/intro': [],
  }

  if (!fs.existsSync(DOCS_DIR)) return sidebar

  const entries = fs.readdirSync(DOCS_DIR, { withFileTypes: true })
  const topDirs: { name: string; position: number }[] = []

  for (const entry of entries) {
    if (entry.name.startsWith('_') || entry.name.startsWith('.')) continue
    if (entry.isDirectory()) {
      const cat = readCategory(path.join(DOCS_DIR, entry.name))
      topDirs.push({
        name: entry.name,
        position: cat?.position ?? 99,
      })
    }
  }

  // 按 position 排序
  topDirs.sort((a, b) => a.position - b.position)

  for (const dir of topDirs) {
    const dirPath = path.join(DOCS_DIR, dir.name)
    const routePrefix = `/docs/${dir.name}`
    const items = scanDir(dirPath, routePrefix)
    if (items.length > 0) {
      sidebar[`${routePrefix}/`] = items
    }
  }

  return sidebar
}

/**
 * 生成 open-source/ 侧边栏
 */
function generateOpenSourceSidebar(): Record<string, SidebarItem[]> {
  const sidebar: Record<string, SidebarItem[]> = {}

  if (!fs.existsSync(OPEN_SOURCE_DIR)) return sidebar

  const items: SidebarItem[] = []
  const entries = fs.readdirSync(OPEN_SOURCE_DIR, { withFileTypes: true })

  // 根目录的 index.md → 概览
  const topMds = entries.filter(
    (e) => e.isFile() && e.name === 'index.md',
  )
  // 子目录
  const subDirs = entries.filter(
    (e) => e.isDirectory() && !e.name.startsWith('_') && !e.name.startsWith('.'),
  )

  for (const subDir of subDirs) {
    const subPath = path.join(OPEN_SOURCE_DIR, subDir.name)
    const cat = readCategory(subPath)
    const children = scanDirFlat(subPath, `/open-source/${subDir.name}`)

    if (children.length > 0) {
      items.push({
        text: cat?.label ?? subDir.name,
        collapsed: false,
        items: children,
      })
    }
  }

  // 按 position 排序
  const positioned = items.map((item, idx) => {
    const dirName = item.items?.[0]?.link?.split('/')[2] ?? ''
    const subPath = path.join(OPEN_SOURCE_DIR, dirName)
    const cat = readCategory(subPath)
    return { item, position: cat?.position ?? idx + 100 }
  })
  positioned.sort((a, b) => a.position - b.position)

  sidebar['/open-source/'] = [
    {
      text: '开源项目',
      items: [{ text: '概览', link: '/open-source/' }],
    },
    ...positioned.map((p) => p.item),
  ]

  // 为每个子项目生成独立侧边栏（进入项目后只显示该项目文件）
  for (const subDir of subDirs) {
    const subPath = path.join(OPEN_SOURCE_DIR, subDir.name)
    const cat = readCategory(subPath)
    const children = scanDirFlat(subPath, `/open-source/${subDir.name}`)
    if (children.length > 0) {
      sidebar[`/open-source/${subDir.name}/`] = [
        {
          text: cat?.label ?? subDir.name,
          items: [{ text: '概览', link: `/open-source/${subDir.name}/` }],
        },
        {
          text: '相关文档',
          collapsed: false,
          items: children.filter(
            (c) => c.link !== `/open-source/${subDir.name}/index`,
          ),
        },
      ]
    }
  }

  return sidebar
}

/**
 * 自动生成完整侧边栏配置
 */
export function generateSidebar(): Record<string, SidebarItem[]> {
  const docsSidebar = generateDocsSidebar()
  const openSourceSidebar = generateOpenSourceSidebar()
  return { ...docsSidebar, ...openSourceSidebar }
}
