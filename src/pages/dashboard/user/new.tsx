import { Helmet } from 'react-helmet-async'

import { useGetHospital } from 'src/api/hospital'

import { UserCreateView } from 'src/sections/user/view'
// ----------------------------------------------------------------------

export default function UserCreatePage(props: {
  typeUser: 'user' | 'doctor' | 'employee' | 'patient'
}) {
  const { typeUser } = props
  const { hospitals } = useGetHospital({
    query: '',
    page: 1,
    limit: 10,
    sortField: 'createdAt',
    sortOrder: 'desc'
  })
  console.log('hospitals', hospitals)
  return (
    <>
      <Helmet>
        <title> Trang quản trị: Tạo người dùng mới</title>
      </Helmet>

      <UserCreateView typeUser={typeUser} hospitals={hospitals?.data} />
    </>
  )
}
