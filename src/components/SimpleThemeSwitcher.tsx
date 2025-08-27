import React, { useState } from 'react'
import { FaPalette, FaMoon, FaSun } from 'react-icons/fa'
import { useThemeManager } from '../hooks/useThemeManager'

interface SimpleThemeSwitcherProps {
  themeManager: ReturnType<typeof useThemeManager>
  showLabel?: boolean
}

export const SimpleThemeSwitcher: React.FC<SimpleThemeSwitcherProps> = ({ 
  themeManager, 
  showLabel = false 
}) => {
  const [showThemes, setShowThemes] = useState(false)

  const {
    currentTheme,
    isDarkMode,
    switchTheme,
    toggleDarkMode,
    getAvailableThemes
  } = themeManager

  const availableThemes = getAvailableThemes().filter(theme => theme.id !== 'custom')

  return (
    <div className="simple-theme-switcher">
      <button 
        className="theme-toggle-button"
        onClick={() => setShowThemes(!showThemes)}
        aria-label="Change theme"
        aria-expanded={showThemes}
      >
        <FaPalette />
        {showLabel && <span>Theme</span>}
      </button>
      
      {showThemes && (
        <div className="theme-dropdown" role="menu">
          {/* Quick dark/light toggle */}
          {currentTheme !== 'custom' && (
            <button
              className="theme-option quick-toggle"
              onClick={() => {
                toggleDarkMode()
                setShowThemes(false)
              }}
              role="menuitem"
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          )}

          {/* Available themes */}
          {availableThemes.map((theme) => (
            <button
              key={theme.id}
              className={`theme-option ${currentTheme === theme.id ? 'active' : ''}`}
              onClick={() => {
                switchTheme(theme.id)
                setShowThemes(false)
              }}
              role="menuitem"
            >
              <div className="theme-preview">
                {Object.entries(theme.colors).slice(0, 2).map(([key, color]) => (
                  <div 
                    key={key}
                    className="color-preview"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              <span className="theme-name">{theme.name}</span>
              {currentTheme === theme.id && <span className="active-indicator">✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default SimpleThemeSwitcher