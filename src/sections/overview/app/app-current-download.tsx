import moment from 'moment'
import { ApexOptions } from 'apexcharts'
import { useState, useEffect, useCallback } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import Card, { CardProps } from '@mui/material/Card'
import { styled, useTheme } from '@mui/material/styles'
import CircularProgress from '@mui/material/CircularProgress'

import { fNumber } from 'src/utils/format-number'

import { API_URL } from 'src/config-global'

import Iconify from 'src/components/iconify'
import Chart, { useChart } from 'src/components/chart'

// ----------------------------------------------------------------------

const CHART_HEIGHT = 400

const LEGEND_HEIGHT = 72

const StyledChart = styled(Chart)(({ theme }) => ({
  height: CHART_HEIGHT,
  '& .apexcharts-canvas, .apexcharts-inner, svg, foreignObject': {
    height: `100% !important`
  },
  '& .apexcharts-legend': {
    height: LEGEND_HEIGHT,
    borderTop: `dashed 1px ${theme.palette.divider}`,
    top: `calc(${CHART_HEIGHT - LEGEND_HEIGHT}px) !important`
  }
}))

// ----------------------------------------------------------------------

interface AppointmentStatusData {
  status: string
  count: number
  statusVn: string
}

interface AppointmentStatusResponse {
  message: string
  data: AppointmentStatusData[]
  status: number
}

interface Props extends CardProps {
  title?: string
  subheader?: string
  startDate?: string
  endDate?: string
  removeFilter?: boolean
  enableDatePicker?: boolean
  chart?: {
    colors?: string[]
    series: {
      label: string
      value: number
    }[]
    options?: ApexOptions
  }
  handleShowRangeMonth?: boolean
  defaultRange?: 'week' | 'month' | 'quarter' | 'year'
}

