/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from 'axios'
import dayjs from 'dayjs'
import sumBy from 'lodash/sumBy'
// @ts-ignore
import { saveAs } from 'file-saver'
// @ts-ignore
import { useRef, useMemo, useState, useEffect, useCallback } from 'react'

import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Tooltip from '@mui/material/Tooltip'
import Container from '@mui/material/Container'
import TableBody from '@mui/material/TableBody'
import IconButton from '@mui/material/IconButton'
import { alpha, useTheme } from '@mui/material/styles'
import TableContainer from '@mui/material/TableContainer'

import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'

import { useBoolean } from 'src/hooks/use-boolean'

import { isAfter, isBetween } from 'src/utils/format-time'

import { API_URL } from 'src/config-global'

import Label from 'src/components/label'
import Iconify from 'src/components/iconify'
import Scrollbar from 'src/components/scrollbar'
import { useSnackbar } from 'src/components/snackbar'
import { ConfirmDialog } from 'src/components/custom-dialog'
import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom
} from 'src/components/table'

import {
  IInvoice,
  IInvoiceTableFilters,
  IInvoiceTableFilterValue
} from 'src/types/invoice'

import InvoiceAnalytic from '../invoice-analytic'
import InvoiceTableRow from '../invoice-table-row'
import InvoiceTableToolbar from '../invoice-table-toolbar'
import InvoiceTableFiltersResult from '../invoice-table-filters-result'
// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'orderId', label: 'Mã Thanh Toán', minWidth: 100 },
  { id: 'appointmentId', label: 'Mã Lịch Hẹn', minWidth: 100 },
  { id: 'patient', label: 'Bệnh Nhân', minWidth: 250, align: 'center' },
  { id: 'doctor', label: 'Bác Sĩ', minWidth: 250, align: 'center' },
  { id: 'createdAt', label: 'Ngày Tạo', minWidth: 140, align: 'center' },
  { id: 'paymentMethod', label: 'Phương Thức', minWidth: 120, align: 'center' },
  { id: 'amount', label: 'Số Tiền', minWidth: 120, align: 'center' },
  { id: 'platformFee', label: 'Phí Nền Tảng', minWidth: 120, align: 'center' },
  { id: 'discount', label: 'Giảm giá', minWidth: 120, align: 'center' },
  { id: 'doctorRevenue', label: 'Doanh Thu', minWidth: 120, align: 'center' },
  { id: 'status', label: 'Trạng Thái', minWidth: 120, align: 'center' }
]

const defaultFilters: IInvoiceTableFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null,
  service: []
}

// ----------------------------------------------------------------------

export default function InvoiceListView() {
  const { enqueueSnackbar } = useSnackbar()

  const theme = useTheme()

  const settings = useSettingsContext()

  const router = useRouter()

  const table = useTable({ defaultOrderBy: 'createdAt' })

  const confirm = useBoolean()

  const [tableData, setTableData] = useState<IInvoice[]>([])

  const [filters, setFilters] = useState<IInvoiceTableFilters>(defaultFilters)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)

  const doctorOptions = useMemo(() => {
    const doctors = tableData
      .map((item: any) => item.appointmentInfo?.doctor)
      .filter(Boolean)
    const uniqueDoctors = Array.from(
      new Map(doctors.map(d => [d._id, d])).values()
    )
    return uniqueDoctors.map(d => ({ id: d._id, name: d.fullName }))
  }, [tableData])

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
          console.error('Error fetching invoices:', error)
          enqueueSnackbar('Failed to fetch invoices', { variant: 'error' })
        }
      }
      getDataInvoices()
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [enqueueSnackbar, filters])

  const dateError = isAfter(filters.startDate, filters.endDate)

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: filters || defaultFilters,
    dateError
  })

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  )

  const denseHeight = table.dense ? 56 : 56 + 20

  const canReset =
    !!filters.name ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate)

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length

  const getInvoiceLength = (status: string) =>
    tableData.filter(item => item.status === status).length

  const getTotalAmount = (status: string) =>
    sumBy(
      tableData.filter(item => item.status === status),
      'amount'
    )

  const getPercentByStatus = (status: string) =>
    (getInvoiceLength(status) / (tableData.length || 1)) * 100 // Prevent division by zero

  const TABS = [
    {
      value: 'all',
      label: 'Tất cả',
      color: 'default',
      count: tableData.length
    },
    {
      value: 'completed',
      label: 'Đã thanh toán',
      color: 'success',
      count: getInvoiceLength('completed')
    },
    {
      value: 'pending',
      label: 'Chưa thanh toán',
      color: 'warning',
      count: getInvoiceLength('pending')
    },
    {
      value: 'overdue',
      label: 'Quá hạn',
      color: 'error',
      count: getInvoiceLength('overdue')
    },
    {
      value: 'draft',
      label: 'Nháp',
      color: 'default',
      count: getInvoiceLength('draft')
    }
  ] as const

  const handleFilters = useCallback(
    (name: string, value: IInvoiceTableFilterValue) => {
      table.onResetPage()
      setFilters(prevState => ({
        ...prevState,
        [name]: value
      }))
    },
    [table]
  )

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter(
      row => !table.selected.includes(row._id)
    )

    enqueueSnackbar('Delete success!')

    setTableData(deleteRows)

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length
    })
  }, [
    dataFiltered.length,
    dataInPage.length,
    enqueueSnackbar,
    table,
    tableData
  ])
  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.invoice.details(id))
    },
    [router]
  )

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue)
    },
    [handleFilters]
  )

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Thống Kê Giao Dịch"
          links={[
            {
              name: 'Quản Trị',
              href: paths.dashboard.root
            },
            {
              name: 'Giao Dịch',
              href: paths.dashboard.invoice.root
            },
            {
              name: 'Danh Sách'
            }
          ]}
          sx={{
            mb: { xs: 1, md: 1 }
          }}
        />

        <Card
          sx={{
            mb: { xs: 1, md: 1 }
          }}
        >
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
                title="Tổng cộng"
                total={tableData.length}
                percent={100}
                price={sumBy(tableData, 'amount')}
                icon="solar:bill-list-bold-duotone"
                color={theme.palette.info.main}
              />

              <InvoiceAnalytic
                title="Đã hoàn thành"
                total={getInvoiceLength('completed')}
                percent={getPercentByStatus('completed')}
                price={getTotalAmount('completed')}
                icon="solar:file-check-bold-duotone"
                color={theme.palette.success.main}
              />

              <InvoiceAnalytic
                title="Đang chờ"
                total={getInvoiceLength('pending')}
                percent={getPercentByStatus('pending')}
                price={getTotalAmount('pending')}
                icon="solar:sort-by-time-bold-duotone"
                color={theme.palette.warning.main}
              />

              <InvoiceAnalytic
                title="Quá hạn"
                total={getInvoiceLength('overdue')}
                percent={getPercentByStatus('overdue')}
                price={getTotalAmount('overdue')}
                icon="solar:bell-bing-bold-duotone"
                color={theme.palette.error.main}
              />

              <InvoiceAnalytic
                title="Nháp"
                total={getInvoiceLength('draft')}
                percent={getPercentByStatus('draft')}
                price={getTotalAmount('draft')}
                icon="solar:file-corrupted-bold-duotone"
                color={theme.palette.text.secondary}
              />
            </Stack>
          </Scrollbar>
        </Card>

        <Card>
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            sx={{ px: 1, pt: 1 }}
          />
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
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
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) &&
                        'filled') ||
                      'soft'
                    }
                    color={tab.color}
                  >
                    {tab.count}
                  </Label>
                }
              />
            ))}
          </Tabs>
          <InvoiceTableToolbar
            filters={filters}
            onFilters={handleFilters}
            dateError={dateError}
            exportToCSV={() => exportToCSV(dataFiltered)}
            dataFiltered={dataFiltered}
            serviceOptions={doctorOptions}
          />
          {canReset && (
            <InvoiceTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={checked => {
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row: any) => row._id)
                )
              }}
              action={
                <Stack direction="row">
                  <Tooltip title="Sent">
                    <IconButton color="primary">
                      <Iconify icon="iconamoon:send-fill" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Download">
                    <IconButton color="primary">
                      <Iconify icon="eva:download-outline" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Print">
                    <IconButton color="primary">
                      <Iconify icon="solar:printer-minimalistic-bold" />
                    </IconButton>
                  </Tooltip>

                  <Tooltip title="Delete">
                    <IconButton color="primary" onClick={confirm.onTrue}>
                      <Iconify icon="solar:trash-bin-trash-bold" />
                    </IconButton>
                  </Tooltip>
                </Stack>
              }
            />

            <Scrollbar>
              <Table
                size={table.dense ? 'small' : 'medium'}
                sx={{ minWidth: 800 }}
              >
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
                      dataFiltered?.map((row: any) => row._id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row: any) => (
                      <InvoiceTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                      />
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
            </Scrollbar>
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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            Are you sure want to delete{' '}
            <strong> {table.selected.length} </strong> items?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows()
              confirm.onFalse()
            }}
          >
            Delete
          </Button>
        }
      />
    </>
  )
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
  dateError
}: {
  inputData: any
  comparator: (a: any, b: any) => number
  filters: IInvoiceTableFilters
  dateError: boolean
}) {
  const {
    name = '',
    status = 'all',
    startDate = null,
    endDate = null
  } = filters || {}

  const stabilizedThis = inputData.map(
    (el: any, index: any) => [el, index] as const
  )

  stabilizedThis.sort((a: any, b: any) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })

  inputData = stabilizedThis.map((el: any) => el[0])

  if (status !== 'all') {
    inputData = inputData.filter((invoice: any) => invoice.status === status)
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((invoice: any) =>
        isBetween(invoice.createdAt, startDate, endDate)
      )
    }
  }

  return inputData
}

function exportToCSV(data: any[], filename = 'invoices.csv') {
  if (!data.length) return
  const header = TABLE_HEAD.map(col => col.id)
  const csv = [
    TABLE_HEAD.map(col => col.label).join(','),
    ...data.map((row: any) =>
      header
        .map(field => {
          let value = ''
          switch (field) {
            case 'orderId':
              value = row.orderId || row.order_id || ''
              break
            case 'appointmentId':
              value = row.appointmentId || row.appointment_id || ''
              break
            case 'patient':
              value =
                row.appointmentInfo?.patient?.fullName ||
                row.appointmentInfo?.patient?.full_name ||
                ''
              break
            case 'doctor':
              value =
                row.appointmentInfo?.doctor?.fullName ||
                row.appointmentInfo?.doctor?.full_name ||
                ''
              break
            case 'createdAt':
              if (row.createdAt) {
                value = dayjs(row.createdAt).format('DD/MM/YYYY HH:mm')
              } else if (row.created_at) {
                value = dayjs(row.created_at).format('DD/MM/YYYY HH:mm')
              } else {
                value = ''
              }
              break
            case 'paymentMethod':
              value = row.paymentMethod || row.payment_method || ''
              break
            case 'amount':
              value = row.amount ?? row.total_amount ?? ''
              break
            case 'platformFee':
              value = row.platformFee ?? row.platform_fee ?? ''
              break
            case 'discount':
              value = row.discount ?? row.discount_amount ?? ''
              break
            case 'doctorRevenue':
              value = row.doctorRevenue ?? row.doctor_revenue ?? ''
              break
            case 'status':
              switch (row.status || row.status_text) {
                case 'completed':
                  value = 'Đã thanh toán'
                  break
                case 'pending':
                  value = 'Chưa thanh toán'
                  break
                case 'overdue':
                  value = 'Quá hạn'
                  break
                case 'draft':
                  value = 'Nháp'
                  break
                default:
                  value = row.status || row.status_text || ''
              }
              break
            default:
              value = row[field] ?? row[field?.toLowerCase()] ?? ''
          }
          return `"${(value ?? '').toString().replace(/"/g, '""')}"`
        })
        .join(',')
    )
  ].join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  saveAs(blob, filename)
}
