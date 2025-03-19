import { Helmet } from 'react-helmet-async';

import SpecialtyCreateView from 'src/sections/provider-ranking/new-edit-form';
// ----------------------------------------------------------------------

export default function SpecialtyCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Tạo Cấp Bậc mới</title>
      </Helmet>

      <SpecialtyCreateView />
    </>
  );
}
