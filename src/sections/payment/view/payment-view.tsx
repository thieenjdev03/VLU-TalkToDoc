import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

import { Button, Container, Typography } from '@mui/material';

import { paths } from 'src/routes/paths';

import { updateAppointment, getAppointmentById } from 'src/sections/create-booking/api';

import VnPayReturnPage from '../vnPay-return-page';

export default function PaymentView() {
  const navigate = useNavigate();
  const currentPath = useLocation();
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [appointmentDetails, setAppointmentDetails] = useState<any>(null);

  useEffect(() => {
    const handleSubmitPaid = async () => {
      const appointmentStored = JSON.parse(localStorage.getItem('current_appointment') || '{}');
      const submitPaid = async () => {
        await updateAppointment({
          appointmentId: appointmentStored?._id,
          data: {
            ...appointmentStored,
            payment: {
              ...appointmentStored?.payment,
              billing_status: 'PAID',
            },
          },
        });
      };
      if (appointmentStored) {
        const appointment = await getAppointmentById({ appointmentId: appointmentStored?._id });
        setAppointmentDetails(appointment);
        submitPaid();
      }
    };
    handleSubmitPaid();
  }, [currentPath, paymentSuccess]);

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
      {currentPath.search.includes('vnp_Amount') && !paymentSuccess ? (
        <VnPayReturnPage setPaymentSuccess={setPaymentSuccess} />
      ) : (
        <>
          <div className="flex items-center justify-center mb-4">
            <svg
              className="text-green-500 w-20 h-20 animate-bounce"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <Typography variant="h3" gutterBottom>
            Thanh toán thành công!
          </Typography>
          {appointmentDetails && (
            <Typography variant="body1" sx={{ color: 'text.secondary', maxWidth: 500, mx: 'auto' }}>
              Thông tin lịch hẹn:
              <br />
              Mã lịch hẹn: {appointmentDetails.appointmentId}
              <br />
              Bác sĩ: {appointmentDetails.doctor.fullName}
              <br />
              Chuyên khoa: {appointmentDetails.specialty.name}
              <br />
              Ngày: {appointmentDetails.booking.date}
              <br />
              Giờ hẹn: {appointmentDetails.booking.slot}
              <br />
              Tổng chi phí: {appointmentDetails.payment.totalFee.toLocaleString('vi-VN')}đ
            </Typography>
          )}
          <div className="flex justify-center gap-4 mt-6">
            <Button
              variant="outlined"
              onClick={() => {
                navigate(paths.dashboard.root);
                localStorage.removeItem('current_appointment');
              }}
            >
              Về trang chính
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                navigate(paths.dashboard.appointment.list);
                localStorage.removeItem('current_appointment');
              }}
            >
              Xem danh sách lịch hẹn
            </Button>
          </div>
        </>
      )}
    </Container>
  );
}
