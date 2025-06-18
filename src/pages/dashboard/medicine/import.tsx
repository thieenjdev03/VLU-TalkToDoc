import { Helmet } from 'react-helmet-async'

import ImportMedicineCSV from './import-new'
// ----------------------------------------------------------------------

export default function SpecialtyCreatePage() {
  return (
    <>
      <Helmet>
        <title> Trang quản trị: Thêm Danh Sách Thuốc</title>
      </Helmet>

      <ImportMedicineCSV />
    </>
  )
}
