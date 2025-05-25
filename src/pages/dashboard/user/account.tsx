import { Helmet } from 'react-helmet-async'

import { AccountView } from 'src/sections/account/view'

// ----------------------------------------------------------------------

export default function AccountPage() {
  return (
    <>
      <Helmet>
        <title> Trang Quản Trị: Quản lý tài khoản</title>
      </Helmet>

      <AccountView />
    </>
  )
}
