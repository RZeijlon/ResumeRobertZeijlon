import React, { useState } from 'react'
import { FaUniversalAccess, FaSun, FaMoon, FaPalette } from 'react-icons/fa'
import { useThemeManager } from '../../hooks/useThemeManager'

interface ThemeSwitcherProps {
  themeManager: ReturnType<typeof useThemeManager>
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ themeManager }) => {
  const [showMenu, setShowMenu] = useState(false)
  const [showCustomizer, setShowCustomizer] = useState(false)
  const [customColors, setCustomColors] = useState({
    highlight: '#20b2aa',
    frames: '#2e8b45',
    'lighter-background': '#2d342d',
    'darker-background': '#1a1f1a',
    'background-contrast': '#0d110d'
  })

  const {
    currentTheme,
    isDarkMode,
    switchTheme,
    toggleDarkMode,
    createCustomTheme,
    getAvailableThemes
  } = themeManager

  const handleCustomColorChange = (colorKey: string, value: string) => {
    setCustomColors(prev => ({
      ...prev,
      [colorKey]: value
    }))
  }

  const applyCustomTheme = () => {
    createCustomTheme(customColors, 'My Custom Theme')
    setShowCustomizer(false)
    setShowMenu(false)
  }

  return (
    <div className="theme-switcher">
      <button 
        className="accessibility-toggle"
        onClick={() => setShowMenu(!showMenu)}
        aria-label="Theme and accessibility options"
        aria-expanded={showMenu}
      >
        <FaUniversalAccess />
      </button>
      
      {showMenu && (
        <div className="accessibility-menu theme-menu" role="menu">
          {/* Dark/Light Mode Toggle */}
          <div className="theme-option" role="menuitem">
            <button
              onClick={toggleDarkMode}
              className="theme-toggle-btn"
              disabled={currentTheme === 'custom'}
            >
              {isDarkMode ? <FaSun /> : <FaMoon />}
              <span>{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          {/* Pre-built Themes */}
          <div className="theme-section">
            <h4>Themes</h4>
            {getAvailableThemes().map((theme) => (
              <label key={theme.id} className="theme-option" role="menuitem">
                <input 
                  type="radio" 
                  name="theme"
                  checked={currentTheme === theme.id}
                  onChange={() => switchTheme(theme.id)}
                />
                <span className="theme-name">{theme.name}</span>
                <div className="theme-preview">
                  {Object.entries(theme.colors).map(([key, color]) => (
                    <div
                      key={key}
                      className="color-preview"
                      style={{ backgroundColor: color as string }}
                      title={key}
                    />
                  ))}
                </div>
              </label>
            ))}
          </div>

          {/* Custom Theme Creator */}
          <div className="theme-section">
            <button
              className="custom-theme-btn"
              onClick={() => setShowCustomizer(!showCustomizer)}
            >
              <FaPalette />
              <span>Custom Colors</span>
            </button>
          </div>

          {/* Accessibility Options */}
          <div className="theme-section">
            <h4>Accessibility</h4>
            <label className="accessibility-option" role="menuitem">
              <input 
                type="checkbox" 
                checked={currentTheme === 'high-contrast'}
                onChange={(e) => switchTheme(e.target.checked ? 'high-contrast' : 'default-dark')}
              />
              High visibility mode
            </label>
          </div>
        </div>
      )}

      {/* Custom Color Picker */}
      {showCustomizer && (
        <div className="custom-theme-panel">
          <h4>Create Custom Theme</h4>
          <div className="color-inputs">
            {Object.entries(customColors).map(([key, value]) => (
              <div key={key} className="color-input-group">
                <label htmlFor={`color-${key}`}>
                  {key.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </label>
                <div className="color-input-wrapper">
                  <input
                    id={`color-${key}`}
                    type="color"
                    value={value}
                    onChange={(e) => handleCustomColorChange(key, e.target.value)}
                    className="color-input"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleCustomColorChange(key, e.target.value)}
                    className="color-text-input"
                    placeholder="#000000"
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="custom-theme-actions">
            <button onClick={applyCustomTheme} className="apply-theme-btn">
              Apply Theme
            </button>
            <button onClick={() => setShowCustomizer(false)} className="cancel-btn">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeSwitcher