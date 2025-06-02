import { ApexOptions } from 'apexcharts'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Skeleton from '@mui/material/Skeleton'
import { useTheme } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Card, { CardProps } from '@mui/material/Card'
import CircularProgress from '@mui/material/CircularProgress'

import { fNumber, fPercent } from 'src/utils/format-number'

import Chart from 'src/components/chart'
import Iconify from 'src/components/iconify'

// ----------------------------------------------------------------------

interface Props extends CardProps {
  title: string
  total: number
  percent: number
  chart: {
    colors?: string[]
    series: number[]
    options?: ApexOptions
  }
  loading?: boolean
  formatValue?: (value: number) => string
  removeFilter?: boolean
}

export default function AppWidgetSummary({
  title,
  percent,
  total,
  chart,
  loading = false,
  formatValue,
  removeFilter = false,
  sx,
  ...other
}: Props) {
  const theme = useTheme()

  const {
    colors = [theme.palette.primary.light, theme.palette.primary.main],
    series,
    options
  } = chart

  const chartOptions = {
    colors: colors.map(colr => colr[1]),
    fill: {
      type: 'gradient',
      gradient: {
        colorStops: [
          { offset: 0, color: colors[0], opacity: 1 },
          { offset: 100, color: colors[1], opacity: 1 }
        ]
      }
    },
    chart: {
      sparkline: {
        enabled: true
      }
    },
    plotOptions: {
      bar: {
        columnWidth: '68%',
        borderRadius: 2
      }
    },
    tooltip: {
      x: { show: false },
      y: {
        formatter: (value: number) =>
          formatValue ? formatValue(value) : fNumber(value),
        title: {
          formatter: () => ''
        }
      },
      marker: { show: false }
    },
    ...options
  }

  // Format total value
  const formattedTotal = formatValue ? formatValue(total) : fNumber(total)

  if (loading) {
    return (
      <Card
        sx={{ display: 'flex', alignItems: 'center', p: 3, ...sx }}
        {...other}
      >
        <Box sx={{ flexGrow: 1 }}>
          <Skeleton variant="text" width="80%" height={24} />

          <Stack direction="row" alignItems="center" sx={{ mt: 2, mb: 1 }}>
            <Skeleton
              variant="circular"
              width={24}
              height={24}
              sx={{ mr: 1 }}
            />
            <Skeleton variant="text" width={60} height={20} />
          </Stack>

          <Skeleton variant="text" width="60%" height={40} />
        </Box>

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 60,
            height: 36
          }}
        >
          <CircularProgress size={20} />
        </Box>
      </Card>
    )
  }

  return (
    <Card
      sx={{ display: 'flex', alignItems: 'center', p: 3, ...sx }}
      {...other}
    >
      <Box sx={{ flexGrow: 1 }}>
        <Typography variant="subtitle2">{title}</Typography>

        <Stack direction="row" alignItems="center" sx={{ mt: 2, mb: 1 }}>
          <Iconify
            width={24}
            icon={
              percent < 0
                ? 'solar:double-alt-arrow-down-bold-duotone'
                : 'solar:double-alt-arrow-up-bold-duotone'
            }
            sx={{
              mr: 1,
              color: 'success.main',
              ...(percent < 0 && {
                color: 'error.main'
              })
            }}
          />

          <Typography component="div" variant="subtitle2">
            {percent > 0 && '+'}
            {fPercent(percent)}
          </Typography>
        </Stack>

        <Typography variant="h3">{formattedTotal}</Typography>
      </Box>

      <Chart
        dir="ltr"
        type="bar"
        series={[{ data: series }]}
        options={chartOptions}
        width={60}
        height={36}
      />
    </Card>
  )
}
