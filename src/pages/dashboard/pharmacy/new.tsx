import { Helmet } from 'react-helmet-async';

import SpecialtyCreateView from 'src/sections/pharmacy/view/create-view';
// ----------------------------------------------------------------------

export default function SpecialtyCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Tạo nhà thuốc mới</title>
      </Helmet>

      <SpecialtyCreateView />
    </>
  );
}
