import { Helmet } from 'react-helmet-async';

import ImportMedicineCSV from './import-new';
// ----------------------------------------------------------------------

export default function SpecialtyCreatePage() {
  return (
    <>
      <Helmet>
        <title> Dashboard: Thêm Danh Sách Thuốc</title>
      </Helmet>

      <ImportMedicineCSV />
    </>
  );
}
