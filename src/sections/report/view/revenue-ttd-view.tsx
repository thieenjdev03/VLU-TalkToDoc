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
  // Tổng doanh thu nền tảng
  const getTotalPlatformRevenue = () => sumBy(dataFiltered, 'platformRevenue')

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
    },
    {
      value: 'overdue',
      label: 'Quá hạn',
      color: 'error',
      count: dataFiltered.filter(item => item.status === 'overdue').length
    },
    {
      value: 'draft',
      label: 'Nháp',
      color: 'default',
      count: dataFiltered.filter(item => item.status === 'draft').length
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

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Báo cáo doanh thu TalkToDoc"
        links={[
          { name: 'Dashboard', href: paths.dashboard.root },
          { name: 'Báo cáo', href: paths.dashboard.report.root },
          { name: 'Doanh thu TalkToDoc' }
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />
      <Card sx={{ mb: { xs: 1, md: 1 } }}>
        <Scrollbar>
          <Stack
            direction="row"
            divider={
              <Divider
                orientation="vertical"
                flexItem
                sx={{ borderStyle: 'dashed' }}
              />
            }
            sx={{ py: 1 }}
          >
            <InvoiceAnalytic
              title="Tổng doanh thu nền tảng"
              total={dataFiltered.length}
              percent={100}
              price={getTotalPlatformRevenue()}
              icon="solar:bill-list-bold-duotone"
              color={theme.palette.info.main}
            />
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
