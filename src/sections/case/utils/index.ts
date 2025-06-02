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
