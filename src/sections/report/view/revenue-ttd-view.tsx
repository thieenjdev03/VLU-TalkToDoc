import axios from 'axios'
import dayjs from 'dayjs'
import sumBy from 'lodash/sumBy'
import { useRef, useMemo, useState, useEffect, useCallback } from 'react'

import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Stack from '@mui/material/Stack'
import Divider from '@mui/material/Divider'
import Container from '@mui/material/Container'
import TableBody from '@mui/material/TableBody'
import { alpha, useTheme } from '@mui/material/styles'
import TableContainer from '@mui/material/TableContainer'

import { paths } from 'src/routes/paths'

import { API_URL } from 'src/config-global'

import Scrollbar from 'src/components/scrollbar'
import { useSnackbar } from 'src/components/snackbar'
import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'
import {
  useTable,
  emptyRows,
  TableNoData,
  TableEmptyRows,
  TableHeadCustom,
  TablePaginationCustom
} from 'src/components/table'

import InvoiceAnalytic from 'src/sections/invoice/invoice-analytic'

import {
  IInvoice,
  IInvoiceTableFilters,
  IInvoiceTableFilterValue
} from 'src/types/invoice'

import RevenueTableToolbar from '../components/revenue-ttd-toolbar'
import RevenuePlatformTableRow from '../components/revenue-platform-table-row'

const TABLE_HEAD = [
  { id: 'orderId', label: 'Mã Giao Dịch', minWidth: 100 },
  { id: 'orderId', label: 'Mã Lịch Hẹn', minWidth: 100 },
  { id: 'createdAt', label: 'Ngày Tạo', minWidth: 140 },
  { id: 'amount', label: 'Số Tiền', minWidth: 120, align: 'center' },
  {
    id: 'doctorRevenue',
    label: 'Doanh Thu Bác Sĩ',
    minWidth: 120,
    align: 'center'
  },
  { id: 'discount', label: 'Giảm giá', minWidth: 120, align: 'center' },
  {
    id: 'platformRevenue',
    label: 'Doanh Thu Nền Tảng',
    minWidth: 150,
    align: 'center'
  },
  { id: 'status', label: 'Trạng Thái', minWidth: 120, align: 'center' }
]

const defaultFilters: IInvoiceTableFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null,
  service: []
}

// Map trạng thái sang tiếng Việt
const STATUS_LABELS: Record<string, string> = {
  completed: 'Đã hoàn thành',
  pending: 'Đang chờ'
  // Có thể bổ sung thêm các trạng thái khác nếu cần
}

// Hàm lấy giá trị đúng cho từng field export
const getFieldValue = (row: any, field: string) => {
  switch (field) {
    case 'doctorRevenue':
      // Lấy doanh thu bác sĩ từ nested object
      return row.appointmentInfo?.payment?.doctorFee ?? row.doctorRevenue ?? ''
    case 'discount':
      // Lấy giảm giá từ nested object
      return row.appointmentInfo?.payment?.discount ?? row.discount ?? ''
    case 'status':
      return STATUS_LABELS[row.status] || row.status || ''
    default:
      return row[field] ?? ''
  }
}

