import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { useMemo, useState, useEffect, useCallback } from 'react';

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

import { useCreateUser } from 'src/api/user';
import { useGetSpecialties } from 'src/api/specialty';

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
import { ISpecialtyItem } from 'src/types/specialties';

// ----------------------------------------------------------------------

type Props = {
  currentUser?: IUserItem;
  typeUser: 'user' | 'doctor' | 'employee' | 'patient';
};

type FormValuesProps = {
  fullName: string;
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  status: string;
  active: boolean;
  avatarUrl: CustomFile | string | null;
  isVerified: boolean;
  company?: string;
  position?: string;
  hospitalId?: string;
  rank?: string;
  specialty?: string[] | any;
  city?: string;
  experienceYears?: string;
  licenseNo?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  emergencyContact?: string[];
};

export default function UserNewEditForm({ currentUser, typeUser }: Props) {
  const router = useRouter();
  const { specialties } = useGetSpecialties();
  const [specialtyList, setSpecialtyList] = useState<ISpecialtyItem[]>([]);
  useEffect(() => {
    if (specialties.length) {
      setSpecialtyList(specialties);
    }
  }, [specialties]);
  const { enqueueSnackbar } = useSnackbar();
  const { createUser } = useCreateUser({ typeUser });
  const NewUserSchema = Yup.object().shape({
    fullName: Yup.string().required('Họ & tên không được để trống'),
    username: Yup.string().required('Tên tài khoản không được để trống'),
    password: Yup.string().required('Mật khẩu không được để trống'),
    email: Yup.string().required('Email không được để trống').email('Email không hợp lệ'),
    phoneNumber: Yup.string().required('Số điện thoại không được để trống'),
    avatarUrl: Yup.mixed().nullable(),
    status: Yup.string(),
    active: Yup.boolean(),
    isVerified: Yup.boolean(),
    gender:
      typeUser === 'patient'
        ? Yup.string().required('Giới tính không được để trống')
        : Yup.string().optional(),
    birthDate:
      typeUser === 'patient'
        ? Yup.string().required('Ngày sinh không được để trống')
        : Yup.string().optional(),
    address:
      typeUser === 'patient'
        ? Yup.string().required('Địa chỉ không được để trống')
        : Yup.string().optional(),
    emergencyContact: Yup.array().of(Yup.string()),
    company:
      typeUser === 'user'
        ? Yup.string().required('Bệnh viện không được để trống')
        : Yup.string().optional(),
    position:
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
        ? Yup.array()
            .of(Yup.string().required('Chuyên khoa không hợp lệ'))
            .min(1, 'Chọn ít nhất một chuyên khoa')
            .required('Chuyên khoa không được để trống')
        : Yup.string().optional(),
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
      username: currentUser?.username || '',
      password: currentUser?.password || '',
      email: currentUser?.email || '',
      status: currentUser?.status || 'active',
      active: currentUser?.active || true,
      avatarUrl: currentUser?.avatarUrl || null,
      phoneNumber: currentUser?.phoneNumber || '',
      isVerified: currentUser?.isVerified || true,
      ...(typeUser === 'user' && {
        company: currentUser?.company || '',
        position: currentUser?.position || '',
      }),
      ...(typeUser === 'doctor' && {
        hospitalId: currentUser?.hospitalId || '',
        rank: currentUser?.rank || '',
        specialty: Array.isArray(currentUser?.specialty)
          ? currentUser?.specialty.map((item: any) =>
              typeof item === 'object' ? item.value : item
            )
          : [],
        city: currentUser?.city || '',
        experienceYears: currentUser?.experienceYears || '',
        licenseNo: currentUser?.licenseNo || '',
      }),
      ...(typeUser === 'employee' && {
        hospitalId: currentUser?.hospitalId || '',
        position: currentUser?.position || '',
        specialty: Array.isArray(currentUser?.specialty)
          ? currentUser?.specialty.map((item: any) =>
              typeof item === 'object' ? item.value : item
            )
          : [],
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
    formState: { isSubmitting, errors }, // Thêm errors để debug
  } = methods;
  console.log('Form Errors:', errors);

  const values = watch();

  const onSubmit = handleSubmit(async (data) => {
    try {
      let formattedData;
      let path;
      if (typeUser === 'doctor') {
        path = paths.dashboard.user.list_doctor;
        formattedData = {
          ...data,
          specialty: Array.isArray(data.specialty)
            ? data.specialty.map((item) => (typeof item === 'object' ? item.value : item))
            : [],
        };
      } else if (typeUser === 'patient') {
        path = paths.dashboard.user.list_patient;
        formattedData = {
          ...data,
        };
      } else if (typeUser === 'employee') {
        path = paths.dashboard.user.list_employee;
        formattedData = {
          ...data,
        };
      }
      await createUser({ data: formattedData });

      reset();
      enqueueSnackbar(currentUser ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
      router.push(path || '');
    } catch (err) {
      console.error(err);
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
        xs: 'repeat(2, 2fr)',
        sm: 'repeat(2, 2fr)',
      }}
    >
      <FormControlLabel
        control={
          <Controller
            name="active"
            control={control}
            render={({ field }) => (
              <Switch
                {...field}
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
              />
            )}
          />
        }
        label="Trạng Thái"
      />
      <RHFTextField name="fullName" label="Họ & Tên" />
      <RHFTextField name="phoneNumber" label="Số điện thoại" />
      <RHFTextField name="username" label="Tên tài khoản" />
      <RHFTextField name="password" type="password" label="Mật khẩu" />

      <Box
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(1, 1fr)',
        }}
      >
        <RHFTextField name="email" label="Email" />
      </Box>
    </Box>
  );

  const renderUserFields = (
    <Box
      rowGap={3}
      columnGap={2}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(1, 1fr)',
      }}
    >
      {renderBasicFields}
    </Box>
  );

  const renderPatientFields = (
    <Box
      rowGap={3}
      columnGap={2}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(1, 1fr)',
      }}
    >
      {renderBasicFields}
      <RHFTextField name="address" label="Địa chỉ" />
      <Box
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(2, 2fr)',
          sm: 'repeat(2, 2fr)',
        }}
      >
        <RHFTextField name="birthDate" label="Ngày sinh" />
        <RHFAutocomplete
          name="gender"
          label="Giới tính"
          options={[
            { value: 'male', label: 'Nam' },
            { value: 'female', label: 'Nữ' },
            { value: 'other', label: 'Khác' },
          ]}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
          isOptionEqualToValue={(option, value: any) =>
            typeof option === 'string' ? option === value : option.value === value
          }
          onChange={(event, newValue: any) =>
            setValue('gender', newValue.value, { shouldValidate: true })
          }
        />
      </Box>
    </Box>
  );

  const renderDoctorFields = (
    <Box
      rowGap={3}
      columnGap={2}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(1, 1fr)',
      }}
    >
      <Box
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 2fr)',
          sm: 'repeat(1, 2fr)',
        }}
      >
        {renderBasicFields}
        <RHFAutocomplete
          name="specialty"
          label="Chuyên khoa"
          multiple
          options={specialtyList.map((item) => ({
            value: item._id,
            label: item.name,
          }))}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
          isOptionEqualToValue={(option, value: any) =>
            typeof option === 'string' ? option === value : option.value === value
          }
          onChange={(event, newValue) =>
            setValue(
              'specialty',
              newValue.map((item) => (typeof item === 'string' ? item : item.value)),
              { shouldValidate: true }
            )
          }
        />
        <RHFTextField name="hospitalId" label="Bệnh viện" />
        <RHFTextField name="city" label="Thành phố" />
        <RHFTextField name="rank" label="Cấp bậc" />
        <RHFTextField name="experienceYears" label="Kinh nghiệm (năm)" />
        <RHFTextField name="licenseNo" label="Mã giấy phép" />
      </Box>
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
      <RHFAutocomplete
        name="specialty"
        label="Chuyên khoa"
        multiple
        options={specialtyList.map((item) => ({
          value: item._id,
          label: item.name,
        }))}
        getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
        isOptionEqualToValue={(option, value: any) =>
          typeof option === 'string' ? option === value : option.value === value
        }
        onChange={(event, newValue) =>
          setValue(
            'specialty',
            newValue.map((item) => (typeof item === 'string' ? item : item.value)),
            { shouldValidate: true }
          )
        }
      />
      <RHFTextField name="hospitalId" label="Bệnh viện" />
      <RHFTextField name="position" label="Vị trí" />
      <RHFTextField name="city" label="Thành phố" />
      <RHFTextField name="experienceYears" label="Kinh nghiệm (năm)" />
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
                  <Typography variant="subtitle2" sx={{ mb: 0.5 }} />
                  Xác thực email
                  <Typography variant="body2" sx={{ color: 'text.secondary' }} />
                  Tắt tính năng này sẽ tự động gửi email xác thực cho người dùng
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
            {typeUser === 'patient' && renderPatientFields}
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                onClick={() => {
                  console.log('Clicked submit button');
                }}
              >
                {!currentUser ? 'Tạo mới' : 'Lưu thay đổi'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
