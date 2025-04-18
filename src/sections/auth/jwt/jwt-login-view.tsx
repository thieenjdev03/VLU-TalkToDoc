import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter, useSearchParams } from 'src/routes/hooks';

import { useBoolean } from 'src/hooks/use-boolean';

import { useLogin } from 'src/api/auth';
import { PATH_AFTER_LOGIN } from 'src/config-global';

import Iconify from 'src/components/iconify';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import './login.css';
// ----------------------------------------------------------------------

export default function JwtLoginView() {
  const { login } = useLogin();
  const router = useRouter();

  const [errorMsg, setErrorMsg] = useState('');

  const searchParams = useSearchParams();

  const returnTo = searchParams.get('returnTo');

  const password = useBoolean();
  const accessToken = localStorage.getItem('accessToken');
  const LoginSchema = Yup.object().shape({
    username: Yup.string().required('Vui lòng nhập tài khoản'),
    password: Yup.string().required('Vui lòng nhập mật khẩu'),
  });

  const methods = useForm({
    resolver: yupResolver(LoginSchema),
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      // await login?.(data.email, data.password);
      const res = await login(data.username, data.password);
      localStorage.setItem('accessToken', res.accessToken);
      localStorage.setItem('userProfile', JSON.stringify(res.userProfile));
      router.push(PATH_AFTER_LOGIN);
    } catch (error) {
      console.error(error);
      reset();
      setErrorMsg(typeof error === 'string' ? error : error.message);
    }
  });
  useEffect(() => {
    if (accessToken) {
      router.push(returnTo || PATH_AFTER_LOGIN);
    }
  }, [accessToken, router, returnTo]);
  const renderHead = (
    <Box alignItems="center" justifyContent="center" display="flex" flexDirection="column">
      <img
        src="https://res.cloudinary.com/dut4zlbui/image/upload/v1741544458/iotwczgmwylmpvklj1mu.png"
        alt="logo"
        width={200}
        height={200}
      />
      <Stack spacing={2} sx={{ mb: 5 }} textAlign="center">
        <Typography variant="h4">Chào mừng trở lại</Typography>
        <Typography fontSize={20} fontWeight={600} color="text.secondary">
          Đăng nhập ngay!
        </Typography>
        <Stack direction="row" spacing={0.5} />
      </Stack>
    </Box>
  );

  const renderForm = (
    <Stack spacing={2.5}>
      <RHFTextField name="username" label="Tài khoản" />
      <RHFTextField
        name="password"
        label="Mật khẩu"
        type={password.value ? 'text' : 'password'}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={password.onToggle} edge="end">
                <Iconify icon={password.value ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Link variant="body2" color="inherit" underline="always" sx={{ alignSelf: 'flex-end' }}>
        Quên mật khẩu?
      </Link>

      <LoadingButton
        fullWidth
        color="inherit"
        size="large"
        type="submit"
        variant="contained"
        loading={isSubmitting}
        className="login-button"
      >
        Đăng nhập
      </LoadingButton>
    </Stack>
  );

  return (
    <Stack sx={{ minWidth: '460px', ml: 'auto', mr: 'auto' }} className="login-page-wrapper">
      {renderHead}
      {!!errorMsg && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMsg}
        </Alert>
      )}
      <FormProvider methods={methods} onSubmit={onSubmit}>
        {renderForm}
      </FormProvider>
    </Stack>
  );
}
