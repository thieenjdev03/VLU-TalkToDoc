import { useCallback } from 'react'

import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import Select, { SelectChangeEvent } from '@mui/material/Select'

import Iconify from 'src/components/iconify'

// ----------------------------------------------------------------------

type Props = {
  filters: any
  onFilters: (name: string, value: any) => void
  exportToCSV: (data: any[]) => void
  dataFiltered: any[]
  specialtyOptions: { label: string; value: string }[]
  hospitalOptions?: { label: string; value: string }[]
  dateError: boolean
}

export default function SpecialtyReportToolbar({
  filters,
  onFilters,
  exportToCSV,
  dataFiltered,
  specialtyOptions,
  hospitalOptions = [],
  dateError
}: Props) {
  const handleFilterTime = useCallback(
    (event: SelectChangeEvent<string>) => {
      onFilters('timeRange', event.target.value)
    },
    [onFilters]
  )
  const handleFilterSpecialty = useCallback(
    (event: SelectChangeEvent<string>) => {
      onFilters('specialty', event.target.value)
    },
    [onFilters]
  )
  const handleFilterHospital = useCallback(
    (event: SelectChangeEvent<string>) => {
      onFilters('hospital', event.target.value)
    },
    [onFilters]
  )
  const handleFilterStartDate = useCallback(
    (newValue: Date | null) => {
      onFilters('startDate', newValue)
    },
    [onFilters]
  )
  const handleFilterEndDate = useCallback(
    (newValue: Date | null) => {
      onFilters('endDate', newValue)
    },
    [onFilters]
  )
  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{ xs: 'column', md: 'row' }}
      sx={{ p: 2.5, pr: { xs: 2.5, md: 1 } }}
    >
      <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 160 } }}>
        <InputLabel>Thời gian</InputLabel>
        <Select
          value={filters.timeRange}
          onChange={handleFilterTime}
          label="Thời gian"
        >
          <MenuItem value="week">Tuần</MenuItem>
          <MenuItem value="month">Tháng</MenuItem>
          <MenuItem value="quarter">Quý</MenuItem>
          <MenuItem value="custom">Tùy chọn</MenuItem>
        </Select>
      </FormControl>
      {filters.timeRange === 'custom' && (
        <>
          <DatePicker
            label="Ngày bắt đầu"
            value={filters.startDate}
            onChange={handleFilterStartDate}
            slotProps={{ textField: { fullWidth: true } }}
            sx={{ maxWidth: { md: 160 } }}
          />
          <DatePicker
            label="Ngày kết thúc"
            value={filters.endDate}
            onChange={handleFilterEndDate}
            slotProps={{ textField: { fullWidth: true, error: dateError } }}
            sx={{ maxWidth: { md: 160 } }}
          />
        </>
      )}
      <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 180 } }}>
        <InputLabel>Chuyên khoa</InputLabel>
        <Select
          value={filters.specialty}
          onChange={handleFilterSpecialty}
          label="Chuyên khoa"
        >
          <MenuItem value="all">Tất cả</MenuItem>
          {specialtyOptions.map(opt => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {!!hospitalOptions.length && (
        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 180 } }}>
          <InputLabel>Cơ sở y tế</InputLabel>
          <Select
            value={filters.hospital}
            onChange={handleFilterHospital}
            label="Cơ sở y tế"
          >
            <MenuItem value="all">Tất cả</MenuItem>
            {hospitalOptions.map(opt => (
              <MenuItem key={opt.value} value={opt.value}>
                {opt.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <Button
        variant="contained"
        color="primary"
        startIcon={<Iconify icon="solar:export-bold" />}
        onClick={() => exportToCSV(dataFiltered)}
        sx={{ mb: 1, minWidth: 120, py: 1 }}
      >
        Xuất File
      </Button>
    </Stack>
  )
}
