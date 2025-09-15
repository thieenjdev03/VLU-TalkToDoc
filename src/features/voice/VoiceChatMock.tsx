import React, { useRef, useState } from 'react'

import { Waveform } from './Waveform'
import { useVoiceStore } from './voice.store'
import { VOICES, VoiceState, VOICE_STATE, VOICE_MESSAGES } from './voice.const'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  isVoice?: boolean
  timestamp: Date
}

interface VoiceChatMockProps {
  onBack?: () => void
  onSendMessage?: (message: string) => void
}

export const VoiceChatMock: React.FC<VoiceChatMockProps> = ({ 
  onBack, 
  onSendMessage 
}) => {
  const { selected } = useVoiceStore()
  const [voiceState, setVoiceState] = useState<VoiceState>(VOICE_STATE.IDLE)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: VOICE_MESSAGES.welcome,
      timestamp: new Date()
    }
  ])
  const [textInput, setTextInput] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const pressTimerRef = useRef<NodeJS.Timeout | null>(null)

  const selectedVoice = VOICES.find(v => v.id === selected)

  const handleMicPress = () => {
    setVoiceState(VOICE_STATE.RECORDING)
    
    // Simulate recording duration (2-5 seconds)
    const recordingDuration = Math.random() * 3000 + 2000
    
    pressTimerRef.current = setTimeout(() => {
      handleMicRelease()
    }, recordingDuration)
  }

  const handleMicRelease = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current)
      pressTimerRef.current = null
    }
    
    setVoiceState(VOICE_STATE.PROCESSING)
    setIsProcessing(true)

    // Simulate processing time
    setTimeout(() => {
      // Add user voice message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: VOICE_MESSAGES.transcriptMock,
        isVoice: true,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, userMessage])

      // Add AI response after a short delay
      setTimeout(() => {
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: VOICE_MESSAGES.aiReply,
          timestamp: new Date()
        }

        setMessages(prev => [...prev, aiMessage])
        setIsProcessing(false)
        setVoiceState(VOICE_STATE.IDLE)
      }, 1500)
    }, 2000)
  }

  const handleTextSend = () => {
    if (textInput.trim() && onSendMessage) {
      onSendMessage(textInput.trim())
      setTextInput('')
    }
  }

  const handleTTSPlay = () => {
    // Mock TTS - show toast notification
    const toast = document.createElement('div')
    toast.className = 'fixed top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg z-50'
    toast.textContent = `TTS mock: ${selectedVoice?.name || 'Unknown'}`
    document.body.appendChild(toast)

    setTimeout(() => {
      document.body.removeChild(toast)
    }, 3000)
  }

  const getMicButtonStyle = () => {
    switch (voiceState) {
      case VOICE_STATE.RECORDING:
        return 'bg-red-500 hover:bg-red-600'
      case VOICE_STATE.PROCESSING:
        return 'bg-gray-400 cursor-not-allowed'
      default:
        return 'bg-blue-600 hover:bg-blue-700'
    }
  }

  const getMicIcon = () => {
    switch (voiceState) {
      case VOICE_STATE.RECORDING:
        return (
          <div className="w-4 h-4 bg-white rounded-full animate-pulse" />
        )
      case VOICE_STATE.PROCESSING:
        return (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        )
      default:
        return (
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
          </svg>
        )
    }
  }

  return (
    <div className="h-full bg-gray-50 flex flex-col">
      {/* Voice Status Indicator */}
      <div className="bg-blue-50 border-b border-blue-200 px-4 py-2">
        <div className="flex items-center justify-center space-x-2">
          <span className="text-sm font-medium text-blue-700">
            Voice Chat - {selectedVoice?.name}
          </span>
          {voiceState === VOICE_STATE.RECORDING && (
            <>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <span className="text-sm text-red-600">Đang ghi âm...</span>
            </>
          )}
          {voiceState === VOICE_STATE.PROCESSING && (
            <>
              <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-blue-600">Đang xử lý...</span>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-900 shadow-sm border border-gray-200'
              }`}
            >
              <div className="flex items-start space-x-2">
                <div className="flex-1">
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.isVoice && (
                    <div className="flex items-center mt-1 space-x-1">
                      <span className="text-xs opacity-75">🎤 Voice</span>
                    </div>
                  )}
                </div>
                {message.role === 'assistant' && (
                  <button
                    type="button"
                    onClick={handleTTSPlay}
                    className="flex-shrink-0 text-blue-600 hover:text-blue-800 transition-colors"
                    title={`Phát bằng giọng ${selectedVoice?.name}`}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Processing Indicator */}
        {isProcessing && (
          <div className="flex justify-start">
            <div className="bg-white shadow-sm border border-gray-200 rounded-2xl px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
                <span className="text-sm text-gray-600">AI đang suy nghĩ...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Waveform Display */}
      {voiceState === VOICE_STATE.RECORDING && (
        <div className="px-4 py-3 bg-blue-100 border-t border-blue-300">
          <div className="flex items-center justify-center space-x-4">
            <Waveform active className="h-10" />
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="bg-white border-t border-gray-200 p-4">
        <div className="flex items-end space-x-3">
          {/* Text Input */}
          <div className="flex-1">
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Nhập tin nhắn hoặc nhấn giữ mic để ghi âm..."
              className="w-full p-3 border border-gray-300 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={1}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleTextSend()
                }
              }}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2">
            {/* Mic Button */}
            <button
              type="button"
              onMouseDown={handleMicPress}
              onMouseUp={handleMicRelease}
              onMouseLeave={handleMicRelease}
              onTouchStart={handleMicPress}
              onTouchEnd={handleMicRelease}
              disabled={voiceState === VOICE_STATE.PROCESSING}
              className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg text-white transition-all duration-200 ${getMicButtonStyle()} ${
                voiceState === VOICE_STATE.RECORDING ? 'scale-110' : ''
              }`}
              title="Nhấn giữ để ghi âm"
            >
              {getMicIcon()}
            </button>

            {/* Send Button */}
            <button
              type="button"
              onClick={handleTextSend}
              disabled={!textInput.trim()}
              className={`h-12 w-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 ${
                textInput.trim()
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              title="Gửi tin nhắn"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>

        {/* Footer Disclaimer */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            *Đây là bản mock UI – không thu âm/ gửi dữ liệu thật.
          </p>
        </div>
      </div>
    </div>
  )
}
