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

import { useCreateSpecialty } from 'src/api/specialty';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';
// ----------------------------------------------------------------------

type Props = {
  currentSpecialty?: any;
};

type FormValuesProps = {
  name: string;
  description?: string;
  isActive: boolean;
};

export default function SpecialtyNewEditForm({ currentSpecialty }: Props) {
  const router = useRouter();

  const { enqueueSnackbar } = useSnackbar();
  const { createSpecialty } = useCreateSpecialty();
  const SpecialtySchema = Yup.object().shape({
    name: Yup.string().required('Tên chuyên khoa không được để trống'),
    description: Yup.string().optional(),
    isActive: Yup.boolean(),
  }) as Yup.ObjectSchema<FormValuesProps>;

  const defaultValues = useMemo(
    () => ({
      name: currentSpecialty?.name || '',
      description: currentSpecialty?.description || '',
      isActive: currentSpecialty?.isActive || true,
    }),
    [currentSpecialty]
  );
  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(SpecialtySchema) as any,
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
      await createSpecialty({ data });

      reset();
      enqueueSnackbar(
        currentSpecialty ? 'Cập nhật chuyên khoa thành công!' : 'Tạo chuyên khoa thành công!'
      );
      router.push(paths.dashboard.specialties.list);
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
                xs: 'repeat(2, 2fr)',
                sm: 'repeat(2, 2fr)',
              }}
              sx={{ marginBottom: 2 }}
            >
              <RHFTextField name="name" label="Tên chuyên khoa" />
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
                label="Trạng Thái"
              />
            </Box>
            <RHFTextField name="description" label="Mô tả" multiline rows={4} />
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
                {!currentSpecialty ? 'Tạo chuyên khoa' : 'Lưu thay đổi'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </FormProvider>
  );
}
