import { useState, useEffect, useCallback } from 'react'

import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import { alpha } from '@mui/material/styles'
import Container from '@mui/material/Container'
import TableBody from '@mui/material/TableBody'
import IconButton from '@mui/material/IconButton'
import TableContainer from '@mui/material/TableContainer'

import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'

import { useBoolean } from 'src/hooks/use-boolean'

import { isAfter, isBetween } from 'src/utils/format-time'

import { useGetUsers } from 'src/api/user'
import { getAppointments } from 'src/api/appointment'

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
  IAppointmentItem,
  IAppointmentTableFilters,
  IAppointmentTableFilterValue
} from 'src/types/appointment'

import '../styles/index.scss'
import AppointmentTableRow from '../appointment-table-row'
import CancelReasonDialog from '../appointment-cancel-modal'
import AppointmentTableToolbar from '../appointment-table-toolbar'

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'REJECTED', label: 'Đã hủy' }
]

const TABLE_HEAD = [
  { id: 'appointmentId', label: 'Mã lịch hẹn', width: { xs: 100, sm: 140 } },
  { id: 'patient', label: 'Bệnh nhân', width: { xs: '15%', sm: '20%' } },
  { id: 'bookingDate', label: 'Ngày khám', width: { xs: 100, sm: 140 } },
  { id: 'specialty', label: 'Chuyên khoa', width: { xs: 100, sm: 120 } },
  { id: 'totalFee', label: 'Chi phí', width: { xs: 100, sm: 120 } },
  {
    id: 'status',
    label: 'Trạng thái',
    width: { xs: 120, sm: 220 },
    align: 'center'
  },
  { id: 'paid', label: 'Đã thanh toán', width: { xs: 100, sm: 120 } },
  { id: 'ctaButton', label: 'Thao tác', width: { xs: 100, sm: 120 } },
  { id: '', width: { xs: 30, sm: 40 } }
]

const TABLE_HEAD_PATIENT = [
  { id: 'appointmentId', label: 'Mã lịch hẹn', minWidth: { xs: 100, sm: 140 } },
  { id: 'doctor', label: 'Bác sĩ', minWidth: { xs: '15%', sm: '20%' } },
  { id: 'bookingDate', label: 'Ngày khám', minWidth: { xs: 100, sm: 140 } },
  { id: 'phoneNumber', label: 'Số điện thoại', minWidth: { xs: 100, sm: 130 } },
  { id: 'specialty', label: 'Chuyên khoa', minWidth: { xs: 100, sm: 140 } },
  { id: 'totalFee', label: 'Chi phí', minWidth: { xs: 100, sm: 120 } },
  {
    id: 'status',
    label: 'Trạng thái',
    minWidth: { xs: 100, sm: 120 },
    align: 'center'
  },
  {
    id: 'paid',
    label: 'Đã thanh toán',
    minWidth: { xs: 100, sm: 140 },
    align: 'center'
  },
  {
    id: 'ctaButton',
    label: 'Thao tác',
    minWidth: { xs: 100, sm: 120 },
    align: 'center'
  },
  {
    id: 'cancelReason',
    label: 'Lý do hủy',
    minWidth: { xs: 120, sm: 140 },
    align: 'center'
  },
  { id: '', minWidth: { xs: 60, sm: 88 } }
]

const defaultFilters: IAppointmentTableFilters = {
  patient: '',
  status: 'all',
  startDate: null,
  endDate: null,
  name: ''
}

