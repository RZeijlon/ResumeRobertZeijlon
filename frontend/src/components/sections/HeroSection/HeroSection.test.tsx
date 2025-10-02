import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import HeroSection from './HeroSection'
import type { ContentItem } from '../../../types'

describe('HeroSection', () => {
  const mockContent: ContentItem = {
    id: 'hero',
    content: 'Hero content text',
    metadata: {
      title: 'Welcome to Portfolio',
      subtitle: 'AI/ML Engineer & Developer'
    },
    raw_content: '',
    file_path: 'sections/hero.md',
    last_modified: null
  }

  it('renders title from metadata', () => {
    render(<HeroSection sectionId="hero" content={mockContent} />)
    expect(screen.getByText('Welcome to Portfolio')).toBeInTheDocument()
  })

  it('renders subtitle when provided', () => {
    render(<HeroSection sectionId="hero" content={mockContent} />)
    expect(screen.getByText('AI/ML Engineer & Developer')).toBeInTheDocument()
  })

  it('renders content when available', () => {
    render(<HeroSection sectionId="hero" content={mockContent} />)
    expect(screen.getByText(/Hero content text/i)).toBeInTheDocument()
  })

  it('does not render subtitle when not provided', () => {
    const contentWithoutSubtitle = { ...mockContent, metadata: { title: 'Title Only' } }
    render(<HeroSection sectionId="hero" content={contentWithoutSubtitle} />)
    expect(screen.queryByText('AI/ML Engineer & Developer')).not.toBeInTheDocument()
  })

  it('applies correct section id', () => {
    const { container } = render(<HeroSection sectionId="test-hero" content={mockContent} />)
    const section = container.querySelector('#test-hero')
    expect(section).toBeInTheDocument()
  })
})
