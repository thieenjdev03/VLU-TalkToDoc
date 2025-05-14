import { Stack, Avatar, Typography } from '@mui/material'

// ----------------------------------------------------------------------

export default function ChatHeaderDetail() {
  return (
    <Stack direction="row" alignItems="center" spacing={2}>
      <Avatar
        src="https://res.cloudinary.com/dut4zlbui/image/upload/v1741543982/favicon-doctor.png"
        alt="AI"
        sx={{ width: 40, height: 40, borderRadius: '50%', boxShadow: 1 }}
      />

      <Stack>
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, color: 'white' }}
        >
          Hỗ trợ, tư vấn sức khoẻ bằng AI
        </Typography>
        <Typography
          variant="subtitle2"
          sx={{ color: '#dfdfdf', fontWeight: 600 }}
        >
          &quot;A.I Không thể thay thế bác sĩ, mà chỉ là trợ lý siêu trí tuệ,
          nâng cao hiệu quả điều trị và tư vấn!&quot;
        </Typography>
      </Stack>
    </Stack>
  )
}
