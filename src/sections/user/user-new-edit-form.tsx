import * as Yup from 'yup';
import { useMemo, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { fData } from 'src/utils/format-number';

import Label from 'src/components/label';
import { CustomFile } from 'src/components/upload';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, {
  RHFSwitch,
  RHFTextField,
  RHFUploadAvatar,
  RHFAutocomplete,
} from 'src/components/hook-form';

import { IUserItem } from 'src/types/user';

// ----------------------------------------------------------------------

type Props = {
  currentUser?: IUserItem;
  typeUser: 'user' | 'doctor' | 'employee';
};

type FormValuesProps = {
  fullName: string;
  email: string;
  phoneNumber: string;
  status: string;
  avatarUrl: CustomFile | string | null;
  isVerified: boolean;
  company?: string;
  role?: string;
  hospitalId?: string;
  rank?: string;
  specialty?: string[];
  city?: string;
  experienceYears?: string;
  licenseNo?: string;
};

export default function UserNewEditForm({ currentUser, typeUser }: Props) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();

  const NewUserSchema = Yup.object().shape({
    fullName: Yup.string().required('Họ & tên không được để trống'),
    email: Yup.string().required('Email không được để trống').email('Email không hợp lệ'),
    phoneNumber: Yup.string().required('Số điện thoại không được để trống'),
    avatarUrl: Yup.mixed().nullable(),
    status: Yup.string(),
    isVerified: Yup.boolean(),
    company:
      typeUser === 'user'
        ? Yup.string().required('Bệnh viện không được để trống')
        : Yup.string().optional(),
    role:
      typeUser === 'user' || typeUser === 'employee'
        ? Yup.string().required('Vị trí không được để trống')
        : Yup.string().optional(),
    hospitalId:
      typeUser === 'doctor' || typeUser === 'employee'
        ? Yup.string().required('Bệnh viện không được để trống')
        : Yup.string().optional(),
    rank:
      typeUser === 'doctor'
        ? Yup.string().required('Cấp bậc không được để trống')
        : Yup.string().optional(),
    specialty:
      typeUser === 'doctor' || typeUser === 'employee'
        ? Yup.array().of(Yup.string()).min(1, 'Chọn ít nhất một chuyên khoa')
        : Yup.array().of(Yup.string()).optional(),
    city:
      typeUser === 'doctor'
        ? Yup.string().required('Thành phố không được để trống')
        : Yup.string().optional(),
    experienceYears:
      typeUser === 'doctor'
        ? Yup.string().required('Số năm kinh nghiệm không được để trống')
        : Yup.string().optional(),
    licenseNo:
      typeUser === 'doctor'
        ? Yup.string().required('Mã giấy phép không được để trống')
        : Yup.string().optional(),
  }) as Yup.ObjectSchema<FormValuesProps>;

  const defaultValues = useMemo(
    () => ({
      fullName: currentUser?.fullName || '',
      email: currentUser?.email || '',
      status: currentUser?.status || 'active',
      avatarUrl: currentUser?.avatarUrl || null,
      phoneNumber: currentUser?.phoneNumber || '',
      isVerified: currentUser?.isVerified || true,
      ...(typeUser === 'user' && {
        company: currentUser?.company || '',
        role: currentUser?.role || '',
      }),
      ...(typeUser === 'doctor' && {
        hospitalId: currentUser?.hospitalId || '',
        rank: currentUser?.rank || '',
        specialty: currentUser?.specialty || [],
        city: currentUser?.city || '',
        experienceYears: currentUser?.experienceYears || '',
        licenseNo: currentUser?.licenseNo || '',
      }),
      ...(typeUser === 'employee' && {
        hospitalId: currentUser?.hospitalId || '',
        role: currentUser?.role || '',
        specialty: currentUser?.specialty || [],
      }),
    }),
    [currentUser, typeUser]
  );

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(NewUserSchema) as any,
    defaultValues,
  });

  const {
    reset,
    watch,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      reset();
      enqueueSnackbar(currentUser ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
      router.push(paths.dashboard.user.list);
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  const handleDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];

      const newFile = Object.assign(file, {
        preview: URL.createObjectURL(file),
      }) as CustomFile;

      if (file) {
        setValue('avatarUrl', newFile, { shouldValidate: true });
      }
    },
    [setValue]
  );

  const renderBasicFields = (
    <Box
      rowGap={3}
      columnGap={2}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
      }}
    >
      <RHFTextField name="name" label="Họ & Tên" />
      <RHFTextField name="email" label="Email" />
      <RHFTextField name="phoneNumber" label="Số điện thoại" />
    </Box>
  );

  const renderUserFields = (
    <Box
      rowGap={3}
      columnGap={2}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
      }}
    >
      {renderBasicFields}
      <RHFTextField name="company" label="Bệnh viện" />
      <RHFTextField name="role" label="Vị trí" />
    </Box>
  );

  const renderDoctorFields = (
    <Box
      rowGap={3}
      columnGap={2}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
      }}
    >
      {renderBasicFields}
      <RHFTextField name="hospitalId" label="Bệnh viện" />
      <RHFTextField name="rank" label="Cấp bậc" />
      <RHFAutocomplete
        name="specialty"
        label="Chuyên khoa"
        multiple
        options={[
          { value: 'CK001', label: 'Nội khoa' },
          { value: 'CK002', label: 'Ngoại khoa' },
          { value: 'CK003', label: 'Sản phụ khoa' },
          { value: 'CK004', label: 'Nhi khoa' },
        ]}
      />
      <RHFTextField name="city" label="Thành phố" />
      <RHFTextField name="experienceYears" label="Kinh nghiệm (năm)" />
      <RHFTextField name="licenseNo" label="Mã giấy phép" />
    </Box>
  );

  const renderEmployeeFields = (
    <Box
      rowGap={3}
      columnGap={2}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(2, 1fr)',
      }}
    >
      {renderBasicFields}
      <RHFTextField name="hospitalId" label="Bệnh viện" />
      <RHFTextField name="role" label="Vị trí" />
      <RHFAutocomplete
        name="specialty"
        label="Chuyên khoa"
        multiple
        options={[
          { value: 'CK001', label: 'Nội khoa' },
          { value: 'CK002', label: 'Ngoại khoa' },
          { value: 'CK003', label: 'Sản phụ khoa' },
          { value: 'CK004', label: 'Nhi khoa' },
        ]}
      />
    </Box>
  );

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={4}>
          <Card sx={{ pt: 10, pb: 5, px: 3 }}>
            {currentUser && (
              <Label
                color={
                  (values.status === 'active' && 'success') ||
                  (values.status === 'banned' && 'error') ||
                  'warning'
                }
                sx={{ position: 'absolute', top: 24, right: 24 }}
              >
                {values.status}
              </Label>
            )}

            <Box sx={{ mb: 5 }}>
              <RHFUploadAvatar
                name="avatarUrl"
                maxSize={3145728}
                onDrop={handleDrop}
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Cho phép *.jpeg, *.jpg, *.png, *.gif
                    <br /> dung lượng tối đa {fData(3145728)}
                  </Typography>
                }
              />
            </Box>

            {currentUser && (
              <FormControlLabel
                labelPlacement="start"
                control={
                  <Controller
                    name="status"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value !== 'active'}
                        onChange={(event) =>
                          field.onChange(event.target.checked ? 'banned' : 'active')
                        }
                      />
                    )}
                  />
                }
                label={
                  <>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Khóa tài khoản
                    </Typography>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Vô hiệu hóa tài khoản người dùng
                    </Typography>
                  </>
                }
                sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
              />
            )}

            <RHFSwitch
              name="isVerified"
              labelPlacement="start"
              label={
                <>
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                    Xác thực email
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Tắt tính năng này sẽ tự động gửi email xác thực cho người dùng
                  </Typography>
                </>
              }
              sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
            />
          </Card>
        </Grid>

        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            {typeUser === 'user' && renderUserFields}
            {typeUser === 'doctor' && renderDoctorFields}
            {typeUser === 'employee' && renderEmployeeFields}

            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentUser ? 'Tạo mới' : 'Lưu thay đổi'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
