import { create } from 'zustand'

const LOCAL_KEY = 'booking_form_data'

type BookingFormData = Record<string, any>

export const useBookingStore = create<{
  formData: BookingFormData
  setFormData: (data: BookingFormData) => void
  updateFormData: (patch: BookingFormData) => void
  resetFormData: () => void
}>((set, get) => ({
  formData: (() => {
    try {
      return JSON.parse(localStorage.getItem(LOCAL_KEY) || '{}') || {}
    } catch {
      return {}
    }
  })(),
  setFormData: (data: BookingFormData) => {
    set({ formData: data })
    localStorage.setItem(LOCAL_KEY, JSON.stringify(data))
  },
  updateFormData: (patch: BookingFormData) => {
    const current = get().formData as BookingFormData
    const newData = { ...current, ...patch }
    set({ formData: newData })
    localStorage.setItem(LOCAL_KEY, JSON.stringify(newData))
  },
  resetFormData: () => {
    set({ formData: {} })
    localStorage.removeItem(LOCAL_KEY)
  }
}))
