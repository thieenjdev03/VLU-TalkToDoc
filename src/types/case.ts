export type CaseTableFilterValue = string | Date | null

export type CaseTableFilters = {
  name: string
  status: string
  startDate: Date | null
  endDate: Date | null
}

// ----------------------------------------------------------------------

export type CaseHistory = {
  createdTime: Date
  updatedTime: Date
  closedTime: Date
  timeline: {
    title: string
    time: Date
  }[]
}

export type CaseContact = {
  fullName: string
  phoneNumber: string
  email: string
  address: string
}

export type CaseAssignee = {
  id: string
  name: string
  fullName: string
  email: string
  avatarUrl: string
  role: string
}

export type CaseNote = {
  id: string
  content: string
  createdBy: string
  createdAt: Date
}

export type CaseItem = {
  id: string
  caseNumber: string
  status: string
  priority: string
  subject: string
  description: string
  contact: CaseContact
  assignee: CaseAssignee
  notes: CaseNote[]
  history: CaseHistory
  createdAt: Date
  updatedAt: Date
}

export type CaseOffer = {
  createdAt: Date
  shippingAddress: string
  shippingPhone: string
  _id: string
  createdBy: CaseAssignee
  note: string
  medications: CaseMedication[]
  pharmacyId: {
    _id: string
    name: string
  }
}

export type CaseMedication = {
  medicationId: string
  _id?: string
  name: string
  dosage: string
  usage: string
  duration: string
  price?: number
  quantity?: number
}

export type PatientDetails = {
  _id: string
  fullName: string
  email?: string
  phoneNumber?: string
  address?: string
  [key: string]: any
}

export type CaseDetails = {
  data: {
    _id: string
    patient: PatientDetails
    specialty: any
    medicalForm?: any
    appointmentId: any
    status: string
    offers: CaseOffer[]
    createdAt: Date
    updatedAt: Date
    history: CaseHistory
  }
}
