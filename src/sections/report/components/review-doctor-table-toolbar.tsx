import { useCallback } from 'react'

import Stack from '@mui/material/Stack'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'

import Iconify from 'src/components/iconify'
import { usePopover } from 'src/components/custom-popover'

// ----------------------------------------------------------------------

type Props = {
  filters: { name: string }
  onFilters: (name: string, value: string) => void
}

export default function ReviewDoctorTableToolbar({
  filters,
  onFilters
}: Props) {
  const popover = usePopover()

  const handleFilterName = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onFilters('name', event.target.value)
    },
    [onFilters]
  )

  return (
    <Stack direction="row" alignItems="center" spacing={2} flexGrow={1}>
      <TextField
        fullWidth
        value={filters.name}
        onChange={handleFilterName}
        placeholder="Tìm kiếm theo tên hoặc mã bác sĩ"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          )
        }}
        sx={{
          width: 1,
          p: 1
        }}
      />
    </Stack>
  )
}
