import { useCallback } from 'react'

import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import { SelectChangeEvent } from '@mui/material/Select'
import InputAdornment from '@mui/material/InputAdornment'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'

import Iconify from 'src/components/iconify'

// Kiểu dữ liệu cho filter
export type AppointmentFilters = {
  name: string
  doctorIds: string[]
  startDate: any
  endDate: any
}

type DoctorOption = { id: string; name: string }
type Props = {
  filters: AppointmentFilters
  onFilters: (name: string, value: any) => void
  exportToCSV: () => void
  doctorOptions: DoctorOption[]
  dateError: boolean
  onReset?: () => void
}

export default function AppointmentTableToolbar({
  filters,
  onFilters,
  exportToCSV,
  doctorOptions,
  dateError,
  onReset
}: Props) {
  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value)
    },
    [onFilters]
  )

  const handleFilterDoctor = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const value =
        typeof event.target.value === 'string'
          ? event.target.value.split(',')
          : event.target.value
      onFilters('doctorIds', value)
    },
    [onFilters]
  )

  const handleFilterStartDate = useCallback(
    (newValue: any) => {
      onFilters('startDate', newValue)
    },
    [onFilters]
  )

  const handleFilterEndDate = useCallback(
    (newValue: any) => {
      onFilters('endDate', newValue)
    },
    [onFilters]
  )

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      justifyContent={{ xs: 'flex-end', md: 'space-between' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
    >
      <DatePicker
        label="Từ ngày"
        value={filters.startDate}
        onChange={handleFilterStartDate}
        slotProps={{ textField: { fullWidth: true } }}
        sx={{ maxWidth: { md: 180 } }}
      />
      <DatePicker
        label="Đến ngày"
        value={filters.endDate}
        onChange={handleFilterEndDate}
        slotProps={{
          textField: {
            fullWidth: true,
            error: dateError,
            helperText: dateError && 'Ngày kết thúc phải lớn hơn ngày bắt đầu'
          }
        }}
        sx={{ maxWidth: { md: 180 } }}
      />
      <TextField
        fullWidth
        value={filters.name}
        onChange={handleFilterName}
        placeholder="Tìm kiếm bác sĩ/MBS"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          )
        }}
        sx={{ minWidth: 220 }}
      />
      {onReset && (
        <Button
          variant="outlined"
          color="secondary"
          onClick={onReset}
          sx={{ whiteSpace: 'nowrap' }}
        >
          Đặt lại
        </Button>
      )}
      <Button
        variant="contained"
        color="primary"
        startIcon={<Iconify icon="solar:export-bold" />}
        onClick={exportToCSV}
        sx={{ minWidth: 120 }}
      >
        Xuất File
      </Button>
    </Stack>
  )
}
