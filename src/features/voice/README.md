# Voice Chat Feature

A mock Voice Chat UI implementation for TalkToDoc system.

## Overview

This feature provides a complete voice chat interface with three main screens:
1. **VoiceIntro** - Introduction screen with feature highlights
2. **VoicePicker** - Voice selection screen with multiple voice options
3. **VoiceChatMock** - Chat interface with mock voice recording and playback

## Features

- 🎤 Mock voice recording with visual waveform
- 🎭 Multiple voice options (Arbor, Sky, Linh, Minh)
- 💬 Chat interface with voice message indicators
- 🔊 Mock TTS playback with toast notifications
- 📱 Responsive design (mobile-first)
- 🎨 TalkToDoc brand colors and styling
- 💾 Voice preferences saved in localStorage

## Usage

### Access Voice Chat

1. Navigate to `/dashboard/voice-chat` in your browser
2. Or click the microphone icon in the regular chat interface

### Voice Chat Flow

1. **Introduction Screen**: Click "Tiếp tục" to proceed
2. **Voice Selection**: Choose your preferred voice and click "Bắt đầu"
3. **Chat Interface**: 
   - Hold the microphone button to "record" a voice message
   - Release to send the message
   - Click the speaker icon on AI messages to "play" TTS
   - Use text input as normal

## Technical Details

### Components

- `VoiceIntro.tsx` - Introduction screen with feature highlights
- `VoicePicker.tsx` - Voice selection with grid layout
- `VoiceChatMock.tsx` - Main chat interface with mic button and waveform
- `Waveform.tsx` - Visual audio representation component

### State Management

- `voice.store.ts` - Zustand store for voice preferences
- Persists selected voice in localStorage
- Default voice: "Linh" (Vietnamese female)

### Styling

- Uses TailwindCSS for styling
- TalkToDoc brand colors:
  - Primary: `#004AAD` (blue)
  - Background: `#F2F7FF` (light blue)
- Rounded corners: `rounded-2xl` for modern look

### Mock Data

- `voice.const.ts` - Voice definitions and mock messages
- Predefined transcript: "Xin chào bác sĩ, em cần tư vấn dinh dưỡng"
- AI response: "Để bắt đầu, bạn cho mình biết chiều cao, cân nặng và mục tiêu nhé"

## Integration

The voice chat feature is integrated with the existing chat system:

- Added microphone button to chat header
- Route: `/dashboard/voice-chat`
- Uses existing routing and navigation patterns

## Notes

⚠️ **This is a UI mock only** - No actual audio recording, speech-to-text, or text-to-speech functionality is implemented.

The feature demonstrates the complete user interface and interaction flow for voice chat functionality.
