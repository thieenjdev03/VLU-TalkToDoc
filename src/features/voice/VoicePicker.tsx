import React from 'react'

import { useVoiceStore } from './voice.store'
import { VOICES, VoiceId } from './voice.const'

interface VoicePickerProps {
  onStart: () => void
  onBack?: () => void
}

export const VoicePicker: React.FC<VoicePickerProps> = ({ onStart, onBack }) => {
  const { selected, setSelected } = useVoiceStore()

  const handleVoiceSelect = (voiceId: VoiceId) => {
    setSelected(voiceId)
  }

  const handleStart = () => {
    if (selected) {
      onStart()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          {/* Header */}
          <div className="text-center mb-8">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="absolute left-8 top-8 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Chọn giọng nói của bạn
            </h1>
            <p className="text-lg text-gray-600">
              Lựa chọn giọng nói phù hợp để trò chuyện với AI
            </p>
          </div>

          {/* Voice Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
            {VOICES.map((voice) => (
              <div
                key={voice.id}
                onClick={() => handleVoiceSelect(voice.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleVoiceSelect(voice.id)
                  }
                }}
                role="button"
                tabIndex={0}
                className={`relative cursor-pointer transition-all duration-200 ${
                  selected === voice.id
                    ? 'ring-4 ring-blue-500 ring-opacity-50 scale-105'
                    : 'hover:scale-102 hover:shadow-lg'
                }`}
              >
                <div className="bg-white rounded-2xl p-6 shadow-md border border-gray-100">
                  {/* Avatar */}
                  <div className="flex items-center mb-4">
                    <div
                      className={`w-16 h-16 rounded-full bg-gradient-to-r ${voice.gradient} flex items-center justify-center text-white text-2xl font-bold shadow-lg`}
                    >
                      {voice.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <h3 className="text-xl font-semibold text-gray-900">
                        {voice.name}
                      </h3>
                      <p className="text-sm text-gray-500 capitalize">
                        {voice.gender === 'male' ? 'Nam' : 'Nữ'} • {voice.locale}
                      </p>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {voice.desc}
                  </p>

                  {/* Selection Indicator */}
                  {selected === voice.id && (
                    <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {onBack && (
              <button
                type="button"
                onClick={onBack}
                className="px-8 py-4 border border-gray-300 text-gray-700 font-semibold rounded-2xl hover:bg-gray-50 transition-colors duration-200"
              >
                Quay lại
              </button>
            )}
            <button
              type="button"
              onClick={handleStart}
              disabled={!selected}
              className={`px-8 py-4 font-semibold rounded-2xl transition-all duration-200 ${
                selected
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              Bắt đầu
            </button>
          </div>

          {/* Footer Disclaimer */}
          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              *Đây là bản mock UI – không thu âm/ gửi dữ liệu thật.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
