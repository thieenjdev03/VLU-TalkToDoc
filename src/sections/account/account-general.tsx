import { useState, useEffect } from 'react'

import { useGetHospital } from 'src/api/hospital'

import { IUserItem } from 'src/types/user'

import { getUserById } from '../../api/user'
import UserNewEditForm from '../user/user-new-edit-form'

export default function AccountGeneral({
  userProfile,
  setUserProfile
}: {
  userProfile: any
  setUserProfile: (userProfile: any) => void
}) {
  const [currentUser, setCurrentUser] = useState<IUserItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [hospitalList, setHospitalList] = useState<any[]>([])
  const { hospitals } = useGetHospital({
    query: '',
    page: 1,
    limit: 99,
    sortField: 'name',
    sortOrder: 'asc'
  })
  useEffect(() => {
    if (hospitals?.data?.length) {
      setHospitalList(hospitals?.data)
    }
  }, [hospitals])
  useEffect(() => {
    const userProfileStr = localStorage.getItem('userProfile')
    if (!userProfileStr) return

    const userProfile = JSON.parse(userProfileStr)
    const { _id, role } = userProfile
    if (!_id || !role) return

    const fetchUserProfile = async () => {
      try {
        const data = await getUserById(_id, role.toLowerCase())
        setCurrentUser({ ...data, role: data.role?.toLowerCase() })
        setUserProfile(data)
      } catch (error) {
        console.error('Lỗi khi fetch user:', error)
        setCurrentUser({ ...userProfile, role: role.toLowerCase() })
        setUserProfile(userProfile)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [])

  if (loading || !currentUser)
    return <div>Đang tải thông tin người dùng...</div>

  let walletBalance = 0
  let walletHistory = []

  if (currentUser.role === 'doctor') {
    walletBalance = currentUser.wallet?.balance || 0
    walletHistory = currentUser.wallet?.transactionHistory || []
  } else if (currentUser.role === 'patient') {
    walletBalance = currentUser.walletBalance || 0
    walletHistory = currentUser.walletHistory || []
  }

  return (
    <UserNewEditForm
      updateUserPage
      currentUser={currentUser}
      typeUser={
        currentUser.role as 'doctor' | 'patient' | 'employee' | 'user' | 'admin'
      }
      hospitals={hospitalList}
      isSettingAccount
    />
  )
}
