// @ts-ignore
import { saveAs } from 'file-saver'
import { useState, useEffect } from 'react'

import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Stack from '@mui/material/Stack'
import TableRow from '@mui/material/TableRow'
import Container from '@mui/material/Container'
import TableBody from '@mui/material/TableBody'
import TableHead from '@mui/material/TableHead'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

import { paths } from 'src/routes/paths'

import { getSpecialtyReport } from 'src/api/report'

import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'

import SpecialtyAnalytic from '../components/specialty-analytic'
import SpecialtyTableRow from '../components/specialty-table-row'
import SpecialtyReportToolbar from '../components/specialty-report-toolbar'

const DEFAULT_ICON = '/assets/icons/specialty/default.png'

export default function SpecialtyReportView() {
  const settings = useSettingsContext()
  const [filters, setFilters] = useState({
    timeRange: 'month',
    specialty: 'all',
    hospital: 'all',
    startDate: null,
    endDate: null,
    page: 1,
    pageSize: 20
  })
  const [rows, setRows] = useState<any[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [specialtyOptions, setSpecialtyOptions] = useState<
    { label: string; value: string }[]
  >([])
  const dateError = false

  useEffect(() => {
    setLoading(true)
    getSpecialtyReport({
      ...filters,
      startDate: filters.startDate ? filters.startDate : undefined,
      endDate: filters.endDate ? filters.endDate : undefined
    })
      .then(res => {
        setRows(res.data.items)
        setTotal(res.data.total)
        // Tạo options chuyên khoa từ data nếu chưa có
        if (res.data.items?.length) {
          setSpecialtyOptions([
            { label: 'Tất cả', value: 'all' },
            ...Array.from(
              new Set(
                res.data.items.map((i: any) =>
                  i.specialtyCode && i.specialty
                    ? `${i.specialtyCode}|${i.specialty}`
                    : null
                )
              )
            )
              .filter(Boolean)
              .map((str: any) => {
                const [value, label] = String(str).split('|')
                return { label, value }
              })
          ])
        }
      })
      .finally(() => setLoading(false))
  }, [filters])

  const handleFilters = (name: string, value: any) => {
    setFilters(prev => ({ ...prev, [name]: value, page: 1 }))
  }

  const exportToCSV = () => {
    if (!rows.length) return
    // Header tiếng Việt đúng thứ tự table
    const header = [
      'STT',
      'Chuyên khoa',
      'Số lượt khám',
      'Doanh thu (VNĐ)',
      'Số bác sĩ',
      '% Tăng/Giảm'
    ]
    // Format số tiền VNĐ
    const formatVND = (n: number | undefined) =>
      n?.toLocaleString('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
      })
    // Map data
    const csvRows = [
      header.join(','),
      ...rows.map((row, idx) =>
        [
          idx + 1,
          row.specialty,
          row.visits,
          formatVND(row.revenue),
          row.doctorCount,
          `${(row.percentChange > 0 ? '+' : '') + (row.percentChange ?? 0)}%`
        ].join(',')
      )
    ]
    const csvString = csvRows.join('\n')
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, 'bao-cao-chuyen-khoa.csv')
  }

  // Sắp xếp theo doanh thu giảm dần
  const sortedRows = [...rows].sort(
    (a, b) => (b.revenue || 0) - (a.revenue || 0)
  )

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Thống kê chuyên khoa"
        links={[
          { name: 'Quản trị', href: paths.dashboard.root },
          { name: 'Thống kê', href: paths.dashboard.report.root },
          { name: 'Chuyên khoa' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
        {sortedRows.slice(0, 3).map(row => (
          <SpecialtyAnalytic
            key={row.specialtyCode || row.specialty}
            specialty={row.specialty}
            visits={row.visits}
            revenue={row.revenue}
            icon={row.specialtyIcon || row.avatarUrl || DEFAULT_ICON}
            doctorCount={row.doctorCount}
            avgRating={row.avgRating}
            percentChange={row.percentChange}
          />
        ))}
      </Stack>
      <Card>
        <Card sx={{ p: 1 }}>
          <SpecialtyReportToolbar
            filters={filters}
            onFilters={handleFilters}
            exportToCSV={exportToCSV}
            dataFiltered={rows}
            specialtyOptions={specialtyOptions}
            dateError={dateError}
          />
        </Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell align="center">STT</TableCell>
                <TableCell>Chuyên khoa</TableCell>
                <TableCell align="center">Số lượt khám</TableCell>
                <TableCell align="center">Doanh thu (VNĐ)</TableCell>
                <TableCell align="center">Số bác sĩ</TableCell>
                <TableCell align="center">% Tăng/Giảm</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              )}
              {!loading && rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              )}
              {!loading &&
                sortedRows.length > 0 &&
                sortedRows.map((row, idx) => (
                  <SpecialtyTableRow
                    key={row.specialtyCode || row.specialty}
                    row={{
                      ...row,
                      specialtyIcon:
                        row.specialtyIcon || row.avatarUrl || DEFAULT_ICON
                    }}
                    index={idx}
                  />
                ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    </Container>
  )
}
