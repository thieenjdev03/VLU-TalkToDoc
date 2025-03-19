import { Helmet } from 'react-helmet-async';

import SpecialtyCreateView from 'src/sections/speciality/view/create-view';
// ----------------------------------------------------------------------

export default function SpecialtyCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Tạo chuyên khoa mới</title>
      </Helmet>

      <SpecialtyCreateView />
    </>
  );
}
