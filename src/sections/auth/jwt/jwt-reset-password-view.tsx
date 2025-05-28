import * as Yup from 'yup'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'

import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LoadingButton from '@mui/lab/LoadingButton'
import { Button, useTheme, useMediaQuery } from '@mui/material'

import { useRouter, useSearchParams } from 'src/routes/hooks'

import { useForgotPassword } from 'src/api/auth'

import FormProvider, { RHFTextField } from 'src/components/hook-form'

export default function JwtResetPasswordView() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { resetPassword, sendPasswordResetOTP, verifyOTP } = useForgotPassword()
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')
  const [isResending, setIsResending] = useState(false)

  useEffect(() => {
    if (!email) {
      router.push('/auth/jwt/forgot-password')
    }
  }, [email, router])

  const ResetPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .required('Vui lòng nhập email')
      .email('Email không hợp lệ'),
    otp: Yup.string()
      .required('Vui lòng nhập mã OTP')
      .min(4, 'Mã OTP phải có ít nhất 4 ký tự'),
    newPassword: Yup.string()
      .required('Vui lòng nhập mật khẩu mới')
      .min(6, 'Mật khẩu phải có ít nhất 6 ký tự'),
    confirmPassword: Yup.string()
      .required('Vui lòng xác nhận mật khẩu')
      .oneOf([Yup.ref('newPassword')], 'Mật khẩu xác nhận không khớp')
  })

  const methods = useForm({
    resolver: yupResolver(ResetPasswordSchema),
    defaultValues: {
      email,
      otp: '',
      newPassword: '',
      confirmPassword: ''
    }
  })

  const {
    handleSubmit,
    formState: { isSubmitting }
  } = methods

  const onSubmit = handleSubmit(async data => {
    try {
      setErrorMsg('')
      setSuccessMsg('')

      const verifyOtpResponse = await verifyOTP(data.email, data.otp)
      if (verifyOtpResponse.status !== 200) {
        throw new Error('Mã OTP không hợp lệ')
      }
      // Gọi API đặt lại mật khẩu
      await resetPassword(data.email, data.otp, data.newPassword)

      setSuccessMsg(
        'Đặt lại mật khẩu thành công! Đang chuyển đến trang đăng nhập...'
      )

      // Chuyển đến trang đăng nhập
      setTimeout(() => {
        router.push('/auth/jwt/login')
      }, 2000)
    } catch (error) {
      console.error(error)
      setErrorMsg(
        typeof error === 'string'
          ? error
          : error.message || 'Có lỗi xảy ra. Vui lòng thử lại!'
      )
    }
  })

  const handleResendOtp = async () => {
    try {
      setIsResending(true)
      setErrorMsg('')

      // Gửi lại OTP
      await sendPasswordResetOTP(email)

      setSuccessMsg('Đã gửi lại mã OTP. Vui lòng kiểm tra email của bạn.')
    } catch (error) {
      console.error(error)
      setErrorMsg(
        typeof error === 'string'
          ? error
          : error.message || 'Không thể gửi lại mã OTP'
      )
    } finally {
      setIsResending(false)
    }
  }

  const renderHead = (
    <Box
      alignItems="center"
      justifyContent="center"
      display="flex"
      flexDirection="column"
    >
      <img
        src="https://res.cloudinary.com/dut4zlbui/image/upload/v1746087113/r8fxpcrmefstk2jn90a3.png"
        alt="logo"
        width={isMobile ? 150 : 200}
        height={isMobile ? 150 : 200}
      />
      <Stack spacing={2} sx={{ mb: isMobile ? 3 : 5 }} textAlign="center">
        <Typography variant={isMobile ? 'h5' : 'h4'}>
          Đặt lại mật khẩu
        </Typography>
        <Typography
          fontSize={isMobile ? 16 : 20}
          fontWeight={600}
          color="text.secondary"
        >
          Nhập mã OTP và mật khẩu mới
        </Typography>
        <Stack direction="row" spacing={0.5} />
      </Stack>
    </Box>
  )

  const renderForm = (
    <Stack spacing={isMobile ? 2 : 2.5}>
      <RHFTextField
        name="email"
        label="Email"
        size={isMobile ? 'small' : 'medium'}
        disabled
      />

      <RHFTextField
        name="otp"
        label="Mã OTP"
        size={isMobile ? 'small' : 'medium'}
      />

      <RHFTextField
        name="newPassword"
        label="Mật khẩu mới"
        type="password"
        size={isMobile ? 'small' : 'medium'}
      />

      <RHFTextField
        name="confirmPassword"
        label="Xác nhận mật khẩu"
        type="password"
        size={isMobile ? 'small' : 'medium'}
      />

      <LoadingButton
        fullWidth
        color="inherit"
        size={isMobile ? 'medium' : 'large'}
        type="submit"
        variant="contained"
        loading={isSubmitting}
        className="login-button"
      >
        Đặt lại mật khẩu
      </LoadingButton>

      <Button
        variant="text"
        fullWidth
        onClick={handleResendOtp}
        disabled={isResending}
      >
        {isResending ? 'Đang gửi...' : 'Gửi lại mã OTP'}
      </Button>

      <Link
        variant="body2"
        color="inherit"
        underline="always"
        sx={{ alignSelf: 'center' }}
        href="/auth/jwt/login"
      >
        Quay lại đăng nhập
      </Link>
    </Stack>
  )

  return (
    <Stack
      sx={{
        minWidth: isMobile ? '90%' : '460px',
        width: isMobile ? '90%' : '460px',
        ml: 'auto',
        mr: 'auto',
        p: isMobile ? 2 : 0
      }}
      className="login-page-wrapper"
    >
      {renderHead}

      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}

      {!!successMsg && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {successMsg}
        </Alert>
      )}

      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
    </Stack>
  )
}
