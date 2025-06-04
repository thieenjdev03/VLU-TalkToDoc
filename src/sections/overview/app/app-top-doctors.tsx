import moment from 'moment'
import { useState, useEffect, useCallback } from 'react'

import Box from '@mui/material/Box'
import Chip from '@mui/material/Chip'
import Stack from '@mui/material/Stack'
import Rating from '@mui/material/Rating'
import Avatar from '@mui/material/Avatar'
import Button from '@mui/material/Button'
import Skeleton from '@mui/material/Skeleton'
import TextField from '@mui/material/TextField'
import CardHeader from '@mui/material/CardHeader'
import Typography from '@mui/material/Typography'
import Card, { CardProps } from '@mui/material/Card'

import { fShortenNumber } from 'src/utils/format-number'

import { API_URL } from 'src/config-global'

import Iconify from 'src/components/iconify'
import Scrollbar from 'src/components/scrollbar'

// ----------------------------------------------------------------------

type DoctorProps = {
  id: string
  name: string
  avatar: string
  specialty: string
  experience: number // số năm kinh nghiệm
  rating: number
  totalPatients: number // tổng số bệnh nhân đã khám trong time range
  totalReviews: number // số lượng đánh giá
  totalAppointments: number // tổng số lịch hẹn trong time range
  revenue: number // doanh thu trong time range
  status: 'active' | 'busy' | 'offline' // trạng thái hoạt động
}

interface TopDoctorsResponse {
  message: string
  data: DoctorProps[]
  status: number
}

interface Props extends CardProps {
  title?: string
  subheader?: string
  startDate?: string
  endDate?: string
  enableDatePicker?: boolean
  list?: DoctorProps[]
  limit?: number
}

export default function AppTopDoctors({
  title,
  subheader,
  startDate,
  endDate,
  enableDatePicker = true,
  list,
  limit = 5,
  ...other
}: Props) {
  const [loading, setLoading] = useState(true)
  const [localStartDate, setLocalStartDate] = useState(
    startDate || moment().startOf('month').format('YYYY-MM-DD')
  )
  const [localEndDate, setLocalEndDate] = useState(
    endDate || moment().endOf('month').format('YYYY-MM-DD')
  )
  const [doctorsData, setDoctorsData] = useState<DoctorProps[]>([])

  const fetchTopDoctorsData = useCallback(
    async (start: string, end: string) => {
      try {
        const token = localStorage.getItem('accessToken')
        const response = await fetch(`${API_URL}/report/top-doctors`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({
            startDate: start,
            endDate: end,
            limit
          })
        })

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result: TopDoctorsResponse = await response.json()
        setDoctorsData(result.data)
      } catch (error) {
        console.error('Error fetching top doctors data:', error)
        // Giữ nguyên dữ liệu mặc định nếu có lỗi
      }
    },
    [limit]
  )

  const handleDateRangeUpdate = async () => {
    setLoading(true)
    await fetchTopDoctorsData(localStartDate, localEndDate)
    setLoading(false)
  }

  const handleQuickRange = (range: 'week' | 'month' | 'quarter' | 'year') => {
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

    // Auto update data
    setLoading(true)
    fetchTopDoctorsData(start, end).then(() => setLoading(false))
  }

  useEffect(() => {
    if (!list) {
      const loadData = async () => {
        setLoading(true)
        await fetchTopDoctorsData(localStartDate, localEndDate)
        setLoading(false)
      }
      loadData()
    } else {
      setLoading(false)
    }
  }, [localStartDate, localEndDate, list, fetchTopDoctorsData])

  // Update local dates when props change
  useEffect(() => {
    if (startDate && startDate !== localStartDate) {
      setLocalStartDate(startDate)
    }
    if (endDate && endDate !== localEndDate) {
      setLocalEndDate(endDate)
    }
  }, [startDate, endDate, localStartDate, localEndDate])

  // Sử dụng dữ liệu từ props hoặc dữ liệu API
  const finalData = list || doctorsData

  const renderHeader = () => (
    <Box>
      <CardHeader
        title={title}
        subheader={
          subheader ||
          `Top ${limit} bác sĩ từ ${moment(localStartDate).format('DD/MM/YYYY')} đến ${moment(localEndDate).format('DD/MM/YYYY')}`
        }
        sx={{ mb: enableDatePicker ? 2 : 3 }}
      />

      {enableDatePicker && (
        <Box sx={{ px: 3, pb: 2 }}>
          {/* Quick Range Buttons */}
          <Stack direction="row" spacing={1} sx={{ mb: 2 }} flexWrap="wrap">
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickRange('week')}
              sx={{ minWidth: 'auto' }}
            >
              Tuần này
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickRange('month')}
              sx={{ minWidth: 'auto' }}
            >
              Tháng này
            </Button>
            <Button
              size="small"
              variant="outlined"
              onClick={() => handleQuickRange('quarter')}
              sx={{ minWidth: 'auto' }}
            >
              Quý này
            </Button>
            <Button
              size="small"
              variant="outlined"
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

        <Scrollbar>
          <Stack spacing={3} sx={{ p: 3, minWidth: 400 }}>
            {Array.from({ length: limit }).map((_, index) => (
              <DoctorItemSkeleton key={index} />
            ))}
          </Stack>
        </Scrollbar>
      </Card>
    )
  }

  return (
    <Card {...other}>
      {renderHeader()}

      <Scrollbar>
        <Stack spacing={3} sx={{ p: 3, minWidth: 400 }}>
          {finalData.map((doctor, index) => (
            <DoctorItem key={doctor.id} doctor={doctor} rank={index + 1} />
          ))}
        </Stack>
      </Scrollbar>
    </Card>
  )
}

