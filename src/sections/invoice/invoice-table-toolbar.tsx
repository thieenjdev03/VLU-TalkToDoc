import { useCallback } from 'react'

import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Checkbox from '@mui/material/Checkbox'
import TextField from '@mui/material/TextField'
import InputLabel from '@mui/material/InputLabel'
import FormControl from '@mui/material/FormControl'
import OutlinedInput from '@mui/material/OutlinedInput'
import InputAdornment from '@mui/material/InputAdornment'
import { DatePicker } from '@mui/x-date-pickers/DatePicker'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { formHelperTextClasses } from '@mui/material/FormHelperText'

import Iconify from 'src/components/iconify'
import { usePopover } from 'src/components/custom-popover'

import {
  IInvoiceTableFilters,
  IInvoiceTableFilterValue
} from 'src/types/invoice'

// ----------------------------------------------------------------------

type DoctorOption = { id: string; name: string }
type Props = {
  filters: IInvoiceTableFilters
  onFilters: (name: string, value: IInvoiceTableFilterValue) => void
  exportToCSV: (data: any[]) => void
  dataFiltered: any[]
  //
  dateError: boolean
  serviceOptions: DoctorOption[]
}

export default function InvoiceTableToolbar({
  filters,
  onFilters,
  exportToCSV,
  dataFiltered,
  //
  dateError,
  serviceOptions
}: Props) {
  const popover = usePopover()

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value)
    },
    [onFilters]
  )

  const handleFilterService = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      const value =
        typeof event.target.value === 'string'
          ? event.target.value.split(',')
          : event.target.value
      onFilters('service', value)
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
      direction={{
        xs: 'column',
        md: 'row'
      }}
      sx={{
        p: 2.5,
        pr: { xs: 2.5, md: 1 }
      }}
    >
      <FormControl
        sx={{
          flexShrink: 0,
          width: { xs: 1, md: 180 }
        }}
      >
        <InputLabel>Bác Sĩ</InputLabel>

        <Select
          multiple
          value={filters.service}
          onChange={handleFilterService}
          input={<OutlinedInput label="Service" />}
          renderValue={selected =>
            (selected as string[])
              .map(value => {
                const found = serviceOptions.find(opt => opt.id === value)
                return found ? found.name : value
              })
              .join(', ')
          }
          sx={{ textTransform: 'capitalize' }}
        >
          {serviceOptions.map(option => (
            <MenuItem key={option.id} value={option.id}>
              <Checkbox
                disableRipple
                size="small"
                checked={filters.service.includes(option.id)}
              />
              {option.name}
            </MenuItem>
          ))}
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
