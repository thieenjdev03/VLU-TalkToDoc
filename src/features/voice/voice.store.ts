import { create } from 'zustand'
import { persist } from 'zustand/middleware'

import { VoiceId } from './voice.const'

interface VoiceStore {
  enabled: boolean
  selected: VoiceId | null
  setEnabled: (enabled: boolean) => void
  setSelected: (voiceId: VoiceId | null) => void
  reset: () => void
}

export const useVoiceStore = create<VoiceStore>()(
  persist(
    (set) => ({
      enabled: false,
      selected: 'linh-vi', // Default to Linh
      setEnabled: (enabled) => set({ enabled }),
      setSelected: (selected) => set({ selected }),
      reset: () => set({ enabled: false, selected: 'linh-vi' })
    }),
    {
      name: 'voice-storage',
      partialize: (state) => ({
        enabled: state.enabled,
        selected: state.selected
      })
    }
  )
)
