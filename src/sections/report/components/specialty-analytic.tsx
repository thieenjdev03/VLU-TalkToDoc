import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'

export type SpecialtyAnalyticProps = {
  specialty: string
  visits: number
  revenue: number
  icon?: string
  color?: string
  doctorCount: number
  avgRating: number
  percentChange: number
}

export default function SpecialtyAnalytic({
  specialty,
  visits,
  revenue,
  icon,
  color,
  doctorCount,
  avgRating,
  percentChange
}: SpecialtyAnalyticProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={2}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: color || 'background.paper',
        minWidth: 260
      }}
    >
      <Avatar src={icon} alt={specialty} sx={{ width: 48, height: 48 }} />
      <Stack spacing={0.5}>
        <Typography variant="subtitle1">{specialty}</Typography>
        <Typography variant="body2" color="text.secondary">
          {visits} lượt khám • {doctorCount} bác sĩ
        </Typography>
        <Typography variant="subtitle2">
          {revenue.toLocaleString()} VNĐ
        </Typography>
        <Box display="flex" alignItems="center" gap={1}>
          <Typography
            variant="body2"
            sx={{ color: percentChange >= 0 ? 'success.main' : 'error.main' }}
          >
            {percentChange > 0 ? '+' : ''}
            {percentChange}%
          </Typography>
        </Box>
      </Stack>
    </Stack>
  )
}
