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
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useCreateHospital, useUpdateHospital } from 'src/api/hospital';

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
  isActive: boolean;
  isPublic: boolean;
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
  const { createHospital } = useCreateHospital();
  const { updateHospital } = useUpdateHospital();
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
    isActive: Yup.boolean(),
    isPublic: Yup.boolean(),
  }) as Yup.ObjectSchema<FormValuesProps>;

  const defaultValues = useMemo(
    () => ({
      name: currentPharmacy?.name || '',
      address: currentPharmacy?.address || '',
      phoneNumber: currentPharmacy?.phoneNumber || '',
      isPublic: currentPharmacy?.is24Hours || false,
      isActive: currentPharmacy?.isActive || true,
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

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentPharmacy) {
        await updateHospital({ _id: currentPharmacy._id, data });
        enqueueSnackbar('Cập nhật Bệnh Viện thành công!');
      } else {
        await createHospital({ data });
        enqueueSnackbar('Tạo Bệnh Viện thành công!');
      }
      reset();
      router.push(paths.dashboard.hospital.list);
    } catch (err) {
      console.error(err);
    }
  });
  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        <Grid xs={12}>
          <Card sx={{ p: 3 }}>
            <Box
              rowGap={3}
              columnGap={2}
              display="grid"
              gridTemplateColumns={{
                xs: 'repeat(1, 1fr)',
                sm: 'repeat(1, 1fr)',
              }}
              sx={{ marginBottom: 2 }}
            >
              <RHFTextField name="name" label="Tên Bệnh Viện" />
              <RHFTextField name="address" label="Địa chỉ" />
              <RHFTextField name="phoneNumber" label="Số điện thoại" />
              <Box sx={{ display: 'flex', flexDirection: 'row' }}>
                <FormControlLabel
                  control={
                    <Controller
                      name="isPublic"
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
                  label="BV Công"
                />
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
