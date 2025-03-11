import { Helmet } from 'react-helmet-async';

import { JwtLoginView } from 'src/sections/auth/jwt';

// ----------------------------------------------------------------------

export default function LoginPage() {
  return (
    <>
      <Helmet>
        <title> Đăng Nhập | Hệ Thống Quản Lý TalkToDoc</title>
      </Helmet>

      <JwtLoginView />
    </>
  );
}
