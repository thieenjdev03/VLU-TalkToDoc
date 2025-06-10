import { useRef, useState, useEffect, useCallback } from 'react'

import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import TableRow from '@mui/material/TableRow'
import Container from '@mui/material/Container'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableHead from '@mui/material/TableHead'
import StarIcon from '@mui/icons-material/Star'
import Typography from '@mui/material/Typography'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import TableContainer from '@mui/material/TableContainer'

import { paths } from 'src/routes/paths'

import { useBoolean } from 'src/hooks/use-boolean'

import { isAfter } from 'src/utils/format-time'

import { getDoctorReviewReport } from 'src/api/report'

import Scrollbar from 'src/components/scrollbar'
import { useSnackbar } from 'src/components/snackbar'
import { ConfirmDialog } from 'src/components/custom-dialog'
import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'
import {
  useTable,
  TableNoData,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom
} from 'src/components/table'

import CustomTableRow from '../components/review-table-row'
import ReviewDoctorTableToolbar from '../components/review-doctor-table-toolbar'

// TABLE_HEAD cho đánh giá bác sĩ
const TABLE_HEAD = [
  { id: 'doctorId', label: 'Mã BS', minWidth: 100 },
  { id: 'name', label: 'Tên', minWidth: 200 },
  { id: 'avgRating', label: 'Đánh giá TB', minWidth: 100, align: 'center' },
  {
    id: 'reviewCount',
    label: 'Số lượng đánh giá',
    minWidth: 120,
    align: 'center'
  },
  { id: 'actions', label: '', minWidth: 80, align: 'center' }
]

const defaultFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null,
  service: []
}

