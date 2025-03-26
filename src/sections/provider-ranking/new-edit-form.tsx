import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { useCreateRanking } from 'src/api/ranking';

import { useSnackbar } from 'src/components/snackbar';
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
// ----------------------------------------------------------------------

type Props = {
  currentRanking?: any;
};

type FormValuesProps = {
  name: string;
  description?: string;
  isActive: boolean;
  base_price?: number;
};

export default function RankingNewEditForm({ currentRanking }: Props) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();
  const { createRanking } = useCreateRanking();
  const RankingSchema = Yup.object().shape({
    name: Yup.string().required('Tên Cấp Bậc không được để trống'),
    description: Yup.string().optional(),
    isActive: Yup.boolean(),
  }) as Yup.ObjectSchema<FormValuesProps>;

  const defaultValues = useMemo(
    () => ({
      name: currentRanking?.name || '',
      description: currentRanking?.description || '',
      isActive: currentRanking?.isActive || true,
    }),
    [currentRanking]
  );
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(RankingSchema) as any,
    defaultValues,
  });
  const {
    reset,
    control,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;
  console.log('Form Errors:', errors);

  // Format number with thousands separator
  const formatNumber = (value: number | string) => {
    if (!value) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  // Parse formatted number back to number
  const parseNumber = (value: string) => value.replace(/,/g, '');

  const onSubmit = handleSubmit(async (data) => {
    try {
      await createRanking({ data });

      reset();
      enqueueSnackbar(currentRanking ? 'Cập nhật Cấp Bậc thành công!' : 'Tạo Cấp Bậc thành công!');
      router.push(paths.dashboard.ranking_doctor.list);
    } catch (err) {
      console.error(err);
    }
  });
  return (
    <>
      <CustomBreadcrumbs
        heading="Tạo cấp bậc mới"
        links={[
          {
            name: 'Quản Lý Cấp Bậc',
            href: paths.dashboard.specialties.root,
          },
          { name: 'Tạo Mới' },
        ]}
        sx={{
          mb: { xs: 3, md: 5 },
        }}
      />
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
                <RHFTextField name="name" label="Tên Cấp Bậc" />
                <Grid item xs={12}>
                  <Controller
                    name="base_price"
                    control={control}
                    render={({ field, fieldState: { error } }) => (
                      <RHFTextField
                        name="base_price"
                        label="Lương / Giờ"
                        value={formatNumber(field.value as any)}
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
                </Grid>
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
              <RHFTextField name="description" label="Mô tả" multiline rows={4} />
              <Stack alignItems="flex-end" sx={{ mt: 3 }}>
                <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                  {!currentRanking ? 'Tạo Cấp Bậc' : 'Lưu thay đổi'}
                </LoadingButton>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </FormProvider>
    </>
  );
}
