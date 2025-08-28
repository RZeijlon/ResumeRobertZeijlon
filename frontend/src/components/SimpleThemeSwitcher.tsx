import React from 'react'
import { FaMoon, FaSun } from 'react-icons/fa'
import { useThemeManager } from '../hooks/useThemeManager'

interface SimpleThemeSwitcherProps {
  themeManager: ReturnType<typeof useThemeManager>
  showLabel?: boolean
}

export const SimpleThemeSwitcher: React.FC<SimpleThemeSwitcherProps> = ({ 
  themeManager, 
  showLabel = false 
}) => {
  const { isDarkMode, toggleDarkMode } = themeManager

  return (
    <div className="simple-theme-switcher">
      <button 
        className="theme-toggle-button"
        onClick={toggleDarkMode}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? <FaSun /> : <FaMoon />}
        {showLabel && <span>{isDarkMode ? 'Light' : 'Dark'}</span>}
      </button>
    </div>
  )
}

export default SimpleThemeSwitcher