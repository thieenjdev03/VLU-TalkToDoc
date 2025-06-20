import { useCallback } from 'react'

import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import InputAdornment from '@mui/material/InputAdornment'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { formHelperTextClasses } from '@mui/material/FormHelperText'

import Iconify from 'src/components/iconify'

import {
  IInvoiceTableFilters,
  IInvoiceTableFilterValue
} from 'src/types/invoice'

// ----------------------------------------------------------------------

type Props = {
  filters: IInvoiceTableFilters
  onFilters: (name: string, value: IInvoiceTableFilterValue) => void
  exportToCSV: (data: any[]) => void
  dataFiltered: any[]
  //
  dateError: boolean
  selected: string[]
  onPaySalary?: () => void
}

export default function RevenueTTDTableToolbar({
  filters,
  onFilters,
  exportToCSV,
  dataFiltered,
  //
  dateError,
  selected: selectedRows = [],
  onPaySalary
}: Props) {
  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value)
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

  const handleFilterStatus = useCallback(
    (event: SelectChangeEvent<string>) => {
      onFilters('status', event.target.value)
    },
    [onFilters]
  )

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{
        xs: 'column',
        md: 'row'
      }}
      sx={{
        p: 2.5,
        pr: { xs: 2.5, md: 1 }
      }}
    >
      <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 180 } }}>
        <InputLabel>Trạng thái lịch hẹn</InputLabel>
        <Select
          value={filters.status}
          onChange={handleFilterStatus}
          label="Trạng thái lịch hẹn"
        >
          <MenuItem value="all">Tất cả</MenuItem>
          <MenuItem value="completed">Đã hoàn thành</MenuItem>
          <MenuItem value="confirmed">Đã xác nhận</MenuItem>
          <MenuItem value="pending">Đang chờ</MenuItem>
          <MenuItem value="overdue">Quá hạn</MenuItem>
          <MenuItem value="cancelled">Đã hủy</MenuItem>
        </Select>
      </FormControl>

      <DatePicker
        label="Ngày bắt đầu"
        value={filters.startDate}
        onChange={handleFilterStartDate}
        slotProps={{ textField: { fullWidth: true } }}
        sx={{
          maxWidth: { md: 180 }
        }}
      />

      <DatePicker
        label="Ngày kết thúc"
        value={filters.endDate}
        onChange={handleFilterEndDate}
        slotProps={{
          textField: {
            fullWidth: true,
            error: dateError,
            helperText: dateError && 'Ngày kết thúc phải lớn hơn ngày bắt đầu'
          }
        }}
        sx={{
          maxWidth: { md: 180 },
          [`& .${formHelperTextClasses.root}`]: {
            position: { md: 'absolute' },
            bottom: { md: -40 }
          }
        }}
      />

      <Stack
        direction="row"
        alignItems="center"
        spacing={2}
        flexGrow={1}
        sx={{ width: 1 }}
      >
        <TextField
          fullWidth
          value={filters.name}
          onChange={handleFilterName}
          placeholder="Tìm kiếm theo mã thanh toán, lịch hẹn, tên bệnh nhân, bác sĩ"
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify
                  icon="eva:search-fill"
                  sx={{ color: 'text.disabled' }}
                />
              </InputAdornment>
            )
          }}
        />
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
    </Stack>
  )
}
