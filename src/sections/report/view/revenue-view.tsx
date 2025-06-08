import sumBy from 'lodash/sumBy'
import { useRef, useMemo, useState, useEffect, useCallback } from 'react'

import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Divider from '@mui/material/Divider'
import Container from '@mui/material/Container'
import TableBody from '@mui/material/TableBody'
import { alpha, useTheme } from '@mui/material/styles'
import TableContainer from '@mui/material/TableContainer'

import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'

import { useBoolean } from 'src/hooks/use-boolean'

import { isAfter, isBetween } from 'src/utils/format-time'

import Label from 'src/components/label'
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

import InvoiceAnalytic from 'src/sections/invoice/invoice-analytic'
import InvoiceTableRow from 'src/sections/invoice/invoice-table-row'
import InvoiceTableToolbar from 'src/sections/invoice/invoice-table-toolbar'
import InvoiceTableFiltersResult from 'src/sections/invoice/invoice-table-filters-result'

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

const defaultFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null,
  service: []
}

export default function RevenueView() {
  const { enqueueSnackbar } = useSnackbar()
  const theme = useTheme()
  const settings = useSettingsContext()
  const router = useRouter()
  const table = useTable({ defaultOrderBy: 'createdAt' })
  const confirm = useBoolean()
  const [tableData, setTableData] = useState([])
  const [filters, setFilters] = useState(defaultFilters)
  const debounceRef = useRef(null)

  // Mock doctor options
  const doctorOptions = useMemo(() => {
    const doctors = tableData
      .map(item => item.appointmentInfo?.doctor)
      .filter(Boolean)
    const uniqueDoctors = Array.from(
      new Map(doctors.map(d => [d._id, d])).values()
    )
    return uniqueDoctors.map(d => ({ id: d._id, name: d.fullName }))
  }, [tableData])

  // Mock fetch data
  useEffect(() => {
    setTableData([]) // TODO: fetch API hoặc set mock data ở đây
  }, [])

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

  const denseHeight = table.dense ? 56 : 76

  const canReset =
    !!filters.name ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate)

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length

  const getInvoiceLength = status =>
    tableData.filter(item => item.status === status).length

  const getTotalAmount = status =>
    sumBy(
      tableData.filter(item => item.status === status),
      'amount'
    )

  const getPercentByStatus = status =>
    (getInvoiceLength(status) / (tableData.length || 1)) * 100

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
  ]

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage()
      setFilters(prev => ({ ...prev, [name]: value }))
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

  const handleViewRow = useCallback(id => {}, [])

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      handleFilters('status', newValue)
    },
    [handleFilters]
  )

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Báo cáo doanh thu tổng"
        links={[
          { name: 'Quản trị', href: paths.dashboard.root },
          { name: 'Báo cáo', href: paths.dashboard.report.root },
          { name: 'Doanh thu tổng' }
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
          exportToCSV={() => {}}
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
                dataFiltered.map(row => row._id)
              )
            }}
            action={null}
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
                    dataFiltered?.map(row => row._id)
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
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Delete"
        content={
          <>
            <span>Bạn có chắc muốn xóa </span>
            <strong>{table.selected.length}</strong> items?
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
    </Container>
  )
}

function applyFilter({ inputData, comparator, filters, dateError }) {
  const {
    name = '',
    status = 'all',
    startDate = null,
    endDate = null
  } = filters || {}
  const stabilizedThis = inputData.map((el, index) => [el, index])
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })
  inputData = stabilizedThis.map(el => el[0])
  if (status !== 'all') {
    inputData = inputData.filter(invoice => invoice.status === status)
  }
  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(invoice =>
        isBetween(invoice.createdAt, startDate, endDate)
      )
    }
  }
  return inputData
}
