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