// ----------------------------------------------------------------------

type DoctorItemProps = {
  doctor: DoctorProps
  rank: number
}

function DoctorItem({ doctor, rank }: DoctorItemProps) {
  const {
    avatar,
    name,
    specialty,
    experience,
    rating,
    totalPatients,
    totalReviews,
    totalAppointments,
    revenue,
    status
  } = doctor

  const getStatusColor = (statusType: string) => {
    switch (statusType) {
      case 'active':
        return 'success'
      case 'busy':
        return 'warning'
      case 'offline':
        return 'default'
      default:
        return 'default'
    }
  }

  const getStatusText = (statusType: string) => {
    switch (statusType) {
      case 'active':
        return 'Đang hoạt động'
      case 'busy':
        return 'Bận'
      case 'offline':
        return 'Offline'
      default:
        return 'Không xác định'
    }
  }

  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      {/* Rank Number */}
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          bgcolor: rank <= 3 ? 'warning.main' : 'grey.300',
          color: rank <= 3 ? 'common.white' : 'text.secondary',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 'bold',
          fontSize: '0.875rem'
        }}
      >
        {rank}
      </Box>

      {/* Doctor Avatar */}
      <Avatar
        src={avatar}
        sx={{
          width: 56,
          height: 56
        }}
      >
        {name.charAt(0).toUpperCase()}
      </Avatar>

      {/* Doctor Info */}
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <Typography variant="subtitle2" noWrap>
          BS. {name}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
          <Iconify
            width={14}
            icon="solar:stethoscope-bold"
            sx={{ color: 'primary.main' }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {specialty}
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1} sx={{ mt: 0.5 }}>
          <Chip
            size="small"
            label={getStatusText(status)}
            color={getStatusColor(status)}
            variant="soft"
            sx={{ height: 20 }}
          />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {experience} năm KN
          </Typography>
        </Stack>
      </Box>

      {/* Stats */}
      <Stack alignItems="flex-end" spacing={0.5} sx={{ minWidth: 80 }}>
        <Rating readOnly size="small" precision={0.1} value={rating} />

        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {fShortenNumber(totalReviews) || 0} đánh giá
        </Typography>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Iconify
            width={12}
            icon="solar:users-group-rounded-bold"
            sx={{ color: 'success.main' }}
          />
          <Typography
            variant="caption"
            sx={{ color: 'success.main', fontWeight: 600 }}
          >
            {fShortenNumber(totalPatients) || 0} Bệnh nhân
          </Typography>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          <Iconify
            width={12}
            icon="solar:calendar-bold"
            sx={{ color: 'info.main' }}
          />
          <Typography
            variant="caption"
            sx={{ color: 'info.main', fontWeight: 600 }}
          >
            {fShortenNumber(totalAppointments) || 0} lịch hẹn
          </Typography>
        </Stack>

        <Typography
          variant="caption"
          sx={{ color: 'warning.main', fontWeight: 600 }}
        >
          {fShortenNumber(revenue) || 0} VNĐ
        </Typography>
      </Stack>
    </Stack>
  )
}

// ----------------------------------------------------------------------

function DoctorItemSkeleton() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Skeleton variant="circular" width={32} height={32} />
      <Skeleton variant="circular" width={56} height={56} />

      <Box sx={{ flexGrow: 1 }}>
        <Skeleton variant="text" width="60%" height={20} />
        <Skeleton variant="text" width="40%" height={16} sx={{ mt: 0.5 }} />
        <Skeleton
          variant="rectangular"
          width={80}
          height={20}
          sx={{ mt: 0.5, borderRadius: 1 }}
        />
      </Box>

      <Stack alignItems="flex-end" spacing={0.5} sx={{ minWidth: 80 }}>
        <Skeleton variant="rectangular" width={80} height={16} />
        <Skeleton variant="text" width={60} height={14} />
        <Skeleton variant="text" width={50} height={14} />
        <Skeleton variant="text" width={70} height={14} />
        <Skeleton variant="text" width={60} height={14} />
      </Stack>
    </Stack>
  )
}