export default function AppCurrentDownload({
  title,
  subheader,
  startDate,
  endDate,
  enableDatePicker = true,
  chart,
  removeFilter = false,
  handleShowRangeMonth = false,
  defaultRange = 'month',
  ...other
}: Props) {
  const theme = useTheme()
  const [loading, setLoading] = useState(true)
  const [localStartDate, setLocalStartDate] = useState(
    startDate || moment().startOf('month').format('YYYY-MM-DD')
  )
  const [localEndDate, setLocalEndDate] = useState(
    endDate || moment().endOf('month').format('YYYY-MM-DD')
  )
  const [appointmentData, setAppointmentData] = useState<
    {
      label: string
      value: number
    }[]
  >([
    { label: 'Đã Xác Nhận', value: 0 },
    { label: 'Đang Chờ', value: 0 },
    { label: 'Đã Hủy', value: 0 },
    { label: 'Đã Hoàn Thành', value: 0 }
  ])
  const [activeRange, setActiveRange] = useState<
    'week' | 'month' | 'quarter' | 'year' | null
  >(defaultRange || null)

  // Màu sắc tương ứng với từng trạng thái
  const statusColors = [
    theme.palette.success.main, // Đã Xác Nhận - xanh lá
    theme.palette.warning.main, // Đang Chờ - cam
    theme.palette.error.main, // Đã Hủy - đỏ
    theme.palette.info.main // Đã Hoàn Thành - xanh dương
  ]

  const fetchAppointmentStatusData = async (start: string, end: string) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(
        `${API_URL}/report/appointment-status-summary`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            startDate: start,
            endDate: end
          })
        }
      )

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: AppointmentStatusResponse = await response.json()

      // Mapping trạng thái từ API sang tiếng Việt
      const statusMapping: { [key: string]: string } = {
        CONFIRMED: 'Đã Xác Nhận',
        PENDING: 'Đang Chờ',
        CANCELLED: 'Đã Hủy',
        COMPLETED: 'Đã Hoàn Thành',
        confirmed: 'Đã Xác Nhận',
        pending: 'Đang Chờ',
        cancelled: 'Đã Hủy',
        completed: 'Đã Hoàn Thành'
      }

      const formattedData = result.data.map(item => ({
        label: item.statusVn || statusMapping[item.status] || item.status,
        value: item.count
      }))

      setAppointmentData(formattedData)
    } catch (error) {
      console.error('Error fetching appointment status data:', error)
      // Giữ nguyên dữ liệu mặc định nếu có lỗi
    }
  }

  const handleDateRangeUpdate = async () => {
    setLoading(true)
    await fetchAppointmentStatusData(localStartDate, localEndDate)
    setLoading(false)
  }

  const handleQuickRange = useCallback(
    (range: 'week' | 'month' | 'quarter' | 'year') => {
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
      setLocalStartDate(start)
      setLocalEndDate(end)
      setLoading(true)
      fetchAppointmentStatusData(start, end).then(() => setLoading(false))
    },
    []
  )

  useEffect(() => {
    if (handleShowRangeMonth) {
      setActiveRange('month')
      handleQuickRange('month')
    } else if (defaultRange) {
      setActiveRange(defaultRange)
      handleQuickRange(defaultRange)
    }
  }, [handleShowRangeMonth, handleQuickRange, defaultRange])
  useEffect(() => {
    if (startDate) setLocalStartDate(startDate)
    if (endDate) setLocalEndDate(endDate)
  }, [startDate, endDate])

  // Sử dụng dữ liệu từ props hoặc dữ liệu API
  const finalData = chart?.series || appointmentData
  const colors = chart?.colors || statusColors
  const options = chart?.options || {}

  const chartSeries = finalData.map(i => i.value)

  const chartOptions = useChart({
    chart: {
      sparkline: {
        enabled: true
      }
    },
    colors,
    labels: finalData.map(i => i.label),
    stroke: { colors: [theme.palette.background.paper] },
    legend: {
      offsetY: 0,
      floating: true,
      position: 'bottom',
      horizontalAlign: 'center'
    },
    tooltip: {
      fillSeriesColor: false,
      y: {
        formatter: (value: number) => `${fNumber(value)} Lịch hẹn`,
        title: {
          formatter: (seriesName: string) => `${seriesName}: `
        }
      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: '90%',
          labels: {
            value: {
              formatter: (value: number | string) =>
                `${fNumber(value)} Lịch hẹn`
            },
            total: {
              formatter: (w: { globals: { seriesTotals: number[] } }) => {
                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0)
                return `${fNumber(sum)} Lịch hẹn`
              }
            }
          }
        }
      }
    },
    ...options
  })

  const renderHeader = () => (
    <Box>
      <CardHeader
        title={title}
        subheader={
          subheader ||
          `Dữ liệu từ ${moment(localStartDate).format('DD/MM/YYYY')} đến ${moment(localEndDate).format('DD/MM/YYYY')}`
        }
        sx={{ mb: enableDatePicker ? 2 : 5 }}
      />

      {enableDatePicker && (
        <Box sx={{ px: 3, pb: 3 }}>
          {/* Quick Range Buttons */}
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

          {/* Custom Date Range */}
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
          >
            <TextField
              type="date"
              label="Từ ngày"
              value={localStartDate}
              onChange={e => setLocalStartDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ minWidth: 140 }}
            />

            <TextField
              type="date"
              label="Đến ngày"
              value={localEndDate}
              onChange={e => setLocalEndDate(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              sx={{ minWidth: 140 }}
            />

            <Button
              variant="contained"
              onClick={handleDateRangeUpdate}
              disabled={loading}
              startIcon={<Iconify icon="solar:calendar-search-bold" />}
              size="small"
              sx={{ minWidth: 'auto', whiteSpace: 'nowrap' }}
            >
              Cập nhật
            </Button>
          </Stack>
        </Box>
      )}
    </Box>
  )

  if (loading) {
    return (
      <Card {...other}>
        {renderHeader()}

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 280,
            flexDirection: 'column',
            gap: 2
          }}
        >
          <CircularProgress size={40} />
          <Skeleton variant="circular" width={200} height={200} />
        </Box>
      </Card>
    )
  }

  return (
    <Card {...other}>
      {renderHeader()}

      <StyledChart
        dir="ltr"
        type="donut"
        series={chartSeries}
        options={chartOptions}
        width="100%"
        height={280}
      />
    </Card>
  )
}
