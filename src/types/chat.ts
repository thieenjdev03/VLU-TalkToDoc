// ----------------------------------------------------------------------
export type IChatAttachment = {
  id: string
  name: string
  size: number
  type: string
  url: string
  preview: string
  createdAt: Date
  modifiedAt: Date
}

export interface IChatMessage {
  id: string
  _id: string
  body: string
  content: string
  contentType: string
  attachments: IChatAttachment[]
  createdAt: string
  senderId: string
  role: string
  imageUrls: string[]
  appointmentSuggestion?: {
    type?: 'new_appointment' | 'follow_up' | 'emergency'
    doctorId: string
    doctorName: string
    doctorAvatar?: string
    doctorSpecialty: string
    suggestedDate: string
    suggestedTime: string
    reason: string
    estimatedDuration: number
    isFollowUp?: boolean
    lastAppointmentId?: string
    followUpReason?: string
    location?: string
    price?: number
    confirmationRequired?: boolean
    confirmationMessage?: string
  }
}

export interface IChatParticipant {
  id: string
  name: string
  status: 'online' | 'offline' | 'away'
  avatarUrl: string
  role: string
  address?: string
  phoneNumber?: string
  email?: string
}

export interface IChatConversation {
  id: string
  _id: string
  participants: IChatParticipant[]
  messages: IChatMessage[]
  unreadCount: number
  type: 'single' | 'group'
}

export interface IChatConversations {
  byId: Record<string, IChatConversation>
  allIds: string[]
}

export interface IChatResponse {
  reply: string
  messages: IChatMessage[]
  appointmentSuggestion?: {
    type?: 'new_appointment' | 'follow_up' | 'emergency'
    doctorId: string
    doctorName: string
    doctorAvatar?: string
    doctorSpecialty: string
    suggestedDate: string
    suggestedTime: string
    reason: string
    estimatedDuration: number
    isFollowUp?: boolean
    lastAppointmentId?: string
    followUpReason?: string
    location?: string
    price?: number
    confirmationRequired?: boolean
    confirmationMessage?: string
  }
}

// JSON Response Types for Chat API
export type JsonResponseType = 
  | 'appointment_info'
  | 'appointment_suggestion'
  | 'symptom_analysis'
  | 'patient_info'
  | 'general_info'
  | 'follow_up_appointment'

// Enhanced Specialty Interface
export interface Specialty {
  id: string
  name: string
  description: string
}

// Backend Specialty Structure (nested)
export interface BackendSpecialty {
  id: {
    _id: string
    name: string
    description: string
    isActive: boolean
    config: Record<string, any>
    createdAt: string
    updatedAt: string
    id: string
    __v: number
    avatarUrl?: string
  }
  name: string
}

// Enhanced Doctor Interface
export interface Doctor {
  id: string
  doctorId: string
  name: string
  fullName?: string // Add fullName field
  specialty: (Specialty | BackendSpecialty)[] // Support both structures
  experienceYears: number
  rating: number
  position: string
  hospital: string
  nextAvailableSlot?: string
  price?: number
  avatar?: string
  phone?: string
  email?: string
  address?: string
  bio?: string
  education?: string[]
  certifications?: string[]
  languages?: string[]
  consultationFee?: number
  followUpFee?: number
  emergencyFee?: number
  // Additional fields from backend
  score?: number
  specialtyMatchType?: string
  availabilityCount?: number
}

export interface AppointmentInfo {
  hasAppointment: boolean
  totalAppointments: number
  nextAppointment?: {
    appointmentId: string
    patient: string
    specialty: string
    date: string
    slot: string
    timezone: string
    status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED'
    reason: string
    doctorNote?: string
    doctor: {
      id: string
      _id: string
      username: string
      email: string
      fullName: string
      phoneNumber: string
      isActive: boolean
      avatarUrl: string
      city: string | null
      role: string
      specialty: (Specialty | BackendSpecialty)[]
      hospital: string
      experienceYears: number
      licenseNo: string
      rank: string
      position: string
      availability: any[]
      createdAt: string
      updatedAt: string
      bank: any | null
      performanceScore: number
      avgScore: number
      lastLoggedIn: string
      wallet: {
        balance: number
        transactionHistory: any[]
        lastUpdated: string
        _id: string
      }
      __v: number
      registrationStatus: string
      ratingDetails: any[]
      performanceScoreLogs: any[]
    }
    payment: {
      platformFee: number
      doctorFee: number
      discount: number
      total: number
      status: string
      paymentMethod: string
    }
    createdAt: string
    confirmedAt?: string
    completedAt?: string
    cancelledAt?: string
  }
  recentAppointments: Array<{
    appointmentId: string
    patient: string
    doctor: {
      id: string
      _id: string
      username: string
      email: string
      fullName: string
      phoneNumber: string
      isActive: boolean
      avatarUrl: string
      city: string | null
      role: string
      specialty: (Specialty | BackendSpecialty)[]
      hospital: string
      experienceYears: number
      licenseNo: string
      rank: string
      position: string
      availability: any[]
      createdAt: string
      updatedAt: string
      bank: any | null
      performanceScore: number
      avgScore: number
      lastLoggedIn: string
      wallet: {
        balance: number
        transactionHistory: any[]
        lastUpdated: string
        _id: string
      }
      __v: number
      registrationStatus: string
      ratingDetails: any[]
      performanceScoreLogs: any[]
    }
    specialty: string
    date: string
    slot: string
    timezone: string
    status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED'
    reason?: string
    doctorNote?: string
    payment: {
      platformFee: number
      doctorFee: number
      discount: number
      total: number
      status: string
      paymentMethod: string
    }
    createdAt: string
    confirmedAt?: string
    completedAt?: string
    cancelledAt?: string
  }>
  doctorInfo?: {
    id: string
    _id: string
    name: string
    specialty: string[]
    hospital: string
  }
  patientInfo?: {
    _id: string
    name: string
  }
}


