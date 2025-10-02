import { useState, useEffect } from 'react'
import type { ThemeConfig } from './useContentManager'

export type ThemeMode = 'default-dark' | 'default-light' | 'high-contrast' | 'custom'

export interface CustomTheme {
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
}

export const useThemeManager = (themeConfig: ThemeConfig | null) => {
  // Detect system preference for initial state
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const [currentTheme, setCurrentTheme] = useState<ThemeMode>(prefersDark ? 'default-dark' : 'default-light')
  const [customTheme, setCustomTheme] = useState<CustomTheme | null>(null)
  const [isDarkMode, setIsDarkMode] = useState(prefersDark)
  const [animationsEnabled, setAnimationsEnabled] = useState(true)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('portfolio-theme')
    const savedCustomTheme = localStorage.getItem('portfolio-custom-theme')
    const savedDarkMode = localStorage.getItem('portfolio-dark-mode')
    const savedAnimationsEnabled = localStorage.getItem('portfolio-animations-enabled')

    if (savedTheme) {
      setCurrentTheme(savedTheme as ThemeMode)
    }
    if (savedCustomTheme) {
      try {
        setCustomTheme(JSON.parse(savedCustomTheme))
      } catch (err) {
        console.error('Error parsing saved custom theme:', err)
      }
    }
    if (savedDarkMode !== null) {
      setIsDarkMode(savedDarkMode === 'true')
    }
    if (savedAnimationsEnabled !== null) {
      setAnimationsEnabled(savedAnimationsEnabled === 'true')
    }
  }, [])

  // Apply theme to CSS custom properties
  useEffect(() => {
    if (!themeConfig) return

    let themeToApply
    if (currentTheme === 'custom' && customTheme) {
      themeToApply = customTheme
    } else {
      themeToApply = themeConfig.themes[currentTheme]
    }

    if (!themeToApply) return

    const root = document.documentElement

    // Apply color variables
    Object.entries(themeToApply.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value as string)
    })

    // Apply theme-specific variables
    root.style.setProperty('--highlight', themeToApply.colors.highlight)
    root.style.setProperty('--frames', themeToApply.colors.frames)
    root.style.setProperty('--lighter-background', themeToApply.colors['lighter-background'])
    root.style.setProperty('--darker-background', themeToApply.colors['darker-background'])
    root.style.setProperty('--background-contrast', themeToApply.colors['background-contrast'])

    // Legacy variables for compatibility
    root.style.setProperty('--teal', themeToApply.colors.highlight)
    root.style.setProperty('--seaweed-green', themeToApply.colors.frames)
    root.style.setProperty('--background-primary', themeToApply.colors['lighter-background'])
    root.style.setProperty('--background-secondary', themeToApply.colors['darker-background'])

    // Text colors based on background
    const isLightBg = isLightColor(themeToApply.colors['darker-background'])
    root.style.setProperty('--text-primary', isLightBg ? '#000000' : '#e8e8e8')
    root.style.setProperty('--text-secondary', isLightBg ? '#666666' : '#b8b8b8')
    root.style.setProperty('--border-color', themeToApply.colors.frames)

    // Update body classes for effects
    document.body.classList.toggle('matrix-background', themeToApply.effects.matrixBackground)

  }, [themeConfig, currentTheme, customTheme])

  const isLightColor = (hex: string): boolean => {
    const rgb = hexToRgb(hex)
    if (!rgb) return false
    const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000
    return brightness > 128
  }

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null
  }

  const switchTheme = (theme: ThemeMode) => {
    setCurrentTheme(theme)
    localStorage.setItem('portfolio-theme', theme)
    
    if (theme !== 'custom') {
      // Update dark mode based on theme
      const newIsDarkMode = theme === 'default-dark' || theme === 'high-contrast'
      setIsDarkMode(newIsDarkMode)
      localStorage.setItem('portfolio-dark-mode', newIsDarkMode.toString())
    }
  }

  const toggleDarkMode = () => {
    if (currentTheme === 'custom') return // Don't toggle for custom themes
    
    const newTheme = isDarkMode ? 'default-light' : 'default-dark'
    switchTheme(newTheme)
  }

  const createCustomTheme = (colors: CustomTheme['colors'], name: string = 'Custom Theme') => {
    const theme: CustomTheme = {
      name,
      colors,
      effects: {
        matrixBackground: !isLightColor(colors['darker-background']),
        animations: true
      }
    }
    
    setCustomTheme(theme)
    setCurrentTheme('custom')
    localStorage.setItem('portfolio-custom-theme', JSON.stringify(theme))
    localStorage.setItem('portfolio-theme', 'custom')
  }

  const toggleAnimations = () => {
    const newAnimationsEnabled = !animationsEnabled
    setAnimationsEnabled(newAnimationsEnabled)
    localStorage.setItem('portfolio-animations-enabled', newAnimationsEnabled.toString())
  }

  const getAvailableThemes = () => {
    if (!themeConfig) return []
    
    const themes = Object.entries(themeConfig.themes).map(([key, theme]) => ({
      id: key as ThemeMode,
      name: theme.name,
      colors: theme.colors
    }))

    if (customTheme) {
      themes.push({
        id: 'custom' as ThemeMode,
        name: customTheme.name,
        colors: customTheme.colors
      })
    }

    return themes
  }

  const getCurrentThemeConfig = () => {
    if (!themeConfig) return null
    
    let baseConfig
    if (currentTheme === 'custom' && customTheme) {
      baseConfig = customTheme
    } else {
      baseConfig = themeConfig.themes[currentTheme]
    }
    
    if (!baseConfig) return null
    
    // Override animations setting with user preference
    return {
      ...baseConfig,
      effects: {
        ...baseConfig.effects,
        animations: animationsEnabled && baseConfig.effects.animations
      }
    }
  }

  return {
    currentTheme,
    isDarkMode,
    customTheme,
    animationsEnabled,
    switchTheme,
    toggleDarkMode,
    toggleAnimations,
    createCustomTheme,
    getAvailableThemes,
    getCurrentThemeConfig,
    themeConfig
  }
}