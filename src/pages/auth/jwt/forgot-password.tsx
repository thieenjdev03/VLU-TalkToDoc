import { Helmet } from 'react-helmet-async'

import { JwtForgotPasswordView } from 'src/sections/auth/jwt'

// ----------------------------------------------------------------------

export default function ForgotPasswordPage() {
  return (
    <>
      <Helmet>
        <title> Quên Mật Khẩu | Hệ Thống Quản Lý TalkToDoc</title>
      </Helmet>

      <JwtForgotPasswordView />
    </>
  )
}
