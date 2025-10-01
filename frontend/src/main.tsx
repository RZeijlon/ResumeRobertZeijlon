import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ContentProvider } from './contexts/ContentContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { useContent } from './contexts/ContentContext'

// Wrapper component to access content context for theme provider
function AppWithProviders() {
  return (
    <ContentProvider>
      <ThemeWrapper />
    </ContentProvider>
  )
}

function ThemeWrapper() {
  const { themeConfig } = useContent()

  return (
    <ThemeProvider themeConfig={themeConfig}>
      <App />
    </ThemeProvider>
  )
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithProviders />
  </StrictMode>,
)
