import isEqual from 'lodash/isEqual'
import debounce from 'lodash/debounce'
import { useMemo, useState, useEffect, useCallback } from 'react'

import Tab from '@mui/material/Tab'
import { Box } from '@mui/material'
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
import { RouterLink } from 'src/routes/components'

import { useBoolean } from 'src/hooks/use-boolean'

import { useGetRanking } from 'src/api/ranking'
import { useGetHospital } from 'src/api/hospital'
import { useGetUsers, useDeleteUser } from 'src/api/user'
import { _userList, USER_STATUS_OPTIONS } from 'src/_mock'

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
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom
} from 'src/components/table' // Updated to use specialty API

import { useGetSpecialties } from 'src/api/specialty'

import { ISpecialtyItem } from 'src/types/specialties'
import {
  IUserItem,
  IUserTableFilters,
  IUserTableFilterValue
} from 'src/types/user'

import UserTableRow from '../user-table-row'
import UserTableToolbar from '../user-table-toolbar'
import UserTableFiltersResult from '../user-table-filters-result'
// ----------------------------------------------------------------------

const STATUS_OPTIONS = [
  { value: 'all', label: 'Tất Cả' },
  ...USER_STATUS_OPTIONS
]
console.log('check table user list data', _userList)
const TABLE_HEAD_PATIENT = [
  { id: 'id', label: 'Mã Bệnh Nhân', width: 200 },
  { id: 'fullName', label: 'Họ & Tên', width: 200 },
  { id: 'phone', label: 'Số Điện Thoại', width: 160 },
  { id: 'birthDate', label: 'Ngày Sinh', width: 160 },
  { id: 'gender', label: 'Giới Tính', width: 120 },
  { id: 'address', label: 'Địa Chỉ', width: 250 },
  { id: 'status', label: 'Công khai', width: 100 },
  { id: '', width: 88 }
]

const TABLE_HEAD_DOCTOR = [
  { id: 'id', label: 'Mã Bác Sĩ', minWidth: 100 },
  { id: 'fullName', label: 'Họ & Tên', minWidth: 180 },
  { id: 'hospital', label: 'Bệnh Viện', minWidth: 200 },
  { id: 'position', label: 'Chức Vụ', minWidth: 160 },
  { id: 'rank', label: 'Cấp Bậc', minWidth: 150 },
  { id: 'specialty', label: 'Chuyên Khoa', minWidth: 260 },
  { id: 'phoneNumber', label: 'SĐT', minWidth: 140 },
  { id: 'experienceYears', label: 'Kinh Nghiệm (Năm)', minWidth: 100 },
  { id: 'licenseNo', label: 'Mã Giấy Phép', minWidth: 100 },
  { id: 'status', label: 'Công khai', minWidth: 80 },
  { id: 'registrationStatus', label: 'Trạng thái đăng ký', minWidth: 240 },
  { id: 'lastLogin', label: 'Lần đăng nhập cuối', minWidth: 240 },
  { id: '', width: 72 } // nút hành động (edit/delete)
]

const TABLE_HEAD_EMPLOYEE = [
  { id: 'id', label: 'Mã Nhân Viên', width: 200 },
  { id: 'fullName', label: 'Họ & Tên' },
  { id: 'phoneNumber', label: 'SĐT', width: 180 },
  { id: 'city', label: 'Thành Phố', width: 180 },
  { id: 'department', label: 'Bộ Phận', width: 220 },
  { id: 'role', label: 'Vai Trò', width: 180 },
  { id: 'salary', label: 'Lương / Tháng', width: 220 },
  { id: 'status', label: 'Công khai', width: 100 },
  { id: '', width: 88 }
]

const defaultFilters: IUserTableFilters = {
  fullName: '',
  specialty: [],
  status: 'all'
}

// ----------------------------------------------------------------------

