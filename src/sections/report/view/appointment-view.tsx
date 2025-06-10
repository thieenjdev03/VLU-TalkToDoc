import { useMemo, useState, useEffect } from 'react'

import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import Container from '@mui/material/Container'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'
import TablePagination from '@mui/material/TablePagination'

import { paths } from 'src/routes/paths'

import { getDoctorAppointmentReport } from 'src/api/report'

import Scrollbar from 'src/components/scrollbar'
import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'

import AppointmentTableToolbar, {
  AppointmentFilters
} from '../components/appointment-table-toolbar'

// TABLE_HEAD cho báo cáo lịch hẹn bác sĩ
const TABLE_HEAD = [
  { id: 'index', label: 'STT', minWidth: 60, align: 'center' },
  { id: 'doctor_id', label: 'MBS', minWidth: 100, align: 'center' },
  { id: 'doctor_name', label: 'Tên Bác Sĩ', minWidth: 200 },
  {
    id: 'total_appointments',
    label: 'Tổng lịch hẹn',
    minWidth: 120,
    align: 'center'
  },
  {
    id: 'completed_appointments',
    label: 'Lịch đã hoàn thành',
    minWidth: 140,
    align: 'center'
  },
  {
    id: 'cancelled_appointments',
    label: 'Lịch đã huỷ',
    minWidth: 120,
    align: 'center'
  },
  {
    id: 'completion_rate',
    label: 'Tỉ lệ hoàn thành (%)',
    minWidth: 120,
    align: 'center'
  }
]

// Data mẫu theo UI spec
const MOCK_DATA = [
  {
    doctorId: 'BS001',
    name: 'Nguyễn Văn A',
    total: 20,
    completed: 18,
    cancelled: 2,
    date: '2024-06-01'
  },
  {
    doctorId: 'BS002',
    name: 'Trần Thị B',
    total: 15,
    completed: 12,
    cancelled: 3,
    date: '2024-06-02'
  },
  {
    doctorId: 'BS003',
    name: 'Lê Văn C',
    total: 10,
    completed: 7,
    cancelled: 3,
    date: '2024-06-03'
  }
]

const DOCTOR_OPTIONS = MOCK_DATA.map(d => ({ id: d.doctorId, name: d.name }))

export default function AppointmentReportView() {
  const settings = useSettingsContext()
  // Filter state
  const [filters, setFilters] = useState<AppointmentFilters>({
    name: '',
    doctorIds: [],
    startDate: null,
    endDate: null
  })
  // Pagination state
  const [page, setPage] = useState(0)
  const [rowsPerPage, setRowsPerPage] = useState(5)
  // Data state
  const [tableData, setTableData] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)

  // Date error
  const dateError =
    filters.startDate &&
    filters.endDate &&
    new Date(filters.endDate) < new Date(filters.startDate)

  // Fetch data từ API
  useEffect(() => {
    setLoading(true)
    // Chuẩn hóa params
    const params = {
      from_date: filters.startDate
        ? new Date(filters.startDate).toISOString().slice(0, 10)
        : undefined,
      to_date: filters.endDate
        ? new Date(filters.endDate).toISOString().slice(0, 10)
        : undefined,
      doctor_ids: filters.doctorIds,
      status: 'all',
      search: filters.name,
      page: page + 1,
      pageSize: rowsPerPage
    }
    getDoctorAppointmentReport(params)
      .then(res => {
        setTableData(
          res.data?.items?.map((row: any, idx: number) => ({
            ...row,
            index: page * rowsPerPage + idx + 1
          })) || []
        )
        setTotal(res.data?.total || 0)
      })
      .finally(() => setLoading(false))
  }, [filters, page, rowsPerPage])

  // Doctor options cho filter
  const doctorOptions = useMemo(() => {
    // Lấy unique doctor từ data hiện tại
    const map = new Map<string, string>()
    tableData.forEach(row => {
      if (row.doctor_id && row.doctor_name)
        map.set(row.doctor_id, row.doctor_name)
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [tableData])

  // Pagination handlers
  const handleChangePage = (
    _event: React.MouseEvent<HTMLButtonElement> | null,
    newPage: number
  ) => setPage(newPage)
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10))
    setPage(0)
  }
  // Reset filter
  const handleReset = () => {
    setFilters({ name: '', doctorIds: [], startDate: null, endDate: null })
    setPage(0)
  }
  // Filter callback
  const handleFilters = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value }))
    setPage(0)
  }
  // Export CSV
  const getFieldValue = (row: any, field: string) => {
    switch (field) {
      case 'index':
        return row.index
      case 'doctor_id':
        return row.doctor_id
      case 'doctor_name':
        return row.doctor_name
      case 'total_appointments':
        return row.total_appointments
      case 'completed_appointments':
        return row.completed_appointments
      case 'cancelled_appointments':
        return row.cancelled_appointments
      case 'completion_rate':
        return `${row.completion_rate}%`
      default:
        return ''
    }
  }
  const exportToCSV = () => {
    if (!tableData.length) return
    const header = TABLE_HEAD.map(col => col.label)
    const fields = TABLE_HEAD.map(col => col.id)
    const csvRows = [
      header.join(','),
      ...tableData.map(row =>
        fields.map(field => getFieldValue(row, field)).join(',')
      )
    ]
    const csv = csvRows.join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'appointment-report.csv'
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Báo cáo lịch hẹn bác sĩ"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Báo cáo', href: paths.dashboard.report.root },
          { name: 'Lịch hẹn bác sĩ' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Card sx={{ p: 3 }}>
        <AppointmentTableToolbar
          filters={filters}
          onFilters={handleFilters}
          exportToCSV={exportToCSV}
          doctorOptions={doctorOptions}
          dateError={dateError}
          onReset={handleReset}
        />
        <Scrollbar>
          <TableContainer sx={{ minWidth: 700 }}>
            <Table>
              <TableHead>
                <TableRow>
                  {TABLE_HEAD.map(col => (
                    <TableCell
                      key={col.id}
                      align={
                        (col.align as
                          | 'center'
                          | 'left'
                          | 'right'
                          | 'inherit'
                          | 'justify') || 'left'
                      }
                      style={{ minWidth: col.minWidth }}
                    >
                      <b>{col.label}</b>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {loading && (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} align="center">
                      <Typography color="text.secondary">
                        Đang tải dữ liệu...
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
                {!loading &&
                  tableData.length > 0 &&
                  tableData.map(row => (
                    <TableRow key={row.doctor_id} hover>
                      <TableCell align="center">{row.index}</TableCell>
                      <TableCell align="center">{row.doctor_id}</TableCell>
                      <TableCell>{row.doctor_name}</TableCell>
                      <TableCell align="center">
                        {row.total_appointments}
                      </TableCell>
                      <TableCell align="center">
                        {row.completed_appointments}
                      </TableCell>
                      <TableCell align="center">
                        {row.cancelled_appointments}
                      </TableCell>
                      <TableCell align="center">
                        {row.completion_rate}%
                      </TableCell>
                    </TableRow>
                  ))}
                {!loading && tableData.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={TABLE_HEAD.length} align="center">
                      <Typography color="text.secondary">
                        Không có dữ liệu
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[5, 10, 20]}
        />
      </Card>
    </Container>
  )
}
