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

import { useGetHospital, useDeleteHospital } from 'src/api/hospital'; // Updated to use hospital API
import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

// Updated to use pharmacy API

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

import PharmacyTableToolbar from 'src/sections/hospital/table-toolbar'; // Updated to use pharmacy toolbar
import PharmacyTableRow from 'src/sections/hospital/hospital-table-row'; // Updated to use pharmacy filters result
import PharmacyQuickEditForm from 'src/sections/hospital/quick-edit-form'; // Import the edit form

import { IHospitalItem, IHospitalTableFilters } from 'src/types/hospital'; // Updated types

// ----------------------------------------------------------------------

const TABLE_HEAD_PHARMACY = [
  { id: '_id', label: 'Mã Bệnh Viện', width: 100 },
  { id: 'name', label: 'Tên Bệnh Viện', width: '20%' },
  { id: 'address', label: 'Địa Chỉ', width: '20%' },
  { id: 'phoneNumber', label: 'Số Điện Thoại', width: '20%' },
  { id: 'isPublic', label: 'BV Công', width: '10%' },
  { id: 'isActive', label: 'Kích Hoạt', width: '10%' },
  { id: '', label: '', width: '10%' },
];
const defaultFilters: IHospitalTableFilters = {
  name: '',
  status: 'all',
  hospital: [],
};

// ----------------------------------------------------------------------

export default function HospitalListPage() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();

  const settings = useSettingsContext();
  const confirm = useBoolean();
  const [tableData, setTableData] = useState<IHospitalItem[]>([]); // Updated state type
  const [filters, setFilters] = useState(defaultFilters);
  const [selectedHospital, setSelectedHospital] = useState<IHospitalItem | undefined>(undefined);
  const editDialog = useBoolean();
  const { deleteHospital } = useDeleteHospital();
  const [searchQuery, setSearchQuery] = useState('');
  const [total, setTotal] = useState(0);
  const { hospitals, hospitalsLoading, hospitalsError, hospitalsValidating } = useGetHospital({
    query: searchQuery,
    page: table.page + 1,
    limit: table.rowsPerPage,
    sortField: table.orderBy || 'name',
    sortOrder: table.order === 'asc' ? 'asc' : 'desc',
  });

  useEffect(() => {
    if (hospitals?.data?.length) {
      setTableData(hospitals?.data);
      setTotal(hospitals?.total);
    } else if (hospitalsLoading || hospitalsError || hospitalsValidating) {
      setTableData([]);
    }
  }, [hospitals, hospitalsLoading, hospitalsError, hospitalsValidating]);

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!tableData?.length && canReset) || !tableData?.length;
  const handleFilters = useCallback(
    (name: string, value: any) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );
  const handleDeleteRow = useCallback(
    async (id: string) => {
      await deleteHospital(id)
        .then(() => {
          enqueueSnackbar('Xoá Bệnh Viện thành công!', { variant: 'success' });
          // window.location.reload();
          table.onUpdatePageDeleteRow(tableData?.length);
          confirm.onFalse();

          // Trigger refetch after successful deletion
        })
        .catch(() => {
          enqueueSnackbar('Không thể xoá nhà thuốc!', { variant: 'error' });
        });
    },
    [tableData?.length, enqueueSnackbar, table, deleteHospital, confirm]
  );

  const handleEditRow = useCallback(
    (_id: string) => {
      // Option 1: Navigate to edit page
      // router.push(paths.dashboard.hospitals.edit(_id));

      // Option 2: Open edit dialog
      const pharmacy = tableData.find((p) => p._id === _id);
      setSelectedHospital(pharmacy);
      editDialog.onTrue();
    },
    [tableData, editDialog]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'} sx={{ overflow: 'hidden' }}>
        <CustomBreadcrumbs
          heading="Quản Lý Bệnh Viện"
          links={[
            {
              name: 'Quản Lý Bệnh Viện',
              href: paths.dashboard.hospital.root,
            },
          ]}
          action={
            <Button
              component={RouterLink}
              href={`${paths.dashboard.hospital.new}`} // Updated to new pharmacy path
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
          <PharmacyTableToolbar
            filters={filters}
            onFilters={handleFilters}
            onSearchChange={setSearchQuery}
          />

          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected?.length}
              rowCount={tableData?.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(checked, tableData?.map((row) => row._id))
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
                  headLabel={TABLE_HEAD_PHARMACY} // Updated to use pharmacy table head
                  rowCount={tableData?.length}
                  numSelected={table.selected?.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(checked, tableData?.map((row) => row._id))
                  }
                />

                <TableBody>
                  {tableData?.map((row) => (
                    <PharmacyTableRow
                      key={row._id}
                      row={row}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                      onDeleteRow={() => handleDeleteRow(row._id)}
                      onEditRow={() => handleEditRow(row._id)}
                    />
                  ))}
                  {tableData.length === 0 && (
                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, tableData?.length)}
                    />
                  )}

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
            Bạn có chắc chắn muốn xoá <strong> {table.selected?.length} </strong> nhà thuốc?
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

      {/* Add Quick Edit Dialog */}
      {selectedHospital && (
        <PharmacyQuickEditForm
          open={editDialog.value}
          onClose={editDialog.onFalse}
          currentHospital={selectedHospital}
        />
      )}
    </>
  );
}

// ----------------------------------------------------------------------
