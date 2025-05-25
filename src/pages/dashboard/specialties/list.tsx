import isEqual from 'lodash/isEqual';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetSpecialties, useDeleteSpecialty } from 'src/api/specialty'; // Updated to use specialty API

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
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import SpecialtyTableToolbar from 'src/sections/speciality/table-toolbar';
import SpecialtyTableRow from 'src/sections/speciality/speciality-table-row';

import { ISpecialtyTableFilters } from 'src/types/specialties';

// ----------------------------------------------------------------------

const TABLE_HEAD_SPECIALTY = [
  { id: '_id', label: 'Mã Chuyên Khoa', width: 100 },
  { id: 'avatar', label: 'Ảnh bìa', width: 100 },
  { id: 'name', label: 'Tên Chuyên Khoa', width: '20%' },
  { id: 'description', label: 'Mô Tả', width: '20%' },
  { id: 'isActive', label: 'Kích Hoạt', width: '10%' },
  { id: 'updatedAt', label: 'Cập Nhật Lần Cuối', width: '10%' },
  { id: 'updatedAt', label: 'Cập Nhật Lần Cuối', width: '10%' },
];
const defaultFilters: ISpecialtyTableFilters = {
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

  const [tableData, setTableData] = useState<any>();
  const [searchQuery, setSearchQuery] = useState('');
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState(defaultFilters);

  const { specialties, specialtiesLoading, specialtiesError, specialtiesValidating } =
    useGetSpecialties({
      query: searchQuery,
      page: table.page + 1,
      limit: table.rowsPerPage,
      sortField: table.orderBy || 'fullName',
      sortOrder: table.order || 'asc',
    });

  useEffect(() => {
    if (specialties?.data?.length) {
      setTableData(specialties?.data);
      setTotal(specialties?.total);
    } else if (specialtiesLoading || specialtiesError || specialtiesValidating) {
      setTableData([]);
    }
  }, [specialties, specialtiesLoading, specialtiesError, specialtiesValidating]);

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!tableData?.length && canReset) || !tableData?.length;
  const handleFilters = useCallback(
    (fullName: string, value: any) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [fullName]: value,
      }));
    },
    [table]
  );
  const { deleteSpecialty } = useDeleteSpecialty();
  const handleDeleteRow = useCallback(
    async (id: string) => {
      await deleteSpecialty(id)
        .then(() => {
          enqueueSnackbar('Xoá chuyên khoa thành công!', { variant: 'success' });
          table.onUpdatePageDeleteRow(tableData.length);
          confirm.onFalse();
        })
        .catch(() => {
          enqueueSnackbar('Không thể xoá chuyên khoa!', { variant: 'error' });
        });
    },
    [tableData?.length, enqueueSnackbar, table, deleteSpecialty, confirm]
  );

  const handleEditRow = useCallback(
    (_id: string) => {
      router.push(paths.dashboard.specialties.edit(_id));
    },
    [router]
  );
  console.log('tableData', tableData);
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
              href={`${paths.dashboard.specialties.new}`}
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
          <SpecialtyTableToolbar
            filters={filters}
            onFilters={handleFilters}
            onSearchChange={setSearchQuery}
            specialtyOptions={[]}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table?.selected?.length}
              rowCount={tableData?.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row: any) => row._id)
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
                  headLabel={TABLE_HEAD_SPECIALTY}
                  rowCount={tableData?.length}
                  numSelected={table?.selected?.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row: any) => row._id)
                    )
                  }
                />

                <TableBody>
                  {tableData?.map((row: any) => (
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
                    emptyRows={emptyRows(table.page, table.rowsPerPage, tableData?.length)}
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
        title="Xoá"
        content={
          <>
            Bạn có chắc chắn muốn xoá <strong> {table?.selected?.length} </strong> chuyên khoa?
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
