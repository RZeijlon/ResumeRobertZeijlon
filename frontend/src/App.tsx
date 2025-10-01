import './App.css'
import MatrixBackground from './MatrixBackground'
import ChatBot from './ChatBot'
import { useState, useEffect } from 'react'
import { useContent } from './contexts/ContentContext'
import { useTheme } from './contexts/ThemeContext'
import DynamicSection from './components/DynamicSection'
import Header from './components/layout/Header'

function App() {
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [useFullscreenChat, setUseFullscreenChat] = useState(false)

  // Use Context hooks
  const {
    siteConfig,
    layoutConfig,
    designConfig,
    personalInfo,
    loading,
    error,
    getContentByPath,
    getContentsByPaths
  } = useContent()

  const { currentTheme, getCurrentThemeConfig } = useTheme()

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth
      setIsMobile(width <= 768)
      // Use fullscreen chat if window is too small to fit both content and chat comfortably
      setUseFullscreenChat(width < 1024)
    }
    
    checkScreenSize()
    window.addEventListener('resize', checkScreenSize)
    
    return () => window.removeEventListener('resize', checkScreenSize)
  }, [])

  // Apply design configuration as CSS custom properties
  useEffect(() => {
    if (designConfig) {
      const root = document.documentElement
      root.style.setProperty('--box-padding', designConfig.spacing.box_padding)
      root.style.setProperty('--box-margin', designConfig.spacing.box_margin)
      root.style.setProperty('--section-gap', designConfig.spacing.section_gap)
      root.style.setProperty('--grid-gap', designConfig.spacing.grid_gap)
      root.style.setProperty('--border-radius', designConfig.borders.radius)
      root.style.setProperty('--box-shadow', designConfig.effects.box_shadow)
      root.style.setProperty('--transition-speed', designConfig.effects.transition_speed)
    }
  }, [designConfig])

  const openChat = () => {
    window.dispatchEvent(new CustomEvent('openChat'))
    setShowMobileMenu(false)
  }

  // Loading state
  if (loading) {
    return (
      <div className="App loading">
        <div className="loading-spinner">
          <h2>Loading Portfolio...</h2>
          <p>Setting up dynamic content system</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="App error">
        <div className="error-message">
          <h2>Error Loading Portfolio</h2>
          <p>{error}</p>
          <p>Please try refreshing the page.</p>
        </div>
      </div>
    )
  }

  if (!siteConfig || !layoutConfig || !designConfig || !personalInfo) {
    return (
      <div className="App error">
        <div className="error-message">
          <h2>Configuration Missing</h2>
          <p>Required configuration files are missing.</p>
        </div>
      </div>
    )
  }

  const currentThemeConfig = getCurrentThemeConfig()

  // Determine app classes
  const appClasses = [
    'App',
    currentTheme === 'high-contrast' ? 'high-visibility' : '',
    currentTheme.includes('light') ? 'light-mode' : '',
    currentThemeConfig && !currentThemeConfig.effects.animations ? 'no-animation' : '',
    isChatOpen && !useFullscreenChat ? 'chat-open' : ''
  ].filter(Boolean).join(' ')

  return (
    <div className={appClasses}>
      {/* Matrix background for both themes */}
      {currentThemeConfig?.effects.matrixBackground && currentThemeConfig?.effects.animations && (
        <MatrixBackground isDarkMode={!currentTheme.includes('light')} />
      )}
      
      {/* Skip to main content link */}
      <a href="#main" className="skip-link">Skip to main content</a>

      <Header
        isMobile={isMobile}
        showMobileMenu={showMobileMenu}
        setShowMobileMenu={setShowMobileMenu}
        onOpenChat={openChat}
      />

      <main id="main" role="main">
        {layoutConfig.layout.sections.map((section) => {
          // Get content for this section
          let sectionContent = undefined
          let sectionContents = undefined

          if (section.file) {
            sectionContent = getContentByPath(section.file)
          }
          if (section.files) {
            sectionContents = getContentsByPaths(section.files)
          }

          return (
            <DynamicSection
              key={section.id}
              sectionId={section.id}
              component={section.component}
              content={sectionContent || undefined}
              contents={sectionContents}
              width={section.width}
              personalInfo={personalInfo}
            />
          )
        })}
      </main>
      
      {siteConfig.features.chatBot.enabled && (
        <ChatBot 
          onChatToggle={setIsChatOpen}
          welcomeMessage={getContentByPath(siteConfig.features.chatBot.welcomeFile)}
        />
      )}
    </div>
  )
}

export default App