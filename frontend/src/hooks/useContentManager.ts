import { useState, useEffect } from 'react'
import { parseFrontmatter } from '../utils/frontmatter'

export interface ContentItem {
  id: string
  content: string
  metadata: Record<string, any>
  rawContent: string
}

export interface SiteConfig {
  meta: {
    title: string
    description: string
    keywords: string[]
    author: string
  }
  features: {
    chatBot: {
      enabled: boolean
      welcomeFile: string
      ragEnabled: boolean
    }
    accessibility: {
      highVisibilityMode: boolean
      noAnimationMode: boolean
      keyboardNavigation: boolean
    }
    matrixBackground: {
      enabled: boolean
      particles: number
      speed: number
    }
  }
  version: string
}

export interface ThemeConfig {
  themes: Record<string, {
    name: string
    colors: {
      highlight: string
      frames: string
      'lighter-background': string
      'darker-background': string
      'background-contrast': string
    }
    effects: {
      matrixBackground: boolean
      animations: boolean
    }
  }>
  customization: {
    allowUserColors: boolean
    colorMappings: Record<string, string[]>
  }
}

export interface LayoutConfig {
  layout: {
    sections: Array<{
      id: string
      component: string
      file?: string
      files?: string[]
      width: 'full' | 'dynamic'
      navbar: false | { label: string; order: number }
    }>
  }
  responsive: {
    breakpoints: Record<string, string>
    gridSettings: Record<string, Record<string, string>>
  }
}

export interface DesignConfig {
  spacing: {
    box_padding: string
    box_margin: string
    section_gap: string
    grid_gap: string
  }
  typography: {
    font_family: {
      primary: string
      monospace: string
    }
    font_sizes: {
      hero_title: string
      section_title: string
      body: string
    }
  }
  borders: {
    radius: string
    width: string
    style: string
  }
  effects: {
    box_shadow: string
    transition_speed: string
  }
}

export interface PersonalInfo {
  name: string
  title: string
  email: string
  phone: string
  location: string
  social: {
    linkedin: { url: string; username: string }
    github: { url: string; username: string }
  }
  professional: {
    specialization: string
    focus: string
  }
}

export const useContentManager = () => {
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null)
  const [themeConfig, setThemeConfig] = useState<ThemeConfig | null>(null)
  const [layoutConfig, setLayoutConfig] = useState<LayoutConfig | null>(null)
  const [designConfig, setDesignConfig] = useState<DesignConfig | null>(null)
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null)
  const [content, setContent] = useState<Record<string, ContentItem>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadJsonFile = async (path: string) => {
    try {
      const response = await fetch(path)
      if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.statusText}`)
      }
      return await response.json()
    } catch (err) {
      console.error(`Error loading ${path}:`, err)
      throw err
    }
  }

  const loadMarkdownFile = async (path: string): Promise<ContentItem> => {
    try {
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
    } catch (err) {
      console.error(`Error loading markdown ${path}:`, err)
      throw err
    }
  }

  const loadMultipleMarkdownFiles = async (paths: string[]): Promise<ContentItem[]> => {
    const promises = paths.map(path => loadMarkdownFile(`/page_content/${path}`))
    return Promise.all(promises)
  }

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

  const getNavbarItems = () => {
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

  return {
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
}