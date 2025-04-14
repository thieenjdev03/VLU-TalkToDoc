import { Helmet } from 'react-helmet-async';

import { OverviewAppView } from 'src/sections/overview/app/view';

// ----------------------------------------------------------------------

export default function OverviewAppPage() {
  return (
    <>
      <Helmet>
        <title> Trang Quản Lý: Trang Chủ</title>
      </Helmet>

      <OverviewAppView />
    </>
  );
}
