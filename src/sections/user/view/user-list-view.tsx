import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import { alpha } from '@mui/material/styles';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetUsers, useDeleteUser } from 'src/api/user';
import { _userList, _specialties, USER_STATUS_OPTIONS } from 'src/_mock';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import Scrollbar from 'src/components/scrollbar';
import { useSnackbar } from 'src/components/snackbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { useSettingsContext } from 'src/components/settings';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { IUserItem, IUserTableFilters, IUserTableFilterValue } from 'src/types/user';

import UserTableRow from '../user-table-row';
import UserTableToolbar from '../user-table-toolbar';
import UserTableFiltersResult from '../user-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'Tất Cả' }, ...USER_STATUS_OPTIONS];
console.log('check table user list data', _userList);
const TABLE_HEAD_DEFAULT = [
  { id: 'fullName', label: 'Họ & Tên' },
  { id: 'phoneNumber', label: 'SĐT', width: 180 },
  { id: 'company', label: 'Bệnh Viện', width: 220 },
  { id: 'role', label: 'Vị Trí', width: 180 },
  { id: 'status', label: 'Trạng Thái', width: 100 },
  { id: '', width: 88 },
];

const TABLE_HEAD_DOCTOR = [
  { id: 'fullName', label: 'Họ & Tên', width: 200 },
  { id: 'hospitalId', label: 'Bệnh Viện', width: 220 },
  { id: 'rank', label: 'Cấp Bậc', width: 180 },
  { id: 'specialty', label: 'Chuyên Khoa', width: 200 },
  { id: 'city', label: 'Thành Phố', width: 220 },
  { id: 'phoneNumber', label: 'SĐT', width: 180 },
  { id: 'experienceYears', label: 'Kinh Nghiệm (Năm)', width: 120 },
  { id: 'licenseNo', label: 'Mã Giấy Phép', width: 180 },
  { id: 'status', label: 'Trạng Thái', width: 100 },
  { id: '', width: 88 },
];

const TABLE_HEAD_EMPLOYEE = [
  { id: 'fullName', label: 'Họ & Tên' },
  { id: 'phoneNumber', label: 'SĐT', width: 180 },
  { id: 'hospitalId', label: 'Bệnh Viện', width: 220 },
  { id: 'role', label: 'Vị Trí', width: 180 },
  { id: 'specialty', label: 'Chuyên Khoa', width: 200 },
  { id: 'status', label: 'Trạng Thái', width: 100 },
  { id: '', width: 88 },
];

const defaultFilters: IUserTableFilters = {
  fullName: '',
  specialty: [],
  status: 'all',
};

// ----------------------------------------------------------------------

export default function UserListView(props: { typeUser: 'user' | 'doctor' | 'employee' }) {
  const { typeUser } = props;

  const { enqueueSnackbar } = useSnackbar();

  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState<IUserItem[]>([]);

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });
  const { users, usersLoading, usersError, usersValidating } = useGetUsers({ typeUser });
  useEffect(() => {
    if (users.length) {
      setTableData(users);
    }
    if (usersLoading) {
      setTableData([]);
    }
    if (usersError) {
      setTableData([]);
    }
    if (usersValidating) {
      setTableData([]);
    }
  }, [users, usersLoading, usersError, usersValidating]);
  console.log('check dataFiltered', dataFiltered);

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (fullName: string, value: IUserTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [fullName]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters);
  }, []);
  const { deleteDoctor } = useDeleteUser(); // ✅ Dùng Hook ở ngoài
  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await deleteDoctor(id); // ✅ Gọi API xóa doctor
        enqueueSnackbar('Xoá người dùng thành công!', { variant: 'success' });
        table.onUpdatePageDeleteRow(dataInPage.length);
      } catch (error) {
        console.error('Error deleting doctor:', error);
        enqueueSnackbar('Không thể xoá người dùng!', { variant: 'error' });
      }
    },
    [dataInPage.length, enqueueSnackbar, table, deleteDoctor] // ✅ Thêm `deleteDoctor` vào dependency
  );

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter((row) => !table.selected.includes(row.id));

    enqueueSnackbar('Xoá người dùng thành công!');

    setTableData(deleteRows);

    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataInPage.length,

      totalRowsFiltered: dataFiltered.length,
    });
  }, [dataFiltered.length, dataInPage.length, enqueueSnackbar, table, tableData]);

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.user.edit(id));
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading={
            {
              user: 'Bệnh Nhân',
              employee: 'Nhân Viên',
              doctor: 'Bác Sĩ',
            }[typeUser]
          }
          links={[
            { name: 'Trang Chủ', href: paths.dashboard.root },
            { name: 'Quản Lý Người Dùng', href: paths.dashboard.user.root },
            {
              name: {
                user: 'Bệnh Nhân',
                employee: 'Nhân Viên',
                doctor: 'Bác Sĩ',
              }[typeUser],
            },
          ]}
          action={
            <Button
              component={RouterLink}
              href={`${paths.dashboard.user.new}-${typeUser}`}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Tạo mới
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={{
              px: 2.5,
              boxShadow: (theme) => `inset 0 -2px 0 0 ${alpha(theme.palette.grey[500], 0.08)}`,
            }}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') || 'soft'
                    }
                    color={
                      (tab.value === 'active' && 'success') ||
                      (tab.value === 'pending' && 'warning') ||
                      (tab.value === 'banned' && 'error') ||
                      'default'
                    }
                  >
                    {['active', 'pending', 'banned', 'rejected'].includes(tab.value)
                      ? tableData.filter((user) => user.status === tab.value).length
                      : tableData.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <UserTableToolbar
            filters={filters}
            onFilters={handleFilters}
            //
            roleOptions={_specialties.map((item) => item.label)}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  dataFiltered.map((row) => row.id)
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
              <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                <TableHeadCustom
                  order={table.order}
                  orderBy={table.orderBy}
                  headLabel={
                    {
                      user: TABLE_HEAD_DEFAULT,
                      doctor: TABLE_HEAD_DOCTOR,
                      employee: TABLE_HEAD_EMPLOYEE,
                    }[typeUser]
                  }
                  rowCount={dataFiltered.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      dataFiltered.map((row) => row.id)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <UserTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onDeleteRow={() => handleDeleteRow(row._id)}
                        onEditRow={() => handleEditRow(row.id)}
                        typeUser={typeUser}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

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

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Xoá"
        content={
          <>
            Bạn có chắc chắn muốn xoá <strong> {table.selected.length} </strong> người dùng?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRows();
              confirm.onFalse();
            }}
          >
            Xoá
          </Button>
        }
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: IUserItem[];
  comparator: (a: any, b: any) => number;
  filters: IUserTableFilters;
}) {
  const { fullName, status, specialty } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (fullName) {
    inputData = inputData.filter(
      (user) => user.fullName.toLowerCase().indexOf(fullName.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (specialty.length) {
    inputData = inputData.filter((user) => specialty.includes(user.role));
  }

  return inputData;
}