export default function ReviewDoctorView() {
  const { enqueueSnackbar } = useSnackbar()
  const settings = useSettingsContext()
  const table = useTable({ defaultOrderBy: 'avgRating' })
  const confirm = useBoolean()
  const [tableData, setTableData] = useState<any[]>([])
  const [filters, setFilters] = useState(defaultFilters)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const debounceRef = useRef<any>(null)
  const [openModal, setOpenModal] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState<any>(null)

  // Fetch data từ API
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getDoctorReviewReport({
        name: filters.name,
        page: table.page + 1,
        pageSize: table.rowsPerPage
      })
      setTableData(res.data?.items || [])
      setTotal(res.data?.total || 0)
    } catch (err) {
      enqueueSnackbar('Không thể tải dữ liệu đánh giá bác sĩ', {
        variant: 'error'
      })
    } finally {
      setLoading(false)
    }
  }, [filters.name, table.page, table.rowsPerPage, enqueueSnackbar])

  // Gọi API khi filter, page, rowsPerPage thay đổi
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      fetchData()
    }, 400)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [fetchData])

  // Không cần analytic cho bảng này, chỉ table/filter

  const dateError = isAfter(filters.startDate, filters.endDate)

  const dataFiltered = tableData.map((row, idx) => ({
    ...row,
    index: table.page * table.rowsPerPage + idx + 1
  }))
  const notFound = !loading && dataFiltered.length === 0

  const handleFilters = useCallback(
    (name: string, value: any) => {
      table.onResetPage()
      setFilters(prev => ({ ...prev, [name]: value }))
    },
    [table]
  )

  const handleResetFilters = useCallback(() => {
    setFilters(defaultFilters)
  }, [])

  const handleDeleteRows = useCallback(() => {
    const deleteRows = tableData.filter(
      (_: any, idx: number) => !table.selected.includes(String(idx))
    )
    enqueueSnackbar('Delete success!')
    setTableData(deleteRows)
    table.onUpdatePageDeleteRows({
      totalRowsInPage: dataFiltered.length,
      totalRowsFiltered: dataFiltered.length
    })
  }, [dataFiltered.length, enqueueSnackbar, table, tableData])

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Thống kê đánh giá bác sĩ"
        links={[
          { name: 'Quản trị', href: paths.dashboard.root },
          { name: 'Báo cáo', href: paths.dashboard.report.root },
          { name: 'Đánh giá bác sĩ' }
        ]}
        sx={{ mb: { xs: 1, md: 2 } }}
      />
      <Card>
        <Stack
          direction="row"
          justifyContent="flex-end"
          alignItems="center"
          sx={{ px: 1, pt: 1 }}
        >
          <ReviewDoctorTableToolbar
            filters={{ name: filters.name }}
            onFilters={handleFilters}
          />
        </Stack>
        <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
          <TableSelectedAction
            dense={table.dense}
            numSelected={table.selected.length}
            rowCount={dataFiltered.length}
            onSelectAllRows={checked => {
              table.onSelectAllRows(
                checked,
                dataFiltered.map((_: any, idx: number) => String(idx))
              )
            }}
            action={null}
          />
          <Scrollbar>
            <Table
              size={table.dense ? 'small' : 'medium'}
              sx={{ minWidth: 700 }}
            >
              <TableHeadCustom
                order={table.order}
                orderBy={table.orderBy}
                headLabel={TABLE_HEAD}
                rowCount={dataFiltered.length}
                numSelected={table.selected.length}
                onSort={table.onSort}
                onSelectAllRows={checked =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered?.map((_: any, idx: number) => String(idx))
                  )
                }
              />
              <TableBody>
                {loading && (
                  <tr>
                    <td colSpan={TABLE_HEAD.length + 1}>Đang tải dữ liệu...</td>
                  </tr>
                )}
                {!loading &&
                  dataFiltered.length > 0 &&
                  dataFiltered.map((row: any, idx: number) => (
                    <CustomTableRow
                      key={row.doctorId}
                      row={row}
                      selected={table.selected.includes(String(idx))}
                      onSelectRow={() => table.onSelectRow(String(idx))}
                      onViewRow={() => {
                        setSelectedDoctor(row)
                        setOpenModal(true)
                      }}
                    />
                  ))}
                {!loading && dataFiltered.length === 0 && (
                  <TableNoData notFound={notFound} />
                )}
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
      {/* Modal chi tiết đánh giá bác sĩ */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết đánh giá bác sĩ</DialogTitle>
        <DialogContent>
          {selectedDoctor && (
            <Stack spacing={2} alignItems="center" sx={{ mb: 2 }}>
              <img
                src={
                  selectedDoctor.avatarUrl ||
                  '/assets/icons/app/avatar-default.svg'
                }
                alt={selectedDoctor.name}
                style={{
                  borderRadius: '50%',
                  height: 100,
                  width: 100,
                  objectFit: 'cover',
                  aspectRatio: '1/1',
                  boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)'
                }}
              />
              <Typography variant="subtitle1" gutterBottom>
                {selectedDoctor.name} ({selectedDoctor.doctorId})
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Trung bình: <b>{selectedDoctor.avgRating}</b> &nbsp;|&nbsp; Số
                lượt đánh giá: <b>{selectedDoctor.reviewCount}</b>
              </Typography>
            </Stack>
          )}

          {selectedDoctor?.reviewDetails?.length > 0 ? (
            <TableContainer sx={{ maxHeight: 300, mb: 2, mt: 2 }}>
              <Table size="medium" stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <b>Mã lịch hẹn</b>
                    </TableCell>
                    <TableCell align="center" sx={{ width: 100 }}>
                      <b>Đánh giá</b>
                    </TableCell>
                    <TableCell>
                      <b>Nội dung</b>
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedDoctor.reviewDetails.map(
                    (review: any, idx: number) => (
                      <TableRow key={idx} hover>
                        <TableCell>{review.appointmentId}</TableCell>
                        <TableCell align="center">
                          <Typography
                            sx={{
                              display: 'flex',
                              gap: 0.5,
                              fontSize: 16,
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                            color={
                              review.ratingScore >= 4
                                ? 'success.main'
                                : 'warning.main'
                            }
                          >
                            {review.ratingScore}
                            <StarIcon
                              fontSize="inherit"
                              sx={{ fontSize: 20, color: 'warning.main' }}
                            />
                          </Typography>
                        </TableCell>
                        <TableCell>
                          {review.description || <em>Không có nội dung</em>}
                        </TableCell>
                      </TableRow>
                    )
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography variant="body2" color="text.secondary">
              Chưa có đánh giá
            </Typography>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenModal(false)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Container>
  )
}
