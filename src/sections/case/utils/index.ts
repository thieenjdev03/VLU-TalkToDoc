export const renderAge = (birthDate: Date | string) => {
  const today = new Date()
  const dob = new Date(birthDate)
  const age = today.getFullYear() - dob.getFullYear()
  return age
}

export const renderGender = (gender: string) => {
  if (gender === 'MALE') return 'Nam'
  if (gender === 'FEMALE') return 'Nữ'
  return '____'
}

export const renderStatus = (status: string) => {
  if (status === 'PENDING') return 'Chờ xác nhận'
  if (status === 'COMPLETED') return 'Đã hoàn thành'
  if (status === 'IN_PROGRESS') return 'Đang tiến hành'
  if (status === 'CANCELLED') return 'Đã hủy'
  if (status === 'DRAFT') return 'Nháp'
  if (status === 'ASSIGNED') return 'Đã tiếp nhận'
  return '____'
}
