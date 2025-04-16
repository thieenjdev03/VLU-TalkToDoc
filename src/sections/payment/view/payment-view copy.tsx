import { useNavigate } from 'react-router-dom';

import { Button, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

export default function PaymentView() {
  const navigate = useNavigate();

  return (
    <Container
      sx={{
        pt: 15,
        pb: 10,
        minHeight: '100vh',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <div className="flex items-center justify-center mb-4">
        <svg
          className="text-green-500 w-20 h-20 animate-bounce"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>
      <Typography variant="h3" gutterBottom>
        Thanh toán thành công!
      </Typography>
      <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
        Cảm ơn bạn đã hoàn tất thanh toán. Email xác nhận đã được gửi đến bạn. Vui lòng kiểm tra hộp
        thư để biết thêm chi tiết.
      </Typography>
      <div className="flex justify-center gap-4 mt-6">
        <Button variant="outlined" onClick={() => navigate(paths.dashboard.booking.root)}>
          Về trang chính
        </Button>
        <Button variant="contained" onClick={() => navigate(paths.dashboard.booking.create)}>
          Đặt lịch mới
        </Button>
      </div>
    </Container>
  );
}
