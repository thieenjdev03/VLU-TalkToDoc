'use client'

import { useMemo, useState, useCallback } from 'react'

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

import { useGetCases } from 'src/api/case'

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
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom
} from 'src/components/table'

import {
  IOrderItem,
  IOrderTableFilters,
  IOrderTableFilterValue
} from 'src/types/order'

import OrderTableToolbar from '../case-table-toolbar'
import OrderTableRow, { Case } from '../case-table-row'
import OrderTableFiltersResult from '../case-table-filters-result'

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất cả' },
  { value: 'draft', label: 'Nháp' },
  { value: 'pending', label: 'Chờ duyệt' },
  { value: 'assigned', label: 'Đã nhận' },
  { value: 'completed', label: 'Hoàn thành' }
]

const TABLE_HEAD = [
  { id: 'caseId', label: 'Mã bệnh án', minWidth: 140 },
  { id: 'patientName', label: 'Bệnh nhân', minWidth: 200 },
  { id: 'doctorName', label: 'Bác Sĩ', minWidth: 200 },
  { id: 'appointmentDate', label: 'Lịch hẹn', width: 120 },
  { id: 'totalAmount', label: 'Tổng tiền', width: 140 },
  { id: 'status', label: 'Trạng thái', width: 110 },
  { id: 'createdAt', label: 'Ngày tạo', width: 140 },
  { id: '', width: 88 }
]
const TABLE_HEAD_PATIENT = [
  { id: 'caseId', label: 'Mã bệnh án', minWidth: 140 },
  { id: 'doctorName', label: 'Bác Sĩ', minWidth: 200 },
  { id: 'patientName', label: 'Bệnh nhân', minWidth: 200 },
  { id: 'appointmentDate', label: 'Lịch hẹn', minWidth: 120 },
  { id: 'totalAmount', label: 'Tổng tiền', minWidth: 160 },
  { id: 'status', label: 'Trạng thái', width: 110 },
  { id: 'createdAt', label: 'Ngày tạo', width: 140 },
  { id: '', width: 88 }
]

const defaultFilters: IOrderTableFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null
}

// ----------------------------------------------------------------------

export default function OrderListView() {
  const { enqueueSnackbar } = useSnackbar()

  const table = useTable({ defaultOrderBy: 'caseId' })

  const settings = useSettingsContext()

  const router = useRouter()

  const confirm = useBoolean()

  const [filters, setFilters] = useState(defaultFilters)

  const dateError = isAfter(filters.startDate, filters.endDate)
  const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}')

  const { cases, total, isLoading, error } = useGetCases({
    q: filters.name,
    status: filters.status === 'all' ? '' : filters.status,
    page: table.page + 1,
    limit: table.rowsPerPage
  })

  const mappedCases = useMemo(
    () =>
      (cases || []).map((item: any) => ({
        _id: item._id,
        patient: item.patient,
        specialty: item.specialty,
        status: item.status,
        isDeleted: item.isDeleted,
        createdAt: item.createdAt,
        offers: item.offers,
        updatedAt: item.updatedAt,
        appointmentId: item.appointmentId
      })),
    [cases]
  )

  const canReset =
    !!filters.name ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate)

  const notFound = !mappedCases.length

  const handleFilters = useCallback(
    (name: string, value: IOrderTableFilterValue) => {
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

  const handleDeleteRow = useCallback(
    (id: string) => {
      enqueueSnackbar('Delete success!')
      // TODO: Gọi API xoá mềm nếu cần
    },
    [enqueueSnackbar]
  )

  const handleDeleteRows = useCallback(() => {
    enqueueSnackbar('Delete success!')
    // TODO: Gọi API xoá mềm nhiều nếu cần
  }, [enqueueSnackbar])

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.order.details(id))
    },
    [router]
  )

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue)
    },
    [handleFilters]
  )

  const denseHeight = table.dense ? 56 : 76

  if (isLoading) return <div>Đang tải...</div>
  if (error) return <div>Lỗi khi tải danh sách bệnh án</div>

  return (
    <>
      <Container maxWidth={settings.themeStretch ? 'xl' : 'xl'}>
        <CustomBreadcrumbs
          heading="Danh sách bệnh án"
          links={[
            { name: 'Trang quản trị', href: paths.dashboard.root },
            { name: 'Quản lý bệnh án', href: paths.dashboard.order.root },
            { name: 'Danh sách' }
          ]}
          sx={{ mb: { xs: 1, md: 2 } }}
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
                      (tab.value === 'completed' && 'success') ||
                      (tab.value === 'pending' && 'warning') ||
                      (tab.value === 'assigned' && 'info') ||
                      (tab.value === 'draft' && 'default') ||
                      'default'
                    }
                  >
                    {tab.value === 'all'
                      ? total
                      : mappedCases.filter(
                          (row: Record<string, any>) => row.status === tab.value
                        ).length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <OrderTableToolbar
            filters={filters}
            onFilters={handleFilters}
            dateError={dateError}
          />

          {canReset && (
            <OrderTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={total}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={mappedCases.length}
              onSelectAllRows={checked =>
                table.onSelectAllRows(
                  checked,
                  mappedCases.map((row: Record<string, any>) => row._id)
                )
              }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirm.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

            <Scrollbar>
              <Table
                size={table.dense ? 'small' : 'medium'}
                sx={{ minWidth: 960 }}
              >
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={
                    userProfile?.role === 'PATIENT'
                      ? TABLE_HEAD_PATIENT
                      : TABLE_HEAD
                  }
                  rowCount={mappedCases.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={checked =>
                    table.onSelectAllRows(
                      checked,
                      mappedCases.map((row: Record<string, any>) => row._id)
                    )
                  }
                />

                <TableBody>
                  {mappedCases.map((row: Case) => (
                    <OrderTableRow
                      key={row._id}
                      row={row}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                      onDeleteRow={() => handleDeleteRow(row._id)}
                      onViewRow={() => handleViewRow(row._id)}
                      userRole={userProfile?.role}
                    />
                  ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, total)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>

          <TablePaginationCustom
            count={total}
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
            Bạn có chắc muốn xoá <strong> {table.selected.length} </strong> bệnh
            án?
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
            Xoá
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
  inputData: IOrderItem[]
  comparator: (a: any, b: any) => number
  filters: IOrderTableFilters
  dateError: boolean
}) {
  const { status, name, startDate, endDate } = filters

  const stabilizedThis = inputData.map((el, index) => [el, index] as const)

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0])
    if (order !== 0) return order
    return a[1] - b[1]
  })

  inputData = stabilizedThis.map(el => el[0])

  if (name) {
    inputData = inputData.filter(
      order =>
        order.orderNumber.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        order.customer.name.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        order.customer.email.toLowerCase().indexOf(name.toLowerCase()) !== -1
    )
  }

  if (status !== 'all') {
    inputData = inputData.filter(order => order.status === status)
  }

  if (!dateError) {
    if (startDate && endDate) {
      inputData = inputData.filter(order =>
        isBetween(order.createdAt, startDate, endDate)
      )
    }
  }

  return inputData
}
