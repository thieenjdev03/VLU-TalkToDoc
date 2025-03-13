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

import { useGetSpecialties, useDeleteSpecialty } from 'src/api/specialty'; // Updated to use specialty API
import { USER_STATUS_OPTIONS } from 'src/_mock';

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

import SpecialtyTableToolbar from 'src/sections/speciality/table-toolbar';
// Updated to use specialty toolbar
import SpecialtyTableRow from 'src/sections/speciality/speciality-table-row';
// Updated to use specialty filters result

import {
  ISpecialtyItem,
  ISpecialtyTableFilters,
  ISpecialtyTableFilterValue,
} from 'src/types/specialties'; // Updated types

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'Tất Cả' }, ...USER_STATUS_OPTIONS];
const TABLE_HEAD_SPECIALTY = [
  // Updated table head for specialties
  { id: '_id', label: 'ID', width: 100 },
  { id: 'name', label: 'Tên Chuyên Khoa', width: '20%' },
  { id: 'description', label: 'Mô Tả', width: '20%' },
  { id: 'status', label: 'Trạng Thái', width: '20%' },
];
const defaultFilters: ISpecialtyTableFilters = {
  // Updated default filters
  name: '',
  status: 'all',
  specialty: [],
};

// ----------------------------------------------------------------------

export default function SpecialtiesListPage() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();

  const settings = useSettingsContext();

  const router = useRouter();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState<ISpecialtyItem[]>([]); // Updated state type

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const { specialties, specialtiesLoading, specialtiesError, specialtiesValidating } =
    useGetSpecialties();

  useEffect(() => {
    const specialtiesMockData = [
      {
        _id: 'SP01',
        name: 'Chuyên Khoa 1',
        description: 'Mô Tả 1',
        status: 'Hoạt Động',
      },
      {
        _id: 'SP02',
        name: 'Chuyên Khoa 2',
        description: 'Mô Tả 2',
        status: 'Đã Khoá',
      },
    ];
    if (specialties.length) {
      setTableData(specialties);
    } else if (specialtiesMockData) {
      setTableData(specialtiesMockData);
      console.log(specialtiesMockData);
    }
    if (
      (specialtiesLoading || specialtiesError || specialtiesValidating) &&
      !specialtiesMockData.length
    ) {
      setTableData([]);
    }
  }, [specialties, specialtiesLoading, specialtiesError, specialtiesValidating]);

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const handleFilters = useCallback(
    (fullName: string, value: ISpecialtyTableFilterValue) => {
      // Updated to use specialty filters
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [fullName]: value,
      }));
    },
    [table]
  );

  // const handleResetFilters = useCallback(() => {
  //   setFilters(defaultFilters);
  // }, []);
  const { deleteSpecialty } = useDeleteSpecialty();
  const handleDeleteRow = useCallback(
    async (id: string) => {
      await deleteSpecialty(id)
        .then(() => {
          enqueueSnackbar('Xoá người dùng thành công!', { variant: 'success' });
          table.onUpdatePageDeleteRow(dataInPage.length);
          confirm.onFalse();
        })
        .catch((err) => {
          enqueueSnackbar('Không thể xoá người dùng!', { variant: 'error' });
        });
    },
    [dataInPage.length, enqueueSnackbar, table, deleteSpecialty, confirm]
  );
  const handleEditRow = useCallback(
    (_id: string) => {
      router.push(paths.dashboard.specialties.edit(_id)); // Updated path for specialties
    },
    [router]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: ISpecialtyTableFilterValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );
  console.log('tableData check data', tableData);
  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'} sx={{ overflow: 'hidden' }}>
        <CustomBreadcrumbs
          heading="Quản Lý Chuyên Khoa"
          links={[
            {
              name: 'Quản Lý Chuyên Khoa',
              href: paths.dashboard.specialties.root,
            },
          ]}
          action={
            <Button
              component={RouterLink}
              href={`${paths.dashboard.specialties.new}`} // Updated to new specialty path
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
                      (tab.value === 'Hoạt Động' && 'success') ||
                      (tab.value === 'Đã Khoá' && 'error') ||
                      'default'
                    }
                  >
                    {['Hoạt Động', 'Đã Khoá'].includes(tab.value)
                      ? tableData.filter((specialty) => specialty.status === tab.value).length
                      : tableData.length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <SpecialtyTableToolbar // Updated to use specialty toolbar
            filters={filters}
            onFilters={handleFilters}
            //
            specialtyOptions={tableData.map((item) => item.name)} // Updated to use status options
          />

          {/* {canReset && (
            <SpecialtyTableFiltersResult // Updated to use specialty filters result
              filters={filters}
              onFilters={handleFilters}
              //
              onResetFilters={handleResetFilters}
              //
              results={dataFiltered.length}
              sx={{ p: 2.5, pt: 0 }}
            />
          )} */}
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row._id)
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
                  headLabel={TABLE_HEAD_SPECIALTY} // Updated to use specialty table head
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row._id)
                    )
                  }
                />

                <TableBody>
                  {tableData
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <SpecialtyTableRow
                        key={row._id}
                        row={row}
                        selected={table.selected.includes(row._id)}
                        onSelectRow={() => table.onSelectRow(row._id)}
                        onDeleteRow={() => handleDeleteRow(row._id)}
                        onEditRow={() => handleEditRow(row._id)}
                      />
                    ))}

                  <TableEmptyRows
                    height={denseHeight}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </TableContainer>
          <TablePaginationCustom
            count={tableData.length}
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
            Bạn có chắc chắn muốn xoá <strong> {table.selected.length} </strong> chuyên khoa?
          </>
        }
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              handleDeleteRow(table.selected[0]);
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
  inputData: ISpecialtyItem[]; // Updated type
  comparator: (a: any, b: any) => number;
  filters: ISpecialtyTableFilters; // Updated type
}) {
  const { name, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (specialty) => specialty.name.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((specialty) => specialty.status === status);
  }

  return inputData;
}
