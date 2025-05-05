import { mutate } from 'swr';
import { useState, useEffect, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import TableBody from '@mui/material/TableBody';
import { Tooltip, IconButton } from '@mui/material';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { useBoolean } from 'src/hooks/use-boolean';

import { endpoints } from 'src/utils/axios';

import { useGetHospital, useDeleteHospital } from 'src/api/hospital';

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

import { IHospitalItem } from 'src/types/hospital';

import HospitalTableRow from '../hospital-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'id', label: 'Mã Bệnh Viện', width: 120 },
  { id: 'name', label: 'Tên Bệnh Viện', width: 220 },
  { id: 'address', label: 'Địa Chỉ', width: 280 },
  { id: 'phoneNumber', label: 'Số Điện Thoại', width: 180 },
  { id: 'isPublic', label: 'BV Công', width: 100 },
  { id: 'isActive', label: 'Kích Hoạt', width: 100 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export default function HospitalListView() {
  const { enqueueSnackbar } = useSnackbar();
  const table = useTable();
  const settings = useSettingsContext();
  const router = useRouter();
  const confirm = useBoolean();

  const [tableData, setTableData] = useState<IHospitalItem[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');

  const { hospitals, hospitalsLoading } = useGetHospital();
  const { deleteHospital } = useDeleteHospital();

  useEffect(() => {
    if (hospitals?.data?.length) {
      setTableData(hospitals?.data);
    }
  }, [hospitals]);

  const dataFiltered = tableData;

  const dataInPage = dataFiltered.slice(
    table.page * table.rowsPerPage,
    table.page * table.rowsPerPage + table.rowsPerPage
  );

  const denseHeight = table.dense ? 56 : 76;

  const notFound = !dataFiltered.length && !hospitalsLoading;

  const handleRefreshData = useCallback(() => {
    const URL = endpoints.hospital.list;
    mutate([URL, { method: 'GET' }]);
  }, []);

  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await deleteHospital(id);
        enqueueSnackbar('Xoá bệnh viện thành công!', { variant: 'success' });
        table.onUpdatePageDeleteRow(dataInPage.length);
        confirm.onFalse();
      } catch (err) {
        enqueueSnackbar('Không thể xoá bệnh viện!', { variant: 'error' });
      }
    },
    [dataInPage.length, deleteHospital, enqueueSnackbar, table, confirm]
  );

  const handleEditRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.hospital.edit(id));
    },
    [router]
  );

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.hospital.details(id));
    },
    [router]
  );

  const handleOpenConfirm = useCallback(
    (id: string) => {
      setSelectedId(id);
      confirm.onTrue();
    },
    [confirm]
  );

  return (
    <>
      <Container maxWidth={settings.themeStretch ? false : 'lg'}>
        <CustomBreadcrumbs
          heading="Danh Sách Bệnh Viện"
          links={[
            { name: 'Trang Chủ', href: paths.dashboard.root },
            { name: 'Bệnh Viện', href: paths.dashboard.hospital.root },
            { name: 'Danh Sách' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.hospital.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              Thêm Bệnh Viện
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={tableData.length}
              onSelectAllRows={(checked) =>
                table.onSelectAllRows(
                  checked,
                  tableData.map((row) => row.id)
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
                  headLabel={TABLE_HEAD}
                  rowCount={tableData.length}
                  numSelected={table.selected.length}
                  onSort={table.onSort}
                  onSelectAllRows={(checked) =>
                    table.onSelectAllRows(
                      checked,
                      tableData.map((row) => row.id)
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
                      <HospitalTableRow
                        key={row.id}
                        row={row}
                        selected={table.selected.includes(row.id)}
                        onSelectRow={() => table.onSelectRow(row.id)}
                        onDeleteRow={() => handleOpenConfirm(row.id)}
                        onEditRow={() => handleEditRow(row.id)}
                        onViewRow={() => handleViewRow(row.id)}
                        onRefreshData={handleRefreshData}
                      />
                    ))}
                  {dataFiltered.length === 0 && (
                    <TableEmptyRows
                      height={denseHeight}
                      emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
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
      </Container>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Xoá"
        content="Bạn có chắc chắn muốn xoá bệnh viện này?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={async () => {
              await handleDeleteRow(selectedId);
              confirm.onFalse(); // Add this line to close the modal
            }}
          >
            Xoá
          </Button>
        }
      />
    </>
  );
}
