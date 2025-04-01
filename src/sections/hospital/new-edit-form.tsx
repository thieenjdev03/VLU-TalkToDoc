import * as Yup from 'yup';
import { useMemo } from 'react';
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
  currentHospital?: any;
};

type FormValuesProps = {
  name: string;
  address: string;
  phoneNumber: string;
  city: string;
  isActive: boolean;
  isPublic: boolean;
};

export default function HospitalNewEditForm({ currentHospital }: Props) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();
  const { createHospital } = useCreateHospital();
  const { updateHospital } = useUpdateHospital();
  const HospitalSchema = Yup.object().shape({
    name: Yup.string().required('Tên Bệnh Viện không được để trống'),
    address: Yup.string().required('Địa chỉ không được để trống'),
    phoneNumber: Yup.string().required('Số điện thoại không được để trống'),
    isActive: Yup.boolean(),
    isPublic: Yup.boolean(),
  }) as Yup.ObjectSchema<FormValuesProps>;

  const defaultValues = useMemo(
    () => ({
      name: currentHospital?.name || '',
      address: currentHospital?.address || '',
      phoneNumber: currentHospital?.phoneNumber || '',
      isPublic: currentHospital?.isPublic || false,
      isActive: currentHospital?.isActive || true,
    }),
    [currentHospital]
  );
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(HospitalSchema) as any,
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
      if (currentHospital) {
        await updateHospital({ _id: currentHospital._id, data });
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
                {!currentHospital ? 'Tạo Bệnh Viện' : 'Lưu thay đổi'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
