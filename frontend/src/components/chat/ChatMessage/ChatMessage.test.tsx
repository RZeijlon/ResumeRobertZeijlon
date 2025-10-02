import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import ChatMessage from './ChatMessage'
import type { Message } from '../../../types'

describe('ChatMessage', () => {
  const mockMessage: Message = {
    id: '1',
    content: 'Test message content',
    role: 'user',
    timestamp: new Date('2025-01-01T12:00:00')
  }

  it('renders message content', () => {
    render(<ChatMessage message={mockMessage} />)
    expect(screen.getByText('Test message content')).toBeInTheDocument()
  })

  it('renders timestamp formatted correctly', () => {
    render(<ChatMessage message={mockMessage} />)
    expect(screen.getByText(/12:00/i)).toBeInTheDocument()
  })

  it('applies user role class', () => {
    const { container } = render(<ChatMessage message={mockMessage} />)
    const messageDiv = container.querySelector('.message.user')
    expect(messageDiv).toBeInTheDocument()
  })

  it('applies assistant role class', () => {
    const assistantMessage = { ...mockMessage, role: 'assistant' as const }
    const { container } = render(<ChatMessage message={assistantMessage} />)
    const messageDiv = container.querySelector('.message.assistant')
    expect(messageDiv).toBeInTheDocument()
  })
})
