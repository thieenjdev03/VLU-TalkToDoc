import React, { useState } from 'react'

import { VoiceIntro, VoicePicker, VoiceChatMock } from 'src/features/voice'

type VoiceChatStep = 'intro' | 'picker' | 'chat'

export default function VoiceChatPage() {
  const [currentStep, setCurrentStep] = useState<VoiceChatStep>('intro')

  const handleContinue = () => {
    setCurrentStep('picker')
  }

  const handleStart = () => {
    setCurrentStep('chat')
  }

  const handleBackToPicker = () => {
    setCurrentStep('picker')
  }

  const handleBackToIntro = () => {
    setCurrentStep('intro')
  }

  const handleSendMessage = (message: string) => {
    console.log('Sending message:', message)
    // This could integrate with your existing chat system
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'intro':
        return <VoiceIntro onContinue={handleContinue} />
      case 'picker':
        return (
          <VoicePicker
            onStart={handleStart}
            onBack={handleBackToIntro}
          />
        )
      case 'chat':
        return (
          <VoiceChatMock
            onBack={handleBackToPicker}
            onSendMessage={handleSendMessage}
          />
        )
      default:
        return <VoiceIntro onContinue={handleContinue} />
    }
  }

  return (
    <div className="voice-chat-container">
      {renderCurrentStep()}
    </div>
  )
}