export default function UserListView(props: {
  typeUser: 'user' | 'doctor' | 'employee' | 'patient'
}) {
  const { typeUser } = props
  const { enqueueSnackbar } = useSnackbar()
  const table = useTable()
  const { providerRanking } = useGetRanking({
    query: '',
    page: 1,
    limit: 10,
    sortField: 'updatedAt',
    sortOrder: 'desc'
  })
  const settings = useSettingsContext()
  const confirm = useBoolean()
  const [tableData, setTableData] = useState<IUserItem[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState(defaultFilters)
  const [specialtyList, setSpecialtyList] = useState<ISpecialtyItem[]>([])
  console.log('confirm check data', confirm)
  // Fetch specialties only when searchQuery changes
  const { specialties } = useGetSpecialties({
    query: searchQuery,
    page: 1, // Changed to 1 to avoid multiple fetches
    limit: 99,
    sortField: 'updatedAt',
    sortOrder: 'desc'
  })

  // Fetch users only when typeUser, searchQuery, or filters change
  const { users, usersLoading, usersError, usersValidating, usersTotal } =
    useGetUsers({
      typeUser,
      query: searchQuery,
      page: table.page + 1,
      limit: table.rowsPerPage,
      sortField: table.orderBy || 'updatedAt',
      sortOrder: table.order || 'desc'
    })

  // Fetch hospitals only when searchQuery changes
  const { hospitals } = useGetHospital({
    query: searchQuery,
    page: 1, // Changed to 1 to avoid multiple fetches
    limit: 99,
    sortField: 'updatedAt',
    sortOrder: 'desc'
  })

  useEffect(() => {
    if (specialties?.data?.length) {
      setSpecialtyList(specialties?.data)
    }
    if (users) {
      setTableData(users)
    }
    if (usersLoading || usersError || usersValidating) {
      setTableData([])
    }
  }, [users, usersLoading, usersError, usersValidating, specialties])

  const dataFiltered = tableData

  const denseHeight = table.dense ? 56 : 56 + 20

  const canReset = !isEqual(defaultFilters, filters)

  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setSearchQuery(query)
        table.onResetPage()
      }, 1000),
    [table]
  )

  const handleFilters = useCallback(
    (fullName: string, value: IUserTableFilterValue) => {
      table.onResetPage()
      setFilters(prevState => ({
        ...prevState,
        [fullName]: value
      }))
    },
    [table]
  )

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const { deleteUser } = useDeleteUser({ typeUser })

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await deleteUser(id)
        enqueueSnackbar('Xoá người dùng thành công!', { variant: 'success' })
        table.onUpdatePageDeleteRow(tableData.length)
      } catch (err) {
        enqueueSnackbar('Không thể xoá người dùng!', { variant: 'error' })
      }
    },
    [deleteUser, enqueueSnackbar, table, tableData.length]
  )

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter(row => !table.selected.includes(row.id))

    enqueueSnackbar('Xoá người dùng thành công!')

    setTableData(deleteRows)

    table.onUpdatePageDeleteRows({
      totalRowsInPage: tableData.length,
      totalRowsFiltered: dataFiltered.length
    })
  }, [dataFiltered.length, enqueueSnackbar, table, tableData])

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue)
    },
    [handleFilters]
  )

  return (
    <>
      <Container
        maxWidth={settings.themeStretch ? false : 'lg'}
        sx={{ overflow: 'hidden' }}
      >
        <CustomBreadcrumbs
          heading={
            {
              patient: 'Bệnh Nhân',
              employee: 'Nhân Viên',
              doctor: 'Bác Sĩ',
              user: 'Người Dùng'
            }[typeUser]
          }
          links={[
            { name: 'Trang Chủ', href: paths.dashboard.root },
            { name: 'Danh Sách', href: paths.dashboard.user.root },
            {
              name: {
                patient: 'Bệnh Nhân',
                employee: 'Nhân Viên',
                doctor: 'Bác Sĩ',
                user: 'Người Dùng'
              }[typeUser]
            }
          ]}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                component={RouterLink}
                href={`${paths.dashboard.user.new}-${typeUser}`}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                Tạo mới
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => {
                  window.location.reload()
                }}
                startIcon={<Iconify icon="eva:refresh-fill" />}
              >
                Làm mới
              </Button>
            </Box>
          }
          sx={{
            mb: { xs: 3, md: 5 }
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
                      (tab.value === 'active' && 'success') ||
                      (tab.value === 'pending' && 'warning') ||
                      (tab.value === 'banned' && 'error') ||
                      'default'
                    }
                  >
                    {['active', 'pending', 'banned', 'rejected'].includes(
                      tab.value
                    )
                      ? tableData.filter(user => user.status === tab.value)
                          .length
                      : tableData.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters} // ✅ Cho phép user nhập query tìm kiếm
            roleOptions={specialtyList.map(item => item.name)}
            onSearchChange={debouncedSearch}
            typeUser={typeUser}
          />
          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              onResetFilters={handleResetFilters}
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}
          <TableContainer
            sx={{ position: 'relative', overflow: 'unset', minWidth: '1020px' }}
          >
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={checked =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered?.map(row => row.id)
                )
              }
              action={
                <Tooltip title="Xoá">
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
                    {
                      user: TABLE_HEAD_PATIENT,
                      doctor: TABLE_HEAD_DOCTOR,
                      employee: TABLE_HEAD_EMPLOYEE,
                      patient: TABLE_HEAD_PATIENT
                    }[typeUser]
                  }
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={checked =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered?.map(row => row.id)
                    )
                  }
                />

                <TableBody>
                  {tableData.map(row => (
                    <UserTableRow
                      key={row._id}
                      row={row}
                      ranking={providerRanking}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                      onDeleteRow={() => handleDeleteRow(row._id)}
                      typeUser={typeUser}
                      hospitalList={hospitals?.data}
                    />
                  ))}
                  {tableData.length === 0 && (
                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(
                        table.page,
                        table.rowsPerPage,
                        dataFiltered.length
                      )}
                    />
                  )}
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
          <TablePaginationCustom
            count={usersTotal}
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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Xoá"
        content={
          <>
            Bạn có chắc chắn muốn xoá <strong> {table.selected.length} </strong>{' '}
            người dùng?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              await handleDeleteRows()
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