export default function RevenueTTDView() {
  const { enqueueSnackbar } = useSnackbar()
  const theme = useTheme()
  const settings = useSettingsContext()
  const table = useTable({ defaultOrderBy: 'createdAt' })
  const [tableData, setTableData] = useState<IInvoice[]>([])
  const [filters, setFilters] = useState<IInvoiceTableFilters>(defaultFilters)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      const getDataInvoices = async () => {
        try {
          const params = []
          if (filters.name) params.push(`q=${encodeURIComponent(filters.name)}`)
          if (filters.service && filters.service.length > 0)
            params.push(`doctor=${filters.service[0]}`)
          if (filters.startDate)
            params.push(
              `start=${dayjs(filters.startDate).format('YYYY-MM-DD')}`
            )
          if (filters.endDate)
            params.push(`end=${dayjs(filters.endDate).format('YYYY-MM-DD')}`)
          const query = params.length ? `?${params.join('&')}` : ''
          const response = await axios.get(
            `${API_URL}/payment/all-orders${query}`
          )
          setTableData(response.data || [])
        } catch (error) {
          enqueueSnackbar('Không thể lấy dữ liệu hóa đơn', { variant: 'error' })
        }
      }
      getDataInvoices()
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [enqueueSnackbar, filters])

  // Tính doanh thu nền tảng cho từng order
  const dataWithPlatformRevenue = useMemo(
    () =>
      tableData.map((row: any) => ({
        ...row,
        platformRevenue:
          (row.appointmentInfo?.payment?.total || 0) * 0.1 -
          (row.appointmentInfo?.payment?.discount || 0)
      })),
    [tableData]
  )

  const dataFiltered = useMemo(() => {
    if (!filters.status || filters.status === 'all')
      return dataWithPlatformRevenue
    return dataWithPlatformRevenue.filter(
      (item: any) => (item.status?.toLowerCase() || '') === filters.status
    )
  }, [dataWithPlatformRevenue, filters.status])

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  )

  const denseHeight = table.dense ? 56 : 76

  const canReset =
    !!filters.name ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate) ||
    (filters.service && filters.service.length > 0)

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length
  console.log('dataFiltered check', dataFiltered)
  const getTotalPlatformRevenue = () => sumBy(dataFiltered, 'platformRevenue')

  // Hàm tính tổng doanh thu nền tảng theo trạng thái
  const getTotalPlatformRevenueByStatus = (status: string) =>
    sumBy(
      dataFiltered.filter(item => item.status === status),
      'platformRevenue'
    )

  const TABS = [
    {
      value: 'all',
      label: 'Tất cả',
      color: 'default',
      count: dataFiltered.length
    },
    {
      value: 'completed',
      label: 'Đã hoàn thành',
      color: 'success',
      count: dataFiltered.filter(item => item.status === 'completed').length
    },
    {
      value: 'pending',
      label: 'Đang chờ',
      color: 'warning',
      count: dataFiltered.filter(item => item.status === 'pending').length
    }
  ]

  const handleFilters = useCallback(
    (name: string, value: IInvoiceTableFilterValue) => {
      table.onResetPage()
      setFilters(prev => ({ ...prev, [name]: value }))
    },
    [table]
  )

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  // Thêm hàm chuyển data sang CSV string, chỉ lấy field trong TABLE_HEAD
  const convertToCSV = (
    data: any[],
    columns: { id: string; label: string }[]
  ) => {
    if (!data.length) return ''
    const header = columns.map(col => col.label)
    const fields = columns.map(col => col.id)
    const csvRows = [
      header.join(','), // header row
      ...data.map(row =>
        fields
          .map(fieldName => {
            let value = getFieldValue(row, fieldName)
            if (typeof value === 'object' && value !== null)
              value = JSON.stringify(value)
            if (typeof value === 'string' && value.includes(','))
              value = `"${value}"`
            return value ?? ''
          })
          .join(',')
      )
    ]
    return csvRows.join('\n')
  }

  // Hàm trigger download file CSV
  const downloadCSV = (csv: string, filename = 'revenue.csv') => {
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    window.URL.revokeObjectURL(url)
  }

  // Sửa hàm exportToCSV để chỉ export field trong TABLE_HEAD
  const exportToCSV = (data: any[]) => {
    if (!data || !data.length) {
      enqueueSnackbar('Không có dữ liệu để xuất', { variant: 'warning' })
      return
    }
    const csv = convertToCSV(data, TABLE_HEAD)
    downloadCSV(csv, 'revenue.csv')
    enqueueSnackbar('Xuất file CSV thành công!', { variant: 'success' })
  }

  const serviceOptions = [] // Nếu có danh sách bác sĩ thì truyền vào
  const dateError = false // Nếu muốn validate ngày thì cập nhật logic

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Thống kê doanh thu TalkToDoc"
        links={[
          { name: 'Quản trị', href: paths.dashboard.root },
          { name: 'Thống kê', href: paths.dashboard.report.root },
          { name: 'Doanh thu TalkToDoc' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ mb: { xs: 1, md: 1 } }}>
        <Scrollbar>
          <Stack
            direction={{ xs: 'column', md: 'row' }}
            justifyContent="space-between"
            alignItems="stretch"
            divider={
              <Divider
                orientation={
                  typeof window !== 'undefined' && window.innerWidth < 900
                    ? 'horizontal'
                    : 'vertical'
                }
                flexItem
                sx={{ borderStyle: 'dashed' }}
              />
            }
            sx={{ py: 1, px: 1 }}
            spacing={{ xs: 2, md: 2 }}
          >
            <Stack flex={1}>
              <InvoiceAnalytic
                title="Tổng doanh thu nền tảng"
                total={dataFiltered.length}
                percent={100}
                price={getTotalPlatformRevenue()}
                icon="solar:bill-list-bold-duotone"
                color={theme.palette.info.main}
              />
            </Stack>
            <Stack flex={1}>
              <InvoiceAnalytic
                title="Đã hoàn thành"
                total={
                  dataFiltered.filter(item => item.status === 'completed')
                    .length
                }
                percent={100}
                price={getTotalPlatformRevenueByStatus('completed')}
                icon="solar:check-circle-bold-duotone"
                color={theme.palette.success.main}
              />
            </Stack>
            <Stack flex={1}>
              <InvoiceAnalytic
                title="Đang chờ"
                total={
                  dataFiltered.filter(item => item.status === 'pending').length
                }
                percent={100}
                price={getTotalPlatformRevenueByStatus('pending')}
                icon="solar:clock-circle-bold-duotone"
                color={theme.palette.warning.main}
              />
            </Stack>
          </Stack>
        </Scrollbar>
      </Card>
      <Card>
        <Tabs
          value={filters.status}
          onChange={(e, v) => handleFilters('status', v)}
          sx={{
            px: 2.5,
            boxShadow: `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`
          }}
        >
          {TABS.map(tab => (
            <Tab
              key={tab.value}
              value={tab.value}
              label={tab.label}
              iconPosition="end"
              icon={<span style={{ fontWeight: 600 }}>{tab.count}</span>}
            />
          ))}
        </Tabs>
        <RevenueTableToolbar
          filters={filters}
          onFilters={handleFilters}
          exportToCSV={exportToCSV}
          dataFiltered={dataFiltered}
          dateError={dateError}
          selected={table.selected}
        />
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
            <TableHeadCustom
              order={table.order}
              orderBy={table.orderBy}
              headLabel={TABLE_HEAD}
              rowCount={dataFiltered.length}
              numSelected={table.selected.length}
              onSort={table.onSort}
              onSelectAllRows={checked =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map(row => row._id)
                )
              }
            />
            <TableBody>
              {dataFiltered
                .slice(
                  table.page * table.rowsPerPage,
                  table.page * table.rowsPerPage + table.rowsPerPage
                )
                .map(row => (
                  <RevenuePlatformTableRow key={row._id} row={row} />
                ))}
              {dataFiltered.length === 0 && (
                <TableEmptyRows
                  height={denseHeight}
                  emptyRows={emptyRows(
                    table.page,
                    table.rowsPerPage,
                    dataFiltered.length
                  )}
                />
              )}
              <TableNoData notFound={notFound} />
            </TableBody>
          </Table>
        </TableContainer>
        <TablePaginationCustom
          count={dataFiltered.length}
          page={table.page}
          rowsPerPage={table.rowsPerPage}
          onPageChange={table.onChangePage}
          onRowsPerPageChange={table.onChangeRowsPerPage}
          dense={table.dense}
          onChangeDense={table.onChangeDense}
        />
      </Card>
    </Container>
  )
}
