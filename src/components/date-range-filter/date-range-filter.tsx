import moment from 'moment'
import { useState, useEffect } from 'react'

import { Stack, Button, TextField } from '@mui/material'

interface DateRangeFilterProps {
  startDate: string
  endDate: string
  onChange: (filter: {
    startDate: string
    endDate: string
    range: string
  }) => void
  defaultRange?: 'week' | 'month' | 'quarter' | 'year'
  loading?: boolean
}

export function DateRangeFilter({
  startDate,
  endDate,
  onChange,
  defaultRange = 'month',
  loading = false
}: DateRangeFilterProps) {
  const [localStart, setLocalStart] = useState(startDate)
  const [localEnd, setLocalEnd] = useState(endDate)
  const [activeRange, setActiveRange] = useState(defaultRange)

  useEffect(() => {
    setLocalStart(startDate)
  }, [startDate])
  useEffect(() => {
    setLocalEnd(endDate)
  }, [endDate])

  const handleQuickRange = (range: 'week' | 'month' | 'quarter' | 'year') => {
    setActiveRange(range)
    let start: string
    let end: string
    switch (range) {
      case 'week':
        start = moment().startOf('week').format('YYYY-MM-DD')
        end = moment().endOf('week').format('YYYY-MM-DD')
        break
      case 'month':
        start = moment().startOf('month').format('YYYY-MM-DD')
        end = moment().endOf('month').format('YYYY-MM-DD')
        break
      case 'quarter':
        start = moment().startOf('quarter').format('YYYY-MM-DD')
        end = moment().endOf('quarter').format('YYYY-MM-DD')
        break
      case 'year':
        start = moment().startOf('year').format('YYYY-MM-DD')
        end = moment().endOf('year').format('YYYY-MM-DD')
        break
      default:
        start = moment().startOf('month').format('YYYY-MM-DD')
        end = moment().endOf('month').format('YYYY-MM-DD')
    }
    setLocalStart(start)
    setLocalEnd(end)
    onChange({ startDate: start, endDate: end, range })
  }

  const handleUpdate = () => {
    onChange({ startDate: localStart, endDate: localEnd, range: activeRange })
  }

  return (
    <Stack>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
        <Button
          size="small"
          variant={activeRange === 'week' ? 'contained' : 'outlined'}
          onClick={() => handleQuickRange('week')}
          sx={{ minWidth: 'auto' }}
        >
          Tuần này
        </Button>
        <Button
          size="small"
          variant={activeRange === 'month' ? 'contained' : 'outlined'}
          onClick={() => handleQuickRange('month')}
          sx={{ minWidth: 'auto' }}
        >
          Tháng này
        </Button>
        <Button
          size="small"
          variant={activeRange === 'quarter' ? 'contained' : 'outlined'}
          onClick={() => handleQuickRange('quarter')}
          sx={{ minWidth: 'auto' }}
        >
          Quý này
        </Button>
        <Button
          size="small"
          variant={activeRange === 'year' ? 'contained' : 'outlined'}
          onClick={() => handleQuickRange('year')}
          sx={{ minWidth: 'auto' }}
        >
          Năm này
        </Button>
      </Stack>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems="center"
      >
        <TextField
          type="date"
          label="Từ ngày"
          value={localStart}
          onChange={e => setLocalStart(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ minWidth: 140 }}
        />
        <TextField
          type="date"
          label="Đến ngày"
          value={localEnd}
          onChange={e => setLocalEnd(e.target.value)}
          InputLabelProps={{ shrink: true }}
          size="small"
          sx={{ minWidth: 140 }}
        />
        <Button
          variant="contained"
          onClick={handleUpdate}
          disabled={loading}
          size="small"
          sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
        >
          Cập nhật
        </Button>
      </Stack>
    </Stack>
  )
}
