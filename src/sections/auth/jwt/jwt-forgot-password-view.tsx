import * as Yup from 'yup'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import Box from '@mui/material/Box'
import Link from '@mui/material/Link'
import Alert from '@mui/material/Alert'
import Stack from '@mui/material/Stack'
import Typography from '@mui/material/Typography'
import LoadingButton from '@mui/lab/LoadingButton'
import { useTheme, useMediaQuery } from '@mui/material'

import { useRouter } from 'src/routes/hooks'

import { useForgotPassword } from 'src/api/auth'

import FormProvider, { RHFTextField } from 'src/components/hook-form'

export default function JwtForgotPasswordView() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const { requestForgotPassword, sendPasswordResetOTP } = useForgotPassword()
  const router = useRouter()

  const [errorMsg, setErrorMsg] = useState('')
  const [successMsg, setSuccessMsg] = useState('')

  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string()
      .required('Vui lòng nhập email')
      .email('Email không hợp lệ')
  })

  const methods = useForm({
    resolver: yupResolver(ForgotPasswordSchema),
    defaultValues: {
      email: ''
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

      // Gọi API quên mật khẩu
      await requestForgotPassword(data.email)

      // Gửi OTP đến email
      await sendPasswordResetOTP(data.email)

      setSuccessMsg('Mã OTP đã được gửi đến email của bạn')

      // Chuyển đến trang nhập OTP và mật khẩu mới
      setTimeout(() => {
        router.push(
          `/auth/jwt/reset-password?email=${encodeURIComponent(data.email)}`
        )
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
        <Typography variant={isMobile ? 'h5' : 'h4'}>Quên mật khẩu</Typography>
        <Typography
          fontSize={isMobile ? 16 : 20}
          fontWeight={600}
          color="text.secondary"
        >
          Nhập email để lấy lại mật khẩu
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
        Gửi yêu cầu
      </LoadingButton>

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
