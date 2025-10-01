import React from 'react'
import { FaMoon, FaSun } from 'react-icons/fa'
import { useTheme } from '../../contexts'

interface SimpleThemeSwitcherProps {
  showLabel?: boolean
}

export const SimpleThemeSwitcher: React.FC<SimpleThemeSwitcherProps> = ({
  showLabel = false
}) => {
  const { isDarkMode, toggleDarkMode } = useTheme()

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