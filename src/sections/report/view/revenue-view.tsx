import axios from 'axios'
import dayjs from 'dayjs'
import sumBy from 'lodash/sumBy'
import { useRef, useMemo, useState, useEffect, useCallback } from 'react'

import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Divider from '@mui/material/Divider'
import Container from '@mui/material/Container'
import TableBody from '@mui/material/TableBody'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import { alpha, useTheme } from '@mui/material/styles'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TableContainer from '@mui/material/TableContainer'

import { paths } from 'src/routes/paths'

import { useBoolean } from 'src/hooks/use-boolean'

import { isBetween } from 'src/utils/format-time'

import { API_URL } from 'src/config-global'

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
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom
} from 'src/components/table'

import InvoiceAnalytic from 'src/sections/invoice/invoice-analytic'
import InvoiceTableRow from 'src/sections/report/components/revenue-table-row'
import RevenueTableToolbar from 'src/sections/report/components/revenue-table-toolbar'
import InvoiceTableFiltersResult from 'src/sections/invoice/invoice-table-filters-result'

import {
  IInvoice,
  IInvoiceTableFilters,
  IInvoiceTableFilterValue
} from 'src/types/invoice'

const TABLE_HEAD = [
  { id: 'orderId', label: 'Mã Thanh Toán', minWidth: 100 },
  { id: 'doctor', label: 'Bác Sĩ', minWidth: 250, align: 'center' },
  { id: 'createdAt', label: 'Ngày Tạo', minWidth: 140, align: 'center' },
  { id: 'amount', label: 'Số Tiền', minWidth: 120, align: 'center' },
  { id: 'platformFee', label: 'Phí Nền Tảng', minWidth: 120, align: 'center' },
  { id: 'doctorRevenue', label: 'Doanh Thu', minWidth: 120, align: 'center' },
  {
    id: 'status',
    label: 'Trạng Thái Lịch Hẹn',
    minWidth: 120,
    align: 'center'
  },
  {
    id: 'salaryStatus',
    label: 'Đã Thanh Toán Lương',
    minWidth: 120,
    align: 'center'
  }
]

const defaultFilters: IInvoiceTableFilters = {
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
  const table = useTable({ defaultOrderBy: 'createdAt' })
  const confirm = useBoolean()
  const [tableData, setTableData] = useState<IInvoice[]>([])
  const [filters, setFilters] = useState<IInvoiceTableFilters>(defaultFilters)
  const debounceRef = useRef<NodeJS.Timeout | null>(null)
  const [openPaySalary, setOpenPaySalary] = useState(false)
  const [paySalaryLoading, setPaySalaryLoading] = useState(false)
  const [paySalaryResult, setPaySalaryResult] = useState<null | {
    updated: number
    orders: any[]
  }>(null)

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
            `${API_URL}/payment/all-orders/doctor${query}`
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

  const doctorOptions = useMemo(() => {
    const doctors = tableData
      .map((item: any) => item.doctorInfo || item.appointmentInfo?.doctor)
      .filter(Boolean)
    const uniqueDoctors = Array.from(
      new Map(doctors.map((d: any) => [d._id, d])).values()
    )
    return uniqueDoctors.map((d: any) => ({ id: d._id, name: d.fullName }))
  }, [tableData])

  const doctorRevenueList = useMemo(() => {
    const doctors = tableData
      .map((item: any) => item.doctorInfo || item.appointmentInfo?.doctor)
      .filter(Boolean)
    const uniqueDoctors = Array.from(
      new Map(doctors.map((d: any) => [d._id, d])).values()
    )
    return uniqueDoctors.map((doctor: any) => {
      const doctorInvoices = tableData.filter(
        (item: any) =>
          (item.doctorInfo?._id || item.appointmentInfo?.doctor?._id) ===
          doctor._id
      )
      return {
        ...doctor,
        totalRevenue: sumBy(doctorInvoices, 'amount'),
        totalInvoices: doctorInvoices.length
      }
    })
  }, [tableData])

  // Filter FE theo status (appointmentInfo.status)
  const dataFiltered = useMemo(() => {
    if (!filters.status || filters.status === 'all') return tableData
    return tableData.filter(
      (item: any) =>
        (item.appointmentInfo?.status?.toLowerCase() || '') === filters.status
    )
  }, [tableData, filters.status])

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

  // Các analytic, tabs chỉ dùng dataFiltered đã filter FE
  const getInvoiceLength = (status: string) =>
    dataFiltered.filter(
      item =>
        ((item as any).appointmentInfo?.status?.toLowerCase() || '') === status
    ).length

  const getTotalAmount = (status: string) =>
    sumBy(
      dataFiltered.filter(
        item =>
          ((item as any).appointmentInfo?.status?.toLowerCase() || '') ===
          status
      ),
      'amount'
    )

  const getPercentByStatus = (status: string) =>
    (getInvoiceLength(status) / (dataFiltered.length || 1)) * 100

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
      count: getInvoiceLength('completed')
    },
    {
      value: 'confirmed',
      label: 'Đã xác nhận',
      color: 'info',
      count: getInvoiceLength('confirmed')
    },
    {
      value: 'pending',
      label: 'Đang chờ',
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
      value: 'cancelled',
      label: 'Đã hủy',
      color: 'error',
      count: getInvoiceLength('cancelled')
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

  const handleDeleteRows = useCallback(() => {
    const deleteRows = dataFiltered.filter(
      (row: any) => !table.selected.includes(row._id)
    )
    enqueueSnackbar('Delete success!')
    setTableData(deleteRows)
    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,
      totalRowsFiltered: dataFiltered.length
    })
  }, [dataInPage.length, enqueueSnackbar, table, dataFiltered])

  const handleViewRow = useCallback((id: string) => {}, [])

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue)
    },
    [handleFilters]
  )

  // Wrapper cho select all
  const handleSelectAllRows = (checked: boolean) => {
    table.onSelectAllRows(
      checked,
      dataFiltered.map((row: IInvoice) => row._id)
    )
  }

  // Lấy danh sách bác sĩ đã chọn từ các row được chọn
  const selectedDoctorList = useMemo(() => {
    const selectedRows = dataFiltered.filter(row =>
      table.selected.includes(row._id)
    )
    // Lấy unique bác sĩ từ các row đã chọn
    const doctors = selectedRows
      .map((item: any) => item.doctorInfo || item.appointmentInfo?.doctor)
      .filter(Boolean)
    const uniqueDoctors = Array.from(
      new Map(doctors.map((d: any) => [d._id, d])).values()
    )
    return uniqueDoctors
  }, [dataFiltered, table.selected])

  // Tổng hợp số hóa đơn và doanh thu của các bác sĩ đã chọn
  const selectedDoctorSummary = useMemo(() => {
    const selectedRows = dataFiltered.filter(row =>
      table.selected.includes(row._id)
    )
    return selectedDoctorList.map((doctor: any) => {
      const doctorInvoices = selectedRows.filter(
        (item: any) =>
          (item.doctorInfo?._id || item.appointmentInfo?.doctor?._id) ===
          doctor._id
      )
      return {
        ...doctor,
        totalRevenue: sumBy(doctorInvoices, 'amount'),
        totalInvoices: doctorInvoices.length
      }
    })
  }, [selectedDoctorList, dataFiltered, table.selected])

  // Xử lý khi xác nhận thanh toán lương
  const handlePaySalary = async () => {
    setPaySalaryLoading(true)
    try {
      // Lấy orderIds và doctorIds từ các row đã chọn
      const selectedRows = dataFiltered.filter(row =>
        table.selected.includes(row._id)
      )
      const doctorIds = Array.from(
        new Set(
          selectedRows.map(
            (item: any) =>
              item.doctorInfo?._id || item.appointmentInfo?.doctor?._id
          )
        )
      )
      const orderIds = selectedRows.map(row => row._id)
      const payload = {
        doctorIds,
        orderIds,
        startDate: filters.startDate
          ? dayjs(filters.startDate).format('YYYY-MM-DD')
          : undefined,
        endDate: filters.endDate
          ? dayjs(filters.endDate).format('YYYY-MM-DD')
          : undefined
      }
      const res = await axios.post(`${API_URL}/payment/pay-salary`, payload)
      enqueueSnackbar(res.data?.message || 'Thanh toán lương thành công!', {
        variant: 'success'
      })
      setPaySalaryResult(res.data?.data || null)
      // Cập nhật salaryStatus cho các order đã thanh toán lương trên UI
      if (res.data?.data?.orders) {
        setTableData(prev =>
          prev.map(order => {
            const updated = res.data.data.orders.find(
              (o: any) => o._id === order._id
            )
            return updated ? { ...order, salaryStatus: true } : order
          })
        )
      }
      setOpenPaySalary(false)
      table.setSelected([])
      // Nếu muốn reload lại data từ BE, có thể gọi lại API ở đây
    } catch (err: any) {
      enqueueSnackbar(
        err?.response?.data?.message || 'Có lỗi khi thanh toán lương!',
        { variant: 'error' }
      )
    } finally {
      setPaySalaryLoading(false)
    }
  }

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Báo cáo doanh thu tổng"
        links={[
          { name: 'Quản trị', href: paths.dashboard.root },
          { name: 'Báo cáo', href: paths.dashboard.report.root },
          { name: 'Doanh thu tổng' }
        ]}
        sx={{ mb: { xs: 1, md: 2 } }}
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
              total={dataFiltered.length}
              percent={100}
              price={sumBy(dataFiltered, 'amount')}
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
              total={getInvoiceLength('cancelled')}
              percent={getPercentByStatus('cancelled')}
              price={getTotalAmount('cancelled')}
              icon="solar:file-corrupted-bold-duotone"
              color={theme.palette.text.secondary}
            />
          </Stack>
        </Scrollbar>
      </Card>
      <Card>
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
                  color={tab.color as any}
                >
                  {tab.count}
                </Label>
              }
            />
          ))}
        </Tabs>
        <RevenueTableToolbar
          filters={filters}
          onFilters={handleFilters}
          dateError={false}
          exportToCSV={() => {}}
          dataFiltered={dataFiltered}
          serviceOptions={doctorOptions}
          selected={table.selected}
          onPaySalary={() => setOpenPaySalary(true)}
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
            onSelectAllRows={handleSelectAllRows}
            action={
              table.selected.length > 0 && (
                <Button
                  variant="contained"
                  color="success"
                  sx={{ ml: 2 }}
                  onClick={() => setOpenPaySalary(true)}
                >
                  Thanh toán lương ({table.selected.length})
                </Button>
              )
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
                onSelectAllRows={handleSelectAllRows}
              />
              <TableBody>
                {dataFiltered
                  .slice(
                    table.page * table.rowsPerPage,
                    table.page * table.rowsPerPage + table.rowsPerPage
                  )
                  .map((row: IInvoice) => (
                    <InvoiceTableRow
                      key={row._id}
                      row={row}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                      onViewRow={() => handleViewRow(row._id)}
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
      {/* Modal xác nhận thanh toán lương */}
      <Dialog
        open={openPaySalary}
        onClose={() => setOpenPaySalary(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Xác nhận thanh toán lương</DialogTitle>
        <DialogContent>
          <Typography gutterBottom>
            Bạn có chắc chắn muốn thanh toán lương cho các bác sĩ sau trong
            khoảng thời gian:
          </Typography>
          <Typography variant="subtitle2" color="primary" gutterBottom>
            Lương từ ngày:{' '}
            {filters.startDate
              ? dayjs(filters.startDate).format('DD/MM/YYYY')
              : '...'}{' '}
            -
            {filters.endDate
              ? dayjs(filters.endDate).format('DD/MM/YYYY')
              : '...'}
          </Typography>
          {selectedDoctorSummary.length === 0 ? (
            <Typography color="text.secondary">
              Không có bác sĩ nào được chọn.
            </Typography>
          ) : (
            <>
              {selectedDoctorSummary.map(doctor => (
                <div key={doctor._id} style={{ marginBottom: 12 }}>
                  <Typography variant="subtitle2">{doctor.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Số hóa đơn: {doctor.totalInvoices} | Tổng doanh thu:{' '}
                    {doctor.totalRevenue.toLocaleString()} VNĐ
                  </Typography>
                </div>
              ))}
            </>
          )}
          {/* Hiển thị kết quả thanh toán nếu có */}
          {paySalaryResult && (
            <div style={{ marginTop: 16 }}>
              <Typography color="success.main" variant="subtitle2">
                Đã cập nhật {paySalaryResult.updated} order:
              </Typography>
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                {paySalaryResult.orders.map(order => (
                  <li key={order._id}>
                    <Typography variant="body2">
                      Order: {order._id} - Đã thanh toán lương
                    </Typography>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setOpenPaySalary(false)}
            color="inherit"
            disabled={paySalaryLoading}
          >
            Hủy
          </Button>
          <Button
            onClick={handlePaySalary}
            variant="contained"
            color="success"
            disabled={selectedDoctorSummary.length === 0 || paySalaryLoading}
          >
            {paySalaryLoading ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}

function applyFilter({
  inputData,
  comparator,
  filters,
  dateError
}: {
  inputData: IInvoice[]
  comparator: (
    a: { [key: string]: string | number },
    b: { [key: string]: string | number }
  ) => number
  filters: IInvoiceTableFilters
  dateError: boolean
}): IInvoice[] {
  const {
    name = '',
    status = 'all',
    startDate = null,
    endDate = null
  } = filters || {}
  const stabilizedThis = inputData.map(
    (el, index) => [el, index] as [IInvoice, number]
  )
  stabilizedThis.sort((a, b) => {
    const order = comparator(
      a[0] as unknown as { [key: string]: string | number },
      b[0] as unknown as { [key: string]: string | number }
    )
    if (order !== 0) return order
    return a[1] - b[1]
  })
  inputData = stabilizedThis.map(el => el[0])
  if (status !== 'all') {
    inputData = inputData.filter(
      (invoice: IInvoice) => invoice.status === status
    )
  }
  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter((invoice: IInvoice) =>
        isBetween(invoice.createDate, startDate, endDate)
      )
    }
  }
  return inputData
}
