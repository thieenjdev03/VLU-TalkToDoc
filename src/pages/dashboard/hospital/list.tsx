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
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { useGetPharmacies, useDeletePharmacy } from 'src/api/pharmacy'; // Updated to use pharmacy API
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

import PharmacyTableToolbar from 'src/sections/pharmacy/table-toolbar'; // Updated to use pharmacy toolbar
import PharmacyTableRow from 'src/sections/pharmacy/pharmacy-table-row'; // Updated to use pharmacy filters result
import PharmacyQuickEditForm from 'src/sections/pharmacy/quick-edit-form'; // Import the edit form

import {
  IPharmacyItem,
  IPharmacyTableFilters,
  IPharmacyTableFilterValue,
} from 'src/types/pharmacy'; // Updated types

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'Tất Cả' }, ...USER_STATUS_OPTIONS];
const TABLE_HEAD_PHARMACY = [
  { id: '_id', label: 'ID', width: 100 },
  { id: 'name', label: 'Tên Nhà Thuốc', width: '20%' },
  { id: 'address', label: 'Địa Chỉ', width: '20%' },
  { id: 'city', label: 'Thành Phố', width: '20%' },
  { id: 'phoneNumber', label: 'Số Điện Thoại', width: '20%' },
  { id: 'is24Hours', label: 'Hoạt Động 24/7', width: '10%' },
];
const defaultFilters: IPharmacyTableFilters = {
  name: '',
  status: 'all',
  pharmacy: [],
};

// ----------------------------------------------------------------------

export default function HospitalListPage() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();

  const settings = useSettingsContext();

  const confirm = useBoolean();

  const [tableData, setTableData] = useState<IPharmacyItem[]>([]); // Updated state type

  const [filters, setFilters] = useState(defaultFilters);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const [selectedPharmacy, setSelectedPharmacy] = useState<IPharmacyItem | undefined>(undefined);
  const editDialog = useBoolean();

  const { pharmacies, pharmaciesLoading, pharmaciesError, pharmaciesValidating } =
    useGetPharmacies();

  useEffect(() => {
    if (pharmacies.length) {
      setTableData(pharmacies);
    } else if (pharmaciesLoading || pharmaciesError || pharmaciesValidating) {
      setTableData([]);
    }
  }, [pharmacies, pharmaciesLoading, pharmaciesError, pharmaciesValidating]);

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 56 + 20;

  const canReset = !isEqual(defaultFilters, filters);

  const notFound = (!tableData.length && canReset) || !tableData.length;

  const handleFilters = useCallback(
    (fullName: string, value: IPharmacyTableFilterValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [fullName]: value,
      }));
    },
    [table]
  );

  const { deletePharmacy } = useDeletePharmacy();
  const handleDeleteRow = useCallback(
    async (id: string) => {
      await deletePharmacy(id)
        .then(() => {
          enqueueSnackbar('Xoá nhà thuốc thành công!', { variant: 'success' });
          table.onUpdatePageDeleteRow(dataInPage.length);
          confirm.onFalse();

          // Trigger refetch after successful deletion
        })
        .catch(() => {
          enqueueSnackbar('Không thể xoá nhà thuốc!', { variant: 'error' });
        });
    },
    [dataInPage.length, enqueueSnackbar, table, deletePharmacy, confirm]
  );

  const handleEditRow = useCallback(
    (_id: string) => {
      // Option 1: Navigate to edit page
      // router.push(paths.dashboard.pharmacies.edit(_id));

      // Option 2: Open edit dialog
      const pharmacy = tableData.find((p) => p._id === _id);
      setSelectedPharmacy(pharmacy);
      editDialog.onTrue();
    },
    [tableData, editDialog]
  );

  const handleFilterStatus = useCallback(
    (event: React.SyntheticEvent, newValue: IPharmacyTableFilterValue) => {
      handleFilters('status', newValue);
    },
    [handleFilters]
  );

  // Function to handle refetch after successful operations

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
                    {/* {['Hoạt Động', 'Đã Khoá'].includes(tab.value)
                      ? tableData.filter((pharmacy) => pharmacy.active === tab.value).length
                      : tableData.length} */}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <PharmacyTableToolbar
            filters={filters}
            onFilters={handleFilters}
            pharmacyOptions={tableData.map((item) => item.name)} // Updated to use pharmacy options
          />

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
                  headLabel={TABLE_HEAD_PHARMACY} // Updated to use pharmacy table head
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
                  {dataFiltered.map((row) => (
                    <PharmacyTableRow
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
            Bạn có chắc chắn muốn xoá <strong> {table.selected.length} </strong> nhà thuốc?
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
      {selectedPharmacy && (
        <PharmacyQuickEditForm
          open={editDialog.value}
          onClose={editDialog.onFalse}
          currentPharmacy={selectedPharmacy}
        />
      )}
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({
  inputData,
  comparator,
  filters,
}: {
  inputData: IPharmacyItem[]; // Updated type
  comparator: (a: any, b: any) => number;
  filters: IPharmacyTableFilters; // Updated type
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
      (pharmacy) => pharmacy?.name?.toLowerCase().includes(name?.toLowerCase())
    );
  }

  // if (status !== 'all') {
  //   inputData = inputData.filter((pharmacy) => pharmacy.active === status);
  // }

  return inputData;
}
