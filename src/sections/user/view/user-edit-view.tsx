import { useState, useEffect } from 'react'

import Container from '@mui/material/Container'

import { paths } from 'src/routes/paths'

import { _userList } from 'src/_mock'
import { useGetHospital } from 'src/api/hospital'

import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'

import UserNewEditForm from '../user-new-edit-form'
// ----------------------------------------------------------------------

type Props = {
  id: string
}

export default function UserEditView({ id }: Props) {
  const settings = useSettingsContext()
  const [hospitalList, setHospitalList] = useState<any[]>([])
  const { hospitals } = useGetHospital({
    query: '',
    page: 1,
    limit: 99,
    sortField: 'name',
    sortOrder: 'asc'
  })
  const currentUser = _userList.find(user => user.id === id)

  useEffect(() => {
    if (hospitals?.data?.length) {
      setHospitalList(hospitals?.data)
    }
  }, [hospitals])

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Chỉnh sửa người dùng"
        links={[
          {
            name: 'Trang chủ',
            href: paths.dashboard.root
          },
          {
            name: 'Người dùng',
            href: paths.dashboard.user.root
          },
          { name: currentUser?.name }
        ]}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      />
      <UserNewEditForm
        currentUser={currentUser as any}
        typeUser={currentUser?.role as 'user' | 'doctor' | 'employee'}
        hospitals={hospitalList}
      />
    </Container>
  )
}
