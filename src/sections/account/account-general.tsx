import { useMemo, useState, useEffect } from 'react'

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

  // Helper lấy userProfile từ localStorage
  const getLocalUserProfile = () => {
    try {
      const userProfileStr = localStorage.getItem('userProfile')
      if (!userProfileStr) return null
      return JSON.parse(userProfileStr)
    } catch (err) {
      return null
    }
  }

  // Memoize userProfile: ưu tiên props, fallback localStorage
  const memoUserProfile = useMemo(() => {
    if (userProfile && userProfile._id && userProfile.role) return userProfile
    return getLocalUserProfile()
  }, [userProfile])

  useEffect(() => {
    if (hospitals?.data?.length) {
      setHospitalList(hospitals?.data)
    }
  }, [hospitals])

  useEffect(() => {
    if (!memoUserProfile) {
      setLoading(false)
      return
    }
    const { _id, role } = memoUserProfile
    if (!_id || !role) {
      setLoading(false)
      return
    }
    const fetchUserProfile = async () => {
      try {
        const data = await getUserById(_id, role.toLowerCase())
        setCurrentUser({ ...data, role: data.role?.toLowerCase() })
        setUserProfile(data)
      } catch (error) {
        console.error('Lỗi khi fetch user:', error)
        setCurrentUser({ ...memoUserProfile, role: role.toLowerCase() })
        setUserProfile(memoUserProfile)
      } finally {
        setLoading(false)
      }
    }
    fetchUserProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [memoUserProfile, setUserProfile])

  if (loading || !currentUser)
    return <div>Đang tải thông tin người dùng...</div>

  let walletBalance = 0
  let walletHistory = []

  if (currentUser.role === 'doctor') {
    walletBalance = currentUser.wallet?.balance || 0
    walletHistory = (currentUser.wallet as any)?.transactionHistory || []
  } else if (currentUser.role === 'patient') {
    walletBalance = currentUser?.walletBalance || 0
    walletHistory = currentUser?.walletHistory || []
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