export interface TimeSlot {
  id?: string // Unique ID for slot
  time: string
  timeStart: string
  timeEnd: string
  available: boolean
  price: number
}

export interface SuggestedTimeSlots {
  date: string
  dayOfWeek: string
  slots: TimeSlot[]
}

export interface Pricing {
  platformFee: number
  doctorFee: number
  discount: number
  total: number
  currency: string
}

export interface BookingInfo {
  minAdvanceBooking: string
  maxAdvanceBooking: string
  cancellationPolicy: string
  reschedulePolicy: string
}

export interface AppointmentSuggestion {
  type: 'new_appointment' | 'follow_up' | 'emergency'
  suggested: boolean
  reason: string
  urgency: 'normal' | 'urgent' | 'emergency'
  recommendedSpecialty: string
  recommendedSpecialties?: string[] // New field for multiple specialties
  detectedSymptoms?: string[] // New field for detected symptoms
  estimatedWaitTime: string
  availableDoctors?: Doctor[]
  recommendedDoctors?: Doctor[] // Optimized version with fewer doctors
  suggestedTimeSlots?: SuggestedTimeSlots[] | []
  availableSlots?: SuggestedTimeSlots[] // Optimized version with fewer days
  pricing?: Pricing
  bookingInfo?: BookingInfo
  // Legacy fields for backward compatibility
  suggestedDate?: string
  suggestedTime?: string
  doctorId?: string
  doctorName?: string
  doctorSpecialty?: string
  location?: string
  price?: number
}

export interface SymptomAnalysis {
  symptoms: string[]
  severity: 'mild' | 'moderate' | 'severe'
  recommendation: string
  suggestedSpecialty: string
  urgency: 'normal' | 'urgent' | 'emergency'
  followUpRequired?: boolean
  followUpTime?: string
}

export interface PatientInfo {
  hasInfo: boolean
  name?: string
  age?: string
  gender?: string
  phone?: string
  email?: string
  address?: string
  medicalHistory?: string[]
  allergies?: string[]
}

export interface GeneralInfo {
  message: string
  timestamp: string
  suggestions?: string[]
  quickActions?: Array<{
    label: string
    action: string
    type: string
  }>
}

export interface FollowUpAppointment {
  follow_up: boolean
  appointments: Array<{
    appointmentId: string
    patient: string
    doctor: string
    specialty: string
    date: string
    slot: string
    timezone: string
    status: 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED'
    reason: string
    doctorNote: string
    payment: {
      platformFee: number
      doctorFee: number
      discount: number
      total: number
      status: string
      paymentMethod: string
    }
    createdAt: string
    confirmedAt?: string
    completedAt?: string
    cancelledAt?: string
  }>
  doctorInfo?: {
    id: string
    _id: string
    name: string
    specialty: string[]
    hospital: string
  }
  patientInfo?: {
    _id: string
    name: string
  }
}

export interface ChatJsonData {
  type: JsonResponseType
  data: AppointmentInfo | AppointmentSuggestion | SymptomAnalysis | PatientInfo | GeneralInfo | FollowUpAppointment
}

export interface ChatJsonResponse {
  success: boolean
  reply: string
  jsonData?: ChatJsonData
  timestamp: string
  model: string
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
}

export interface ChatJsonRequest {
  message: string
  user_id: string
  imageUrls?: string[]
  model?: string
  requireJsonResponse?: boolean
  jsonResponseType?: JsonResponseType
}
