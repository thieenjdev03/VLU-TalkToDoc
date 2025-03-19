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
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useCreatePharmacy, useUpdatePharmacy } from 'src/api/pharmacy';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
// ----------------------------------------------------------------------

type Props = {
  currentPharmacy?: any;
};

type FormValuesProps = {
  name: string;
  address: string;
  phoneNumber: string;
  city: string;
  is24Hours: boolean;
  status: boolean;
};

// Interface for provinces API response
interface IProvince {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  phone_code: number;
}
export default function PharmacyNewEditForm({ currentPharmacy }: Props) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();
  const { createPharmacy } = useCreatePharmacy();
  const { updatePharmacy } = useUpdatePharmacy();
  const [cities, setCities] = useState<IProvince[]>([]);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);

  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const response = await axios.get('https://provinces.open-api.vn/api/');
        console.log('Cities loaded:', response.data); // Debug log to verify data
        setCities(response.data);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
        enqueueSnackbar('Failed to load cities data', { variant: 'error' });
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [enqueueSnackbar]);

  const PharmacySchema = Yup.object().shape({
    name: Yup.string().required('Tên nhà thuốc không được để trống'),
    address: Yup.string().required('Địa chỉ không được để trống'),
    phoneNumber: Yup.string().required('Số điện thoại không được để trống'),
    city: Yup.string().required('Thành phố không được để trống'),
    is24Hours: Yup.boolean(),
    status: Yup.boolean(),
  }) as Yup.ObjectSchema<FormValuesProps>;

  const defaultValues = useMemo(
    () => ({
      name: currentPharmacy?.name || '',
      address: currentPharmacy?.address || '',
      phoneNumber: currentPharmacy?.phoneNumber || '',
      city: currentPharmacy?.city || '',
      is24Hours: currentPharmacy?.is24Hours || false,
      status: currentPharmacy?.status || true,
    }),
    [currentPharmacy]
  );
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(PharmacySchema) as any,
    defaultValues,
  });
  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;
  console.log('Form Errors:', errors);
  const cityOptions = cities.map((city) => city.name);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentPharmacy) {
        await updatePharmacy({ _id: currentPharmacy._id, data });
        enqueueSnackbar('Cập nhật nhà thuốc thành công!');
      } else {
        await createPharmacy({ data });
        enqueueSnackbar('Tạo nhà thuốc thành công!');
      }
      reset();
      router.push(paths.dashboard.pharmacies.list);
    } catch (err) {
      console.error(err);
    }
  });
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <DialogTitle>{currentPharmacy ? 'Chỉnh sửa nhà thuốc' : 'Tạo mới nhà thuốc'}</DialogTitle>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(2, 2fr)',
                sm: 'repeat(2, 2fr)',
              }}
              sx={{ marginBottom: 2 }}
            >
              <RHFTextField name="name" label="Tên nhà thuốc" />
              <RHFTextField name="address" label="Địa chỉ" />
              <RHFTextField name="phoneNumber" label="Số điện thoại" />
              <RHFTextField name="city" label="Thành Phố/Tỉnh" />
              {/* <RHFAutocomplete
                name="city"
                label="Thành Phố/Tỉnh"
                placeholder={`${loadingCities ? '' : 'Chọn thành phố/tỉnh'}`}
                options={cityOptions}
                isOptionEqualToValue={(option, value) => option === value}
              /> */}
              <FormControlLabel
                control={
                  <Controller
                    name="is24Hours"
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
                label="Hoạt động 24/7"
              />
              <FormControlLabel
                control={
                  <Controller
                    name="status"
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
                label="Trạng thái"
              />
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentPharmacy ? 'Tạo nhà thuốc' : 'Lưu thay đổi'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