export default function AppointmentListView() {
  const { enqueueSnackbar } = useSnackbar()
  const table = useTable({ defaultOrderBy: 'appointmentId' })
  const settings = useSettingsContext()
  const router = useRouter()
  const confirm = useBoolean()
  const [tableData, setTableData] = useState<IAppointmentItem[]>([])
  const [filters, setFilters] =
    useState<IAppointmentTableFilters>(defaultFilters)
  const [openCancelDialog, setOpenCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const dateError = isAfter(filters?.startDate, filters?.endDate)
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')
  const [appointmentSelected, setAppointmentSelected] = useState('')
  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
    dateError
  })
  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  )

  const denseHeight = table.dense ? 56 : 56 + 20

  const canReset =
    !!filters.patient ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate)

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length

  const { users: doctorsList } = useGetUsers({
    typeUser: 'doctor',
    query: '',
    page: 1,
    limit: 10,
    sortField: 'createdAt',
    sortOrder: 'desc'
  })
  const handleCancelAppointment = (appointmentId: string) => {
    setOpenCancelDialog(true)
    setAppointmentSelected(appointmentId)
  }

  useEffect(() => {
    const fetchAppointments = async () => {
      const appointments = await getAppointments()
      if (userProfile.role === 'PATIENT') {
        const patientAppointments = appointments.data.filter(
          (appointment: IAppointmentItem) =>
            appointment?.patient?._id === userProfile?._id
        )
        setTableData(patientAppointments)
      } else if (userProfile.role === 'DOCTOR') {
        const doctorAppointments = appointments.data.filter(
          (appointment: IAppointmentItem) =>
            appointment?.doctor?._id === userProfile?._id
        )
        setTableData(doctorAppointments)
      } else {
        setTableData(appointments.data)
      }
    }
    fetchAppointments()
  }, [userProfile?._id, userProfile.role])

  const handleFilters = useCallback(
    (name: any, value: IAppointmentTableFilterValue) => {
      table.onResetPage()
      setFilters(prevState => ({
        ...prevState,
        [name]: value
      }))
    },
    [table]
  )

  const handleDeleteRow = useCallback(
    (id: string) => {
      const deleteRow = tableData.filter(row => row._id !== id)
      enqueueSnackbar('Xóa thành công!')
      setTableData(deleteRow)
      table.onUpdatePageDeleteRow(dataInPage.length)
    },
    [dataInPage.length, enqueueSnackbar, table, tableData]
  )

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter(
      row => !table.selected.includes(row._id)
    )
    enqueueSnackbar('Xóa thành công!')
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
      router.push(paths.dashboard.appointment.details(id))
    },
    [router]
  )

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: any) => {
      handleFilters('status', newValue)
    },
    [handleFilters]
  )

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Danh sách lịch hẹn"
          links={[
            {
              name: 'Bảng điều khiển',
              href: paths.dashboard.root
            },
            {
              name: 'Lịch hẹn',
              href: paths.dashboard.appointment.root // Cập nhật đường dẫn
            },
            { name: 'Danh sách' }
          ]}
          sx={{
            mb: { xs: 1, md: 2 }
          }}
        />

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: theme =>
                `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`
            }}
          >
            {STATUS_OPTIONS.map(tab => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) &&
                        'filled') ||
                      'soft'
                    }
                    color={
                      (tab.value === 'PENDING' && 'warning') ||
                      (tab.value === 'CONFIRMED' && 'success') ||
                      (tab.value === 'CANCELLED' && 'error') ||
                      'default'
                    }
                  >
                    {tab.value === 'all'
                      ? tableData?.length
                      : tableData.filter(
                          appointment => appointment.status === tab.value
                        ).length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <AppointmentTableToolbar
            filters={filters}
            onFilters={handleFilters as any}
            dateError={dateError}
          />
          <TableContainer sx={{ position: 'relative', overflow: 'auto' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={checked =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row: any) => row._id) // Cập nhật để sử dụng _id
                )
              }
              action={
                <Tooltip title="Xóa">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table
                size={table.dense ? 'small' : 'medium'}
                sx={{ minWidth: 960, overflowX: 'auto' }}
              >
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={
                    userProfile.role === 'PATIENT'
                      ? TABLE_HEAD_PATIENT
                      : TABLE_HEAD
                  }
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={checked =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row: any) => row._id) // Cập nhật để sử dụng _id
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
                      <AppointmentTableRow
                        doctorsList={doctorsList}
                        key={row._id}
                        row={row}
                        typeUser={userProfile.role}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onDeleteRow={() => handleDeleteRow(row._id)}
                        onViewRow={() => handleViewRow(row._id)}
                        onCancelAppointment={() => {
                          handleCancelAppointment(row._id)
                        }}
                        user={userProfile}
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
            //
            dense={table.dense}
            onChangeDense={table.onChangeDense}
          />
        </Card>
      </Container>
      <CancelReasonDialog
        open={openCancelDialog}
        onClose={() => setOpenCancelDialog(false)}
        appointmentId={appointmentSelected}
      />
      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Xóa"
        content={
          <>
            Bạn có chắc chắn muốn xóa <strong> {table.selected.length} </strong>{' '}
            mục?
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
            Xóa
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
  inputData: IAppointmentItem[] // Cập nhật để sử dụng IAppointmentItem
  comparator: (a: any, b: any) => number
  filters: IAppointmentTableFilters // Cập nhật để sử dụng IAppointmentTableFilters
  dateError: boolean
}) {
  const { status, patient, startDate, endDate } = filters

  const stabilizedThis = inputData.map(
    (el: any, index: any) => [el, index] as const
  )

  stabilizedThis.sort((a: any, b: any) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })

  inputData = stabilizedThis.map((el: any) => el[0])

  if (patient) {
    inputData = inputData.filter(
      appointment =>
        appointment.patient.fullName
          .toLowerCase()
          .indexOf(patient.toLowerCase()) !== -1 ||
        appointment.patient.email
          .toLowerCase()
          .indexOf(patient.toLowerCase()) !== -1
    )
  }

  if (status !== 'all') {
    inputData = inputData.filter(appointment => appointment.status === status)
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(appointment =>
        isBetween(appointment.createdAt, startDate, endDate)
      )
    }
  }

  return inputData
}
