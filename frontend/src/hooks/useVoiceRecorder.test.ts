import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useVoiceRecorder } from './useVoiceRecorder'

// Mock MediaRecorder
global.MediaRecorder = vi.fn().mockImplementation(() => ({
  start: vi.fn(),
  stop: vi.fn(),
  ondataavailable: null,
  onstop: null,
  state: 'inactive'
})) as any

// Mock navigator.mediaDevices
global.navigator.mediaDevices = {
  getUserMedia: vi.fn().mockResolvedValue({
    getTracks: () => [{ stop: vi.fn() }]
  })
} as any

describe('useVoiceRecorder', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with correct default state', () => {
    const { result } = renderHook(() => useVoiceRecorder())

    expect(result.current.isRecording).toBe(false)
    expect(result.current.isTranscribing).toBe(false)
  })

  it('starts recording when startRecording is called', async () => {
    const { result } = renderHook(() => useVoiceRecorder())

    await act(async () => {
      await result.current.startRecording()
    })

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({ audio: true })
    expect(result.current.isRecording).toBe(true)
  })

  it('stops recording when stopRecording is called', async () => {
    const { result } = renderHook(() => useVoiceRecorder())

    await act(async () => {
      await result.current.startRecording()
    })

    act(() => {
      result.current.stopRecording()
    })

    expect(result.current.isRecording).toBe(false)
  })

  it('toggles recording state', async () => {
    const { result } = renderHook(() => useVoiceRecorder())

    expect(result.current.isRecording).toBe(false)

    await act(async () => {
      await result.current.toggleRecording()
    })

    expect(result.current.isRecording).toBe(true)

    act(() => {
      result.current.toggleRecording()
    })

    expect(result.current.isRecording).toBe(false)
  })
})
