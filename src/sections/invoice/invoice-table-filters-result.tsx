import { useCallback } from 'react'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Paper from '@mui/material/Paper'
import Button from '@mui/material/Button'
import Stack, { StackProps } from '@mui/material/Stack'

import Iconify from 'src/components/iconify'
import { shortDateLabel } from 'src/components/custom-date-range-picker'

import {
  IInvoiceTableFilters,
  IInvoiceTableFilterValue
} from 'src/types/invoice'

// ----------------------------------------------------------------------

type Props = StackProps & {
  filters: IInvoiceTableFilters
  onFilters: (name: string, value: IInvoiceTableFilterValue) => void
  onResetFilters: VoidFunction
  results: number
}

export default function InvoiceTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  results,
  ...other
}: Props) {
  const shortLabel = shortDateLabel(filters.startDate, filters.endDate)

  const handleRemoveKeyword = useCallback(() => {
    onFilters('name', '')
  }, [onFilters])

  const handleRemoveService = useCallback(
    (inputValue: string) => {
      const newValue = filters.service.filter(item => item !== inputValue)

      onFilters('service', newValue)
    },
    [filters.service, onFilters]
  )
  const renderStatus = (statusParams: string) => {
    switch (statusParams) {
      case 'paid':
        return 'Đã thanh toán'
      case 'pending':
        return 'Chưa thanh toán'
      case 'overdue':
        return 'Quá hạn'
      case 'canceled':
        return 'Đã hủy'
      case 'completed':
        return 'Đã hoàn thành'
      default:
        return 'Chưa xác định'
    }
  }
  const handleRemoveStatus = useCallback(() => {
    onFilters('status', 'all')
  }, [onFilters])

  const handleRemoveDate = useCallback(() => {
    onFilters('startDate', null)
    onFilters('endDate', null)
  }, [onFilters])

  return (
    <Stack spacing={1.5} {...other}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          kết quả tìm thấy
        </Box>
      </Box>

      <Stack
        flexGrow={1}
        spacing={1}
        direction="row"
        flexWrap="wrap"
        alignItems="center"
      >
        {!!filters?.service?.length && (
          <Block label="Bác Sĩ:">
            {filters?.service?.map(item => (
              <Chip
                key={item}
                label={item}
                size="small"
                onDelete={() => handleRemoveService(item)}
              />
            ))}
          </Block>
        )}

        {filters?.status !== 'all' && (
          <Block label="Trạng thái:">
            <Chip
              size="small"
              label={renderStatus(filters?.status)}
              onDelete={handleRemoveStatus}
            />
          </Block>
        )}

        {filters.startDate && filters.endDate && (
          <Block label="Ngày:">
            <Chip size="small" label={shortLabel} onDelete={handleRemoveDate} />
          </Block>
        )}

        {!!filters.name && (
          <Block label="Từ khóa:">
            <Chip
              label={filters.name}
              size="small"
              onDelete={handleRemoveKeyword}
            />
          </Block>
        )}

        <Button
          color="error"
          onClick={onResetFilters}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
        >
          Xóa
        </Button>
      </Stack>
    </Stack>
  )
}

// ----------------------------------------------------------------------

type BlockProps = StackProps & {
  label: string
}

function Block({ label, children, sx, ...other }: BlockProps) {
  return (
    <Stack
      component={Paper}
      variant="outlined"
      spacing={1}
      direction="row"
      sx={{
        p: 1,
        borderRadius: 1,
        overflow: 'hidden',
        borderStyle: 'dashed',
        ...sx
      }}
      {...other}
    >
      <Box component="span" sx={{ typography: 'subtitle2' }}>
        {label}
      </Box>

      <Stack spacing={1} direction="row" flexWrap="wrap">
        {children}
      </Stack>
    </Stack>
  )
}
