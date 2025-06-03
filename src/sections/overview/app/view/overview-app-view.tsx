import moment from 'moment'
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

import { Stack } from '@mui/material'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'
import { useTheme } from '@mui/material/styles'
import TextField from '@mui/material/TextField'

import { _appFeatured } from 'src/_mock'
import { API_URL } from 'src/config-global'
import { SeoIllustration } from 'src/assets/illustrations'

import { useSettingsContext } from 'src/components/settings'

import AppWelcome from '../app-welcome'
import AppFeatured from '../app-featured'
import AppTopDoctors from '../app-top-doctors'
import AppWidgetSummary from '../app-widget-summary'
import AppAreaInstalled from '../app-area-installed'
import AppCurrentDownload from '../app-current-download'

// ----------------------------------------------------------------------

interface SummaryData {
  percent: number
  total: number
  series: number[]
}

interface SummaryResponse {
  message: string
  data: SummaryData
  status: number
}

// Định nghĩa type cho dữ liệu chart
interface SpecialtyChartSeries {
  year: string
  data: { name: string; data: number[] }[]
}

interface SpecialtyChartData {
  categories: string[]
  series: SpecialtyChartSeries[]
}

// Custom hook để quản lý thống kê
const useSummaryStats = () => {
  const [stats, setStats] = useState({
    patient: {
      percent: 0,
      total: 0,
      series: [5, 18, 12, 51, 68, 11, 39, 37, 27, 20]
    },
    appointment: {
      percent: 0,
      total: 0,
      series: [20, 41, 63, 33, 28, 35, 50, 46, 11, 26]
    },
    revenue: {
      percent: 0,
      total: 0,
      series: [8, 9, 31, 8, 16, 37, 8, 33, 46, 31]
    }
  })

  const [loading, setLoading] = useState(true)

  const fetchSummaryData = async (
    typeSummary: 'patient' | 'doctor' | 'appointment' | 'revenue',
    startDate: string,
    endDate: string
  ) => {
    try {
      const token = localStorage.getItem('accessToken')
      const response = await fetch(`${API_URL}/report/summary-analyst`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          typeSummary,
          startDate,
          endDate
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: SummaryResponse = await response.json()
      return result.data
    } catch (error) {
      console.error(`Error fetching ${typeSummary} stats:`, error)
      return null
    }
  }

  useEffect(() => {
    const loadAllStats = async () => {
      setLoading(true)
      const startDate = moment().startOf('year').format('YYYY-MM-DD')
      const endDate = moment().endOf('year').format('YYYY-MM-DD')
      try {
        const [patientData, appointmentData, revenueData] = await Promise.all([
          fetchSummaryData('patient', startDate, endDate),
          fetchSummaryData('appointment', startDate, endDate),
          fetchSummaryData('revenue', startDate, endDate)
        ])

        setStats(prev => ({
          patient: patientData || prev.patient || {},
          appointment: appointmentData || prev.appointment || {},
          revenue: revenueData || prev.revenue || {}
        }))
      } catch (error) {
        console.error('Error loading statistics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadAllStats()
  }, [])

  return { stats, loading }
}

export default function OverviewAppView() {
  const theme = useTheme()
  const userProfile = localStorage.getItem('userProfile')
  const user = JSON.parse(userProfile || '{}')
  const navigate = useNavigate()
  const settings = useSettingsContext()

  // Sử dụng custom hook
  const { stats, loading } = useSummaryStats()

  // Tính toán time range cho thống kê
  const currentYear = new Date().getFullYear()
  const startDate = moment().startOf('year').format('YYYY-MM-DD')
  const endDate = moment().endOf('year').format('YYYY-MM-DD')

  // Helper function để format số tiền
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)

  // State cho dữ liệu appointment theo chuyên khoa từng năm
  const [specialtyChart, setSpecialtyChart] = useState<SpecialtyChartData>({
    categories: [
      'Tháng 1',
      'Tháng 2',
      'Tháng 3',
      'Tháng 4',
      'Tháng 5',
      'Tháng 6',
      'Tháng 7',
      'Tháng 8',
      'Tháng 9',
      'Tháng 10',
      'Tháng 11',
      'Tháng 12'
    ],
    series: []
  })
  const [loadingSpecialty, setLoadingSpecialty] = useState(true)

  const [statMode, setStatMode] = useState<'year' | 'month' | 'range'>('year')
  const [selectedYear, setSelectedYear] = useState<number>(
    new Date().getFullYear()
  )
  const [selectedMonth, setSelectedMonth] = useState<number>(
    new Date().getMonth() + 1
  )
  const [range, setRange] = useState<{ start: string; end: string }>({
    start: moment().startOf('year').format('YYYY-MM-DD'),
    end: moment().endOf('year').format('YYYY-MM-DD')
  })

  const [donutData, setDonutData] = useState<
    { label: string; value: number }[]
  >([])

  useEffect(() => {
    const fetchSpecialtyStats = async () => {
      setLoadingSpecialty(true)
      try {
        const token = localStorage.getItem('accessToken')
        let body: any = {}
        if (statMode === 'year') {
          body = { years: [selectedYear] }
        } else if (statMode === 'month') {
          body = { years: [selectedYear], months: [selectedMonth] }
        } else if (statMode === 'range') {
          body = { startDate: range.start, endDate: range.end }
        }
        const response = await fetch(
          `${API_URL}/report/appointment-by-specialty`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(body)
          }
        )
        if (!response.ok) throw new Error('Fetch failed')
        const result = await response.json()
        // Mapping lại dữ liệu cho chart
        if (statMode === 'year') {
          const categories = [
            'Tháng 1',
            'Tháng 2',
            'Tháng 3',
            'Tháng 4',
            'Tháng 5',
            'Tháng 6',
            'Tháng 7',
            'Tháng 8',
            'Tháng 9',
            'Tháng 10',
            'Tháng 11',
            'Tháng 12'
          ]
          const chartData = {
            categories,
            series: result.data.map((yearObj: any) => ({
              year: String(yearObj.year),
              data: yearObj.specialties.map((s: any) => ({
                name: s.name,
                data: s.monthly
              }))
            }))
          }
          setSpecialtyChart(chartData)
        } else if (statMode === 'month') {
          // Mapping cho donut chart
          setDonutData(
            (result.data[0]?.specialties || []).map((s: any) => ({
              label: s.name,
              value: s.monthly[0] ?? 0
            }))
          )
        } else if (statMode === 'range') {
          // Backend trả về: categories là mảng tháng trong range, mỗi specialty có mảng data tương ứng
          // Giả sử backend trả về: { categories: [...], series: [{ year, data: [{ name, data: [...] }] }] }
          if (result.data && result.data.categories && result.data.series) {
            setSpecialtyChart(result.data)
          } else {
            // fallback: mapping thủ công nếu backend trả về như mode year
            setSpecialtyChart({
              categories: [
                'Tháng 1',
                'Tháng 2',
                'Tháng 3',
                'Tháng 4',
                'Tháng 5',
                'Tháng 6',
                'Tháng 7',
                'Tháng 8',
                'Tháng 9',
                'Tháng 10',
                'Tháng 11',
                'Tháng 12'
              ],
              series: (result.data || []).map((yearObj: any) => ({
                year: String(yearObj.year),
                data: (yearObj.specialties || []).map((s: any) => ({
                  name: s.name,
                  data: s.monthly
                }))
              }))
            })
          }
        }
      } catch (err) {
        setSpecialtyChart({
          categories: [
            'Tháng 1',
            'Tháng 2',
            'Tháng 3',
            'Tháng 4',
            'Tháng 5',
            'Tháng 6',
            'Tháng 7',
            'Tháng 8',
            'Tháng 9',
            'Tháng 10',
            'Tháng 11',
            'Tháng 12'
          ],
          series: []
        })
      } finally {
        setLoadingSpecialty(false)
      }
    }
    fetchSpecialtyStats()
  }, [statMode, selectedYear, selectedMonth, range])

  return (
    <Container maxWidth={settings.themeStretch ? false : 'xl'}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          {user?.role === 'ADMIN' && (
            <AppWelcome
              title={`Xin chào 👋, Quản trị viên ${user?.fullName || ''}`}
              description="Chào mừng bạn đến với trang quản trị hệ thống. Bạn có thể quản lý người dùng, lịch hẹn, bác sĩ và các chức năng khác tại đây."
              img={<SeoIllustration />}
              action={
                <Button
                  onClick={() => navigate('/dashboard/user')}
                  variant="contained"
                  color="primary"
                >
                  Quản lý người dùng
                </Button>
              }
            />
          )}
          {user?.role === 'DOCTOR' && (
            <AppWelcome
              title={`Xin chào 👋,${user?.fullName || ''}`}
              description="Chào mừng bạn đến với trang quản lý lịch hẹn. Hãy kiểm tra và xác nhận các lịch hẹn của bạn."
              img={<SeoIllustration />}
              action={
                <Button
                  onClick={() =>
                    navigate(
                      user?.registrationStatus === 'approved'
                        ? '/dashboard/appointment/list'
                        : '/dashboard/user/account'
                    )
                  }
                  variant="contained"
                  color="primary"
                >
                  {user?.registrationStatus === 'approved'
                    ? 'Xem lịch hẹn của tôi'
                    : 'Cập nhật hồ sơ'}
                </Button>
              }
            />
          )}
          {user?.role === 'PATIENT' && (
            <AppWelcome
              title={`Xin chào 👋, ${user?.fullName || ''}`}
              description="Chúng tôi rất vui khi được đồng hành cùng bạn trong hành trình chăm sóc sức khỏe."
              img={<SeoIllustration />}
              action={
                <Button
                  onClick={() => navigate('/dashboard/create-booking')}
                  variant="contained"
                  color="primary"
                >
                  Đặt Lịch Hẹn Ngay
                </Button>
              }
            />
          )}
        </Grid>

        <Grid xs={12} md={4}>
          <AppFeatured list={_appFeatured} />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title={`Tổng Bệnh Nhân Mới Năm ${currentYear}`}
            percent={stats.patient.percent * 100 || 0}
            total={stats.patient.total || 0}
            chart={{
              series: stats.patient.series || []
            }}
            loading={loading}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title={`Tổng Lịch Hẹn Năm ${currentYear}`}
            percent={stats.appointment.percent * 100 || 0}
            total={stats.appointment.total || 0}
            chart={{
              colors: [theme.palette.info.light, theme.palette.info.main],
              series: stats.appointment.series || []
            }}
            loading={loading}
          />
        </Grid>

        <Grid xs={12} md={4}>
          <AppWidgetSummary
            title={`Tổng Doanh Thu Năm ${currentYear}`}
            percent={stats.revenue.percent * 100 || 0}
            total={stats.revenue.total || 0}
            chart={{
              colors: [theme.palette.warning.light, theme.palette.warning.main],
              series: stats.revenue.series
            }}
            loading={loading}
            formatValue={formatCurrency}
          />
        </Grid>

        <Grid xs={12} md={6} lg={6}>
          <AppCurrentDownload
            title="Thống Kê Trạng Thái Lịch Hẹn"
            subheader={`Dữ liệu từ ${moment(startDate).format('DD/MM/YYYY')} đến ${moment(endDate).format('DD/MM/YYYY')}`}
            startDate={startDate}
            endDate={endDate}
            enableDatePicker
            defaultRange="month"
          />
        </Grid>
        <Grid xs={12} md={6} lg={6}>
          <AppTopDoctors
            title="Top Bác Sĩ"
            startDate={startDate}
            endDate={endDate}
            enableDatePicker
            limit={5}
          />
        </Grid>
        <Grid
          xs={12}
          md={12}
          lg={12}
          sx={{
            backgroundColor: 'white',
            p: 2,
            pt: 4,
            borderRadius: 2,
            mt: 2,
            boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)'
          }}
        >
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            alignItems="center"
            sx={{ mb: 2 }}
          >
            <TextField
              select
              label="Chế độ thống kê"
              value={statMode}
              onChange={e =>
                setStatMode(e.target.value as 'year' | 'month' | 'range')
              }
              size="small"
              sx={{ minWidth: 160 }}
            >
              <MenuItem value="year">Theo năm</MenuItem>
              <MenuItem value="month">Theo tháng</MenuItem>
              <MenuItem value="range">Khoảng thời gian</MenuItem>
            </TextField>
            {statMode === 'year' && (
              <TextField
                select
                label="Năm"
                value={selectedYear}
                onChange={e => setSelectedYear(Number(e.target.value))}
                size="small"
                sx={{ minWidth: 120 }}
              >
                {[2023, 2024, 2025].map(y => (
                  <MenuItem key={y} value={y}>
                    {y}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {statMode === 'month' && (
              <>
                <TextField
                  select
                  label="Năm"
                  value={selectedYear}
                  onChange={e => setSelectedYear(Number(e.target.value))}
                  size="small"
                  sx={{ minWidth: 120 }}
                >
                  {[2023, 2024, 2025].map(y => (
                    <MenuItem key={y} value={y}>
                      {y}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="Tháng"
                  value={selectedMonth}
                  onChange={e => setSelectedMonth(Number(e.target.value))}
                  size="small"
                  sx={{ minWidth: 100 }}
                >
                  {[...Array(12)].map((_, i) => (
                    <MenuItem
                      key={i + 1}
                      value={i + 1}
                    >{`Tháng ${i + 1}`}</MenuItem>
                  ))}
                </TextField>
              </>
            )}
            {statMode === 'range' && (
              <>
                <TextField
                  type="date"
                  label="Từ ngày"
                  value={range.start}
                  onChange={e =>
                    setRange(r => ({ ...r, start: e.target.value }))
                  }
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  type="date"
                  label="Đến ngày"
                  value={range.end}
                  onChange={e => setRange(r => ({ ...r, end: e.target.value }))}
                  size="small"
                  InputLabelProps={{ shrink: true }}
                />
              </>
            )}
          </Stack>
          {statMode === 'month' ? (
            <AppCurrentDownload
              title={`Thống kê lịch hẹn theo chuyên khoa tháng ${selectedMonth}`}
              chart={{
                series: donutData
              }}
              enableDatePicker={false}
              handleShowRangeMonth
            />
          ) : (
            <AppAreaInstalled
              title="Thống kê lịch hẹn theo chuyên khoa"
              subheader="Biểu đồ số lượng lịch hẹn từng chuyên khoa theo tháng"
              chart={specialtyChart}
            />
          )}
        </Grid>

        {/* <Grid xs={12} lg={8}>
          <AppNewInvoice
            title="New Invoice"
            tableData={_appInvoices}
            tableLabels={[
              { id: 'id', label: 'Invoice ID' },
              { id: 'category', label: 'Category' },
              { id: 'price', label: 'Price' },
              { id: 'status', label: 'Status' },
              { id: '' }
            ]}
          />
        </Grid> */}
      </Grid>
    </Container>
  )
}
