import axios from 'axios';
import * as Yup from 'yup';
import { useMemo, useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Grid from '@mui/material/Unstable_Grid2';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useCreateUser } from 'src/api/user';
import { useGetSpecialties } from 'src/api/specialty';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import { IUserItem } from 'src/types/user';
import { IPharmacyItem } from 'src/types/hospital';
import { ISpecialtyItem } from 'src/types/specialties';

// ----------------------------------------------------------------------

type Props = {
  currentUser?: IUserItem;
  typeUser: 'user' | 'doctor' | 'employee' | 'patient';
  hospitals: IPharmacyItem[];
  ranking: any[];
  onUpdateSuccess?: () => void;
};

interface IProvince {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  phone_code: number;
}

type FormValuesProps = {
  fullName: string;
  username: string;
  password: string;
  email: string;
  phoneNumber: string;
  status: string;
  isActive: boolean;
  avatarUrl: any;
  isVerified: boolean;
  company?: string;
  position?: string;
  rank?: string;
  specialty?: string[] | any;
  city?: string;
  experienceYears?: string;
  licenseNo?: string;
  gender?: string;
  birthDate?: string;
  address?: string;
  hospital?: any;
  department?: string;
  salary?: number;
  emergencyContact?: string[];
};

export default function UserNewEditForm({
  currentUser,
  typeUser,
  hospitals,
  ranking,
  onUpdateSuccess,
}: Props) {
  const router = useRouter();
  const { specialties } = useGetSpecialties({
    query: '',
    page: 1,
    limit: 10,
    sortField: '',
    sortOrder: 'desc',
  });
  const [specialtyList, setSpecialtyList] = useState<ISpecialtyItem[]>([]);
  useEffect(() => {
    if (specialties?.length) {
      setSpecialtyList(specialties);
    }
  }, [specialties]);
  const { enqueueSnackbar } = useSnackbar();
  const { createUser } = useCreateUser({ typeUser });
  const [cities, setCities] = useState<IProvince[]>([]);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);

  // Load danh sách thành phố từ API
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const response = await axios.get('https://provinces.open-api.vn/api/');
        setCities(response.data);
      } catch (error) {
        enqueueSnackbar('Failed to load cities data', { variant: 'error' });
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [enqueueSnackbar]);
  const formatNumber = (value: number | string) => {
    if (!value) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Parse formatted number back to number
  const parseNumber = (value: string) => value.replace(/,/g, '');

  const cityOptions = cities.map((city) => city.name);
  const NewUserSchema = Yup.object().shape({
    fullName: Yup.string().required('Họ & tên không được để trống'),
    username: Yup.string().required('Tên tài khoản không được để trống'),
    password: Yup.string().required('Mật khẩu không được để trống'),
    email: Yup.string().required('Email không được để trống').email('Email không hợp lệ'),
    phoneNumber: Yup.string().required('Số điện thoại không được để trống'),
    avatarUrl: Yup.mixed().nullable(),
    status: Yup.string(),
    isActive: Yup.boolean(),
    isVerified: Yup.boolean(),
    rank:
      typeUser === 'doctor'
        ? Yup.string().required('Cấp bậc không được để trống')
        : Yup.string().optional(),
    hospital:
      typeUser === 'doctor'
        ? Yup.string().required('Bệnh viện không được để trống')
        : Yup.string().optional(),
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
    company:
      typeUser === 'user'
        ? Yup.string().required('Bệnh viện không được để trống')
        : Yup.string().optional(),
    position:
      typeUser === 'user' || typeUser === 'employee'
        ? Yup.string().required('Vị trí không được để trống')
        : Yup.string().optional(),
    ranking: typeUser === 'doctor' ? Yup.string().optional() : Yup.string().optional(),
    specialty:
      typeUser === 'doctor'
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
    department:
      typeUser === 'employee'
        ? Yup.string().required('Bộ phận không được để trống')
        : Yup.string().optional(),
    salary:
      typeUser === 'employee' || typeUser === 'doctor'
        ? Yup.string().required('Lương không được để trống')
        : Yup.string().optional(),
    emergencyContact:
      typeUser === 'user'
        ? Yup.array().required('Liên hệ khẩn cấp không được để trống')
        : Yup.array().optional(),
  }) as Yup.ObjectSchema<FormValuesProps>;

  const defaultValues = useMemo(
    () => ({
      fullName: currentUser?.fullName || '',
      username: currentUser?.username || '',
      password: currentUser?.password || '',
      email: currentUser?.email || '',
      status: currentUser?.status || 'isActive',
      isActive: currentUser?.isActive || true,
      avatarUrl: currentUser?.avatarUrl || null,
      phoneNumber: currentUser?.phoneNumber || '',
      isVerified: currentUser?.isVerified || true,
      ...(typeUser === 'user' && {
        company: currentUser?.company || '',
        position: currentUser?.position || '',
        emergencyContact: currentUser?.emergencyContact || [],
      }),
      ...(typeUser === 'doctor' && {
        hospital: currentUser?.hospital || '',
        rank: currentUser?.rank || '',
        salary: currentUser?.salary || 0,
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
        hospital: currentUser?.hospital || '',
        salary: currentUser?.salary || 0,
        position: currentUser?.position || '',
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
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting, errors }, // Thêm errors để debug
  } = methods;
  console.log('Form Errors:', errors);

  const onSubmit = handleSubmit(async (data) => {
    try {
      let formattedData;
      let path;
      if (typeUser === 'doctor') {
        path = paths.dashboard.user.list_doctor;
        formattedData = {
          ...data,
          avatarUrl: data.avatarUrl?.preview || data.avatarUrl,
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
      console.log('Data:', formattedData);
      reset();
      enqueueSnackbar(currentUser ? 'Cập nhật thành công!' : 'Tạo mới thành công!');
      router.push(path || '');
    } catch (err) {
      console.error(err);
    }
  });

  const renderBasicFields = (
    <Box
      rowGap={3}
      columnGap={2}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(1, 1fr)',
      }}
    >
      <Box sx={{ fontSize: '16px', fontWeight: '700' }}>Nhập thông tin người dùng: </Box>

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
      <FormControlLabel
        control={
          <Controller
            name="isActive"
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
        label="Kích hoạt"
      />
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
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(1, 1fr)',
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
  const hospitalOptions = hospitals.map((hospital) => ({
    value: hospital._id,
    label: hospital.name,
  }));

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
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(1, 1fr)',
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
              newValue.map((item) => (typeof item === 'string' ? item : item.label)),
              { shouldValidate: true }
            )
          }
        />
        <RHFAutocomplete
          name="hospital"
          label="Bệnh Viện"
          options={hospitalOptions}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
          isOptionEqualToValue={(option, value: any) =>
            typeof option === 'string' ? option === value : option.value === value
          }
          onChange={(event, newValue: any) =>
            setValue('hospital', newValue.label, { shouldValidate: true })
          }
        />
        {loadingCities ? (
          <RHFTextField
            name="city"
            label="Thành Phố/Tỉnh"
            disabled
            placeholder="Loading cities..."
          />
        ) : (
          <RHFAutocomplete
            name="city"
            label="Thành Phố/Tỉnh"
            placeholder="Chọn thành Phố/Tỉnh"
            options={cityOptions}
            isOptionEqualToValue={(option, value) => option === value}
          />
        )}
        <RHFAutocomplete
          name="rank"
          label="Cấp Bậc"
          options={ranking?.data?.map((item) => ({
            value: item._id,
            label: item.name,
          }))}
          getOptionLabel={(option) => (typeof option === 'string' ? option : option.label)}
          isOptionEqualToValue={(option, value: any) =>
            typeof option === 'string' ? option === value : option.value === value
          }
          onChange={(event, newValue: any) =>
            setValue('rank', newValue.label, { shouldValidate: true })
          }
        />
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
        sm: 'repeat(1 1fr)',
      }}
    >
      {renderBasicFields}
      {loadingCities ? (
        <RHFTextField name="city" label="Thành Phố/Tỉnh" disabled placeholder="Loading cities..." />
      ) : (
        <RHFAutocomplete
          name="city"
          label="Thành Phố/Tỉnh"
          placeholder="Chọn thành Phố/Tỉnh"
          options={cityOptions}
          isOptionEqualToValue={(option, value) => option === value}
        />
      )}
      <RHFTextField name="position" label="Vai Trò" />
      <RHFTextField name="department" label="Bộ Phận" />
      <Controller
        name="salary"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <RHFTextField
            name="salary"
            label="Lương / Tháng"
            value={formatNumber(field.value || 0)}
            onChange={(e) => {
              const parsedValue = parseNumber(e.target.value);
              if (!parsedValue || /^\d+$/.test(parsedValue)) {
                field.onChange(parsedValue);
              }
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">VND</InputAdornment>,
            }}
            helperText={error?.message || 'Nhập số tiền không có dấu phẩy'}
            error={!!error}
          />
        )}
      />
    </Box>
  );
  // <Grid xs={12} md={4}>
  //   <Card sx={{ pt: 10, pb: 5, px: 3 }}>
  //     {currentUser && (
  //       <Label
  //         color={
  //           (values.status === 'active' && 'success') ||
  //           (values.status === 'banned' && 'error') ||
  //           'warning'
  //         }
  //         sx={{ position: 'absolute', top: 24, right: 24 }}
  //       >
  //         {values.status}
  //       </Label>
  //     )}

  //     {/* <Box sx={{ mb: 5 }}>
  //       <RHFUploadAvatar
  //         name="avatarUrl"
  //         maxSize={3145728}
  //         onDrop={handleDrop}
  //         helperText={
  //           <Typography
  //             variant="caption"
  //             sx={{
  //               mt: 3,
  //               mx: 'auto',
  //               display: 'block',
  //               textAlign: 'center',
  //               color: 'text.disabled',
  //             }}
  //           >
  //             Cho phép *.jpeg, *.jpg, *.png, *.gif
  //             <br /> dung lượng tối đa {fData(3145728)}
  //           </Typography>
  //         }
  //       />
  //     </Box> */}

  //     {currentUser && (
  //       <FormControlLabel
  //         labelPlacement="start"
  //         control={
  //           <Controller
  //             name="status"
  //             control={control}
  //             render={({ field }) => (
  //               <Switch
  //                 {...field}
  //                 checked={field.value !== 'active'}
  //                 onChange={(event) =>
  //                   field.onChange(event.target.checked ? 'banned' : 'active')
  //                 }
  //               />
  //             )}
  //           />
  //         }
  //         label={
  //           <>
  //             <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
  //               Khóa tài khoản
  //             </Typography>
  //             <Typography variant="body2" sx={{ color: 'text.secondary' }}>
  //               Vô hiệu hóa tài khoản người dùng
  //             </Typography>
  //           </>
  //         }
  //         sx={{ mx: 0, mb: 3, width: 1, justifyContent: 'space-between' }}
  //       />
  //     )}

  //     <RHFSwitch
  //       name="isVerified"
  //       labelPlacement="start"
  //       label={
  //         <>
  //           <Typography variant="subtitle2" sx={{ mb: 0.5 }} />
  //           Xác thực email
  //           <Typography variant="body2" sx={{ color: 'text.secondary' }} />
  //           Tắt tính năng này sẽ tự động gửi email xác thực cho người dùng
  //         </>
  //       }
  //       sx={{ mx: 0, width: 1, justifyContent: 'space-between' }}
  //     />
  //   </Card>
  // </Grid>;
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            {typeUser === 'user' && renderUserFields}
            {typeUser === 'doctor' && renderDoctorFields}
            {typeUser === 'employee' && renderEmployeeFields}
            {typeUser === 'patient' && renderPatientFields}
            <Box
              sx={{
                fontSize: '12px',
                fontWeight: '400',
                fontStyle: 'italic',
                marginTop: '10px',
                marginLeft: '10px',
              }}
            >
              *Vui Lòng Cam Kết Thông Tin Hoàn Toàn Chính Xác!
            </Box>
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
