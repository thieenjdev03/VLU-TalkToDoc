import { Helmet } from 'react-helmet-async'

import { JwtResetPasswordView } from 'src/sections/auth/jwt'

// ----------------------------------------------------------------------

export default function ResetPasswordPage() {
  return (
    <>
      <Helmet>
        <title> Đặt Lại Mật Khẩu | Hệ Thống Quản Lý TalkToDoc</title>
      </Helmet>

      <JwtResetPasswordView />
    </>
  )
}
