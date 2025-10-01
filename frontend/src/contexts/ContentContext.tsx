import { createContext, useContext, useState, useEffect } from 'react'
import type { ReactNode } from 'react'
import { parseFrontmatter } from '../utils/frontmatter'
import type {
  ContentItem,
  SiteConfig,
  ThemeConfig,
  LayoutConfig,
  DesignConfig,
  PersonalInfo,
  NavbarItem
} from '../types'

interface ContentContextType {
  siteConfig: SiteConfig | null
  themeConfig: ThemeConfig | null
  layoutConfig: LayoutConfig | null
  designConfig: DesignConfig | null
  personalInfo: PersonalInfo | null
  content: Record<string, ContentItem>
  loading: boolean
  error: string | null
  getContentByPath: (path: string) => ContentItem | null
  getContentsByPaths: (paths: string[]) => ContentItem[]
  getNavbarItems: () => NavbarItem[]
}

const ContentContext = createContext<ContentContextType | undefined>(undefined)

export const useContent = () => {
  const context = useContext(ContentContext)
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider')
  }
  return context
}

const loadJsonFile = async (path: string) => {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.statusText}`)
  }
  return await response.json()
}

const loadMarkdownFile = async (path: string): Promise<ContentItem> => {
  const response = await fetch(path)
  if (!response.ok) {
    throw new Error(`Failed to load ${path}: ${response.statusText}`)
  }
  const rawContent = await response.text()
  const { data: metadata, content: markdownContent } = parseFrontmatter(rawContent)

  return {
    id: path.replace(/^.*\//, '').replace('.md', ''),
    content: markdownContent,
    metadata,
    rawContent
  }
}

const loadMultipleMarkdownFiles = async (paths: string[]): Promise<ContentItem[]> => {
  const promises = paths.map(path => loadMarkdownFile(`/page_content/${path}`))
  return Promise.all(promises)
}

export const ContentProvider = ({ children }: { children: ReactNode }) => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null)
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null)
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig | null>(null)
  const [designConfig, setDesignConfig] = useState<DesignConfig | null>(null)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null)
  const [content, setContent] = useState<Record<string, ContentItem>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAllContent = async () => {
      try {
        setLoading(true)
        setError(null)

        // Load configuration files
        const [site, theme, layout, design, personal] = await Promise.all([
          loadJsonFile('/page_content/config/site.json'),
          loadJsonFile('/page_content/config/theme.json'),
          loadJsonFile('/page_content/config/layout.json'),
          loadJsonFile('/page_content/config/design.json'),
          loadJsonFile('/page_content/personal/contact-info.json')
        ])

        setSiteConfig(site)
        setThemeConfig(theme)
        setLayoutConfig(layout)
        setDesignConfig(design)
        setPersonalInfo(personal)

        // Load all content files based on layout configuration
        const contentPromises: Promise<ContentItem | ContentItem[]>[] = []
        const contentMap: Record<string, ContentItem> = {}

        for (const section of layout.layout.sections) {
          if (section.file) {
            contentPromises.push(loadMarkdownFile(`/page_content/${section.file}`))
          }
          if (section.files) {
            contentPromises.push(loadMultipleMarkdownFiles(section.files))
          }
        }

        // Load chat welcome message
        if (site.features.chatBot.enabled) {
          contentPromises.push(loadMarkdownFile(`/page_content/${site.features.chatBot.welcomeFile}`))
        }

        const results = await Promise.all(contentPromises)

        // Process results and build content map
        results.forEach((result) => {
          if (Array.isArray(result)) {
            result.forEach(item => {
              contentMap[item.id] = item
            })
          } else {
            contentMap[result.id] = result
          }
        })

        setContent(contentMap)
      } catch (err) {
        console.error('Error loading content:', err)
        setError(err instanceof Error ? err.message : 'Unknown error loading content')
      } finally {
        setLoading(false)
      }
    }

    loadAllContent()
  }, [])

  const getContentByPath = (path: string): ContentItem | null => {
    const id = path.replace(/^.*\//, '').replace('.md', '')
    return content[id] || null
  }

  const getContentsByPaths = (paths: string[]): ContentItem[] => {
    return paths.map(path => getContentByPath(path)).filter(Boolean) as ContentItem[]
  }

  const getNavbarItems = (): NavbarItem[] => {
    if (!layoutConfig) return []

    return layoutConfig.layout.sections
      .filter(section => section.navbar !== false)
      .map(section => ({
        id: section.id,
        label: (section.navbar as { label: string; order: number }).label,
        order: (section.navbar as { label: string; order: number }).order
      }))
      .sort((a, b) => a.order - b.order)
  }

  const value: ContentContextType = {
    siteConfig,
    themeConfig,
    layoutConfig,
    designConfig,
    personalInfo,
    content,
    loading,
    error,
    getContentByPath,
    getContentsByPaths,
    getNavbarItems
  }

  return <ContentContext.Provider value={value}>{children}</ContentContext.Provider>
}
