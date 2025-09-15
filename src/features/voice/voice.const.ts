export type VoiceId = 'arbor-en' | 'sky-en' | 'linh-vi' | 'minh-vi'

export interface Voice {
  id: VoiceId
  name: string
  desc: string
  locale: string
  gender: 'male' | 'female'
  gradient: string
}

export const VOICES: Voice[] = [
  {
    id: 'arbor-en',
    name: 'Arbor',
    desc: 'Easygoing & versatile',
    locale: 'en-US',
    gender: 'female',
    gradient: 'from-blue-400 to-purple-500'
  },
  {
    id: 'sky-en',
    name: 'Sky',
    desc: 'Warm & friendly',
    locale: 'en-US',
    gender: 'male',
    gradient: 'from-sky-400 to-blue-500'
  },
  {
    id: 'linh-vi',
    name: 'Linh',
    desc: 'Nữ, tự nhiên',
    locale: 'vi-VN',
    gender: 'female',
    gradient: 'from-pink-400 to-rose-500'
  },
  {
    id: 'minh-vi',
    name: 'Minh',
    desc: 'Nam, rõ ràng',
    locale: 'vi-VN',
    gender: 'male',
    gradient: 'from-emerald-400 to-teal-500'
  }
]

export const VOICE_MESSAGES = {
  welcome: 'Chào bạn, mình là trợ lý sức khỏe TalkToDoc.',
  transcriptMock: 'Xin chào bác sĩ, em cần tư vấn dinh dưỡng.',
  aiReply: 'Để bắt đầu, bạn cho mình biết chiều cao, cân nặng và mục tiêu nhé.'
}

export const VOICE_STATE = {
  IDLE: 'idle',
  RECORDING: 'recording',
  PROCESSING: 'processing'
} as const

export type VoiceState = typeof VOICE_STATE[keyof typeof VOICE_STATE]
