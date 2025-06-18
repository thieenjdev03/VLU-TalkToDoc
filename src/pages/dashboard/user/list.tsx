import { Helmet } from 'react-helmet-async'

import { UserListView } from 'src/sections/user/view'

// ----------------------------------------------------------------------

export default function UserListPage() {
  return (
    <>
      <Helmet>
        <title> Trang quản trị: Danh sách người dùng</title>
      </Helmet>

      <UserListView typeUser="user" />
    </>
  )
}
