import { FaBars, FaTimes } from 'react-icons/fa'
import { useContent } from '../../../contexts'
import AccessibilityMenu from '../../shared/AccessibilityMenu'
import SimpleThemeSwitcher from '../../shared/SimpleThemeSwitcher'
import type { NavbarItem } from '../../../types'

interface HeaderProps {
  isMobile: boolean
  showMobileMenu: boolean
  setShowMobileMenu: (show: boolean) => void
  onOpenChat: () => void
}

export const Header = ({ isMobile, showMobileMenu, setShowMobileMenu, onOpenChat }: HeaderProps) => {
  const { personalInfo, siteConfig, getNavbarItems } = useContent()

  if (!personalInfo || !siteConfig) return null

  const navbarItems = getNavbarItems()

  return (
    <header className="header">
      <nav className="nav" role="navigation" aria-label="Main navigation">
        <div className="nav-left">
          <img
            src="/page_content/assets/images/profile.jpg"
            alt={personalInfo.name}
            className="profile-image"
          />
          <AccessibilityMenu />
        </div>

        <div className="nav-content">
          {!(showMobileMenu && isMobile) && <h1>{personalInfo.name}</h1>}

          {/* Desktop Navigation */}
          <ul className="nav-links desktop-nav">
            {navbarItems.map((item: NavbarItem) => (
              <li key={item.id}>
                <a href={`#${item.id}`}>{item.label}</a>
              </li>
            ))}
            {siteConfig.features.chatBot.enabled && (
              <li>
                <button className="chat-nav-button" onClick={onOpenChat}>
                  Chat
                </button>
              </li>
            )}
            <li className="theme-switcher-nav">
              <SimpleThemeSwitcher />
            </li>
          </ul>

          {/* Mobile Hamburger Menu */}
          <button
            className="mobile-menu-toggle"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Toggle navigation menu"
            aria-expanded={showMobileMenu}
          >
            {showMobileMenu ? <FaTimes /> : <FaBars />}
          </button>

          {/* Mobile Navigation Menu */}
          {showMobileMenu && (
            <ul className="nav-links mobile-nav">
              {navbarItems.map((item: NavbarItem) => (
                <li key={item.id}>
                  <a
                    href={`#${item.id}`}
                    onClick={() => setShowMobileMenu(false)}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
              {siteConfig.features.chatBot.enabled && (
                <li>
                  <button className="chat-nav-button" onClick={onOpenChat}>
                    Chat
                  </button>
                </li>
              )}
              <li className="theme-switcher-mobile">
                <SimpleThemeSwitcher showLabel={true} />
              </li>
            </ul>
          )}
        </div>
      </nav>
    </header>
  )
}

export default Header
