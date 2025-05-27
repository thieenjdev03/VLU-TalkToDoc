'use client'

import { useRef, useMemo, useState, useEffect, useCallback } from 'react'

import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import Button from '@mui/material/Button'
import Tooltip from '@mui/material/Tooltip'
import { alpha } from '@mui/material/styles'
import Container from '@mui/material/Container'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import TableContainer from '@mui/material/TableContainer'

import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'

import { useBoolean } from 'src/hooks/use-boolean'

import { isAfter } from 'src/utils/format-time'

import { useGetCases, softDeleteCase } from 'src/api/case'

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

import { CaseTableFilters, CaseTableFilterValue } from 'src/types/case'

import CaseTableToolbar from '../case-table-toolbar'
import CaseTableRow, { Case } from '../case-table-row'
import CaseTableFiltersResult from '../case-table-filters-result'

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

const defaultFilters: CaseTableFilters = {
  name: '',
  status: 'all',
  startDate: null,
  endDate: null
}

// ----------------------------------------------------------------------

export default function CaseListView() {
  const { enqueueSnackbar } = useSnackbar()

  const table = useTable<any>({ defaultCaseBy: 'caseId' })

  const settings = useSettingsContext()

  const router = useRouter()

  const confirm = useBoolean()

  const [filters, setFilters] = useState(defaultFilters)

  const dateError = isAfter(filters.startDate, filters.endDate)
  // Sử dụng useRef để giữ userProfile, tránh parse lại mỗi lần render
  const userProfileRef = useRef<any>(null)
  if (!userProfileRef.current) {
    userProfileRef.current = JSON.parse(
      localStorage.getItem('userProfile') || '{}'
    )
  }
  const userProfile = userProfileRef.current

  const { cases, total, isLoading, error } = useGetCases({
    q: filters.name,
    status: filters.status === 'all' ? '' : filters.status,
    page: table.page + 1,
    limit: table.rowsPerPage
  })

  const [tableData, setTableData] = useState<any[]>([])

  // Chỉ setTableData khi cases thực sự thay đổi
  useEffect(() => {
    if (!cases) return
    let filtered = cases
    if (userProfile?.role === 'PATIENT') {
      filtered = cases.filter((item: any) => item.patient === userProfile._id)
    } else if (userProfile?.role === 'DOCTOR') {
      filtered = cases.filter(
        (item: any) => item.appointmentId?.doctor?._id === userProfile._id
      )
    }
    // Chỉ setTableData nếu dữ liệu thực sự khác
    setTableData(prev => {
      if (JSON.stringify(prev) !== JSON.stringify(filtered)) {
        return filtered
      }
      return prev
    })
  }, [cases, userProfile?._id, userProfile?.role])

  const mappedCases = useMemo(
    () =>
      (tableData || []).map((item: any) => ({
        _id: item._id,
        patient: item.patient,
        specialty: item.specialty,
        medicalForm: item.medicalForm,
        appointmentId: item.appointmentId,
        status: item.status,
        offers: item.offers,
        isDeleted: item.isDeleted,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        offerSummary: item.offerSummary
      })),
    [tableData]
  )

  const canReset =
    !!filters.name ||
    filters.status !== 'all' ||
    (!!filters.startDate && !!filters.endDate)

  const notFound = !mappedCases.length

  const handleFilters = useCallback(
    (name: string, value: CaseTableFilterValue) => {
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

  // Xoá 1 bệnh án
  const handleDeleteRow = useCallback(
    async (id: string) => {
      try {
        await softDeleteCase(id)
        enqueueSnackbar('Xoá bệnh án thành công', { variant: 'success' })
      } catch (err) {
        enqueueSnackbar('Xoá bệnh án thất bại', { variant: 'error' })
      }
    },
    [enqueueSnackbar]
  )

  // Xoá nhiều bệnh án
  const handleDeleteRows = useCallback(async () => {
    if (!table.selected.length) return
    let hasError = false
    table.selected.forEach(async (id: string) => {
      try {
        await softDeleteCase(id)
      } catch (err) {
        hasError = true
      }
    })
    if (hasError) {
      enqueueSnackbar('Có lỗi khi xoá một số bệnh án', { variant: 'error' })
    } else {
      enqueueSnackbar('Xoá các bệnh án thành công', { variant: 'success' })
    }
    table.setSelected([])
  }, [enqueueSnackbar, table])

  const handleViewRow = useCallback(
    (id: string) => {
      router.push(paths.dashboard.case.details(id))
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
            { name: 'Quản lý bệnh án', href: paths.dashboard.case.root },
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

          <CaseTableToolbar
            filters={filters}
            onFilters={handleFilters}
            dateError={dateError}
          />

          {canReset && (
            <CaseTableFiltersResult
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
                  case={table.case as any}
                  caseBy={table.caseBy as any}
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
                    <CaseTableRow
                      key={row._id}
                      row={row}
                      selected={table.selected.includes(row._id)}
                      onSelectRow={() => table.onSelectRow(row._id)}
                      onViewRow={() => handleViewRow(row._id)}
                      userRole={userProfile?.role}
                      onDeleteRow={() => handleDeleteRow(row._id)}
                    >
                      <TableCell>
                        {row.appointmentId?.appointmentId || '-'}
                      </TableCell>
                      <TableCell>
                        {row.appointmentId?.doctor?.fullName || '-'}
                      </TableCell>
                      <TableCell>
                        {row.appointmentId?.patient?.fullName || '-'}
                      </TableCell>
                      <TableCell>{row.specialty?.name || '-'}</TableCell>
                      <TableCell>{row.status}</TableCell>
                    </CaseTableRow>
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
        title="Xoá bệnh án"
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
