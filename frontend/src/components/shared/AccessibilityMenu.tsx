import React, { useState } from 'react'
import { FaUniversalAccess } from 'react-icons/fa'
import { useTheme } from '../../contexts'

export const AccessibilityMenu: React.FC = () => {
  const [showMenu, setShowMenu] = useState(false)
  const { currentTheme, animationsEnabled, switchTheme, toggleAnimations } = useTheme()

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
              className="large-checkbox"
            />
            <span className="checkbox-label">High contrast</span>
          </label>
          
          <label className="accessibility-option" role="menuitem">
            <input 
              type="checkbox" 
              checked={!animationsEnabled}
              onChange={() => toggleAnimations()}
              className="large-checkbox"
            />
            <span className="checkbox-label">Reduce animations</span>
          </label>
        </div>
      )}
    </div>
  )
}

export default AccessibilityMenu