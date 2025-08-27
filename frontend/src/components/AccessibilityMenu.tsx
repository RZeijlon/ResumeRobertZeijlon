import React, { useState } from 'react'
import { FaUniversalAccess } from 'react-icons/fa'
import { useThemeManager } from '../hooks/useThemeManager'

interface AccessibilityMenuProps {
  themeManager: ReturnType<typeof useThemeManager>
}

export const AccessibilityMenu: React.FC<AccessibilityMenuProps> = ({ themeManager }) => {
  const [showMenu, setShowMenu] = useState(false)

  const { currentTheme, switchTheme, getCurrentThemeConfig } = themeManager
  const currentThemeConfig = getCurrentThemeConfig()

  const handleHighVisibilityToggle = (enabled: boolean) => {
    if (enabled) {
      switchTheme('high-contrast')
    } else {
      switchTheme('default-dark')
    }
    setShowMenu(false)
  }

  return (
    <div className="accessibility-menu-wrapper">
      <button 
        className="accessibility-toggle"
        onClick={() => setShowMenu(!showMenu)}
        aria-label="Accessibility options"
        aria-expanded={showMenu}
      >
        <FaUniversalAccess />
      </button>
      
      {showMenu && (
        <div className="accessibility-menu" role="menu">
          <div className="accessibility-header">
            <h4>Accessibility</h4>
          </div>
          
          <label className="accessibility-option" role="menuitem">
            <input 
              type="checkbox" 
              checked={currentTheme === 'high-contrast'}
              onChange={(e) => handleHighVisibilityToggle(e.target.checked)}
            />
            <span className="checkbox-label">High visibility mode</span>
            <small className="option-description">
              High contrast colors and larger text
            </small>
          </label>
          
          <label className="accessibility-option" role="menuitem">
            <input 
              type="checkbox" 
              checked={currentThemeConfig ? !currentThemeConfig.effects.animations : false}
              onChange={() => {
                // This would need to be handled by updating the theme config
                // For now, high-contrast mode automatically disables animations
              }}
              disabled={currentTheme === 'high-contrast'}
            />
            <span className="checkbox-label">Reduce animations</span>
            <small className="option-description">
              Minimize motion and transitions
            </small>
          </label>

          <div className="accessibility-info">
            <small>
              These settings improve accessibility for users with visual impairments or motion sensitivity.
            </small>
          </div>
        </div>
      )}
    </div>
  )
}

export default AccessibilityMenu