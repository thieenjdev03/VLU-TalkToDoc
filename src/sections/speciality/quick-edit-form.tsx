import * as Yup from 'yup';
import { useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Resolver, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useUpdateSpecialty } from 'src/api/specialty';

import Label from 'src/components/label'; // Updated to use specialty API

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { ISpecialtyItem } from 'src/types/specialties'; // Updated type

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentSpecialty?: ISpecialtyItem; // Updated type
};

export default function SpecialtyQuickEditForm({ currentSpecialty, open, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { updateSpecialty } = useUpdateSpecialty(); // Ensure the correct function is used for updating specialties
  const [render, setRender] = useState(false);
  // 🛠 Schema validation cho chuyên khoa
  const NewSpecialtySchema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string().required('Tên chuyên khoa không được để trống'),
        description: Yup.string().required('Mô tả không được để trống'),
        status: Yup.string().required('Kích hoạt không được để trống'),
        isActive: Yup.boolean(),
      }),
    []
  );

  // 🛠 Default values cho chuyên khoa
  const defaultValues = useMemo(
    () => ({
      // _id: currentSpecialty?._id || '',
      name: currentSpecialty?.name || '',
      description: currentSpecialty?.description || '',
      status: currentSpecialty?.status || 'isActive',
      isActive: currentSpecialty?.isActive || false,
    }),
    [currentSpecialty]
  );

  const methods = useForm({
    resolver: yupResolver(NewSpecialtySchema) as Resolver<any>,
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
    control,
  } = methods;
  console.log(errors);
  const onSubmit = handleSubmit(async (data) => {
    try {
      console.log('Data:', data);
      const formattedData = {
        name: data.name,
        description: data.description,
        status: data.status,
        isActive: data.isActive,
      };

      await updateSpecialty({ id: data._id, data });
      reset();
      onClose();
      enqueueSnackbar('Cập nhật thành công!');
      // window.location.reload();
      setRender(!render);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Cập nhật thất bại', { variant: 'error' });
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Cập nhật thông tin chuyên khoa</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <RHFTextField disabled name="id" label="Mã Chuyên Khoa" />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField name="name" label="Tên chuyên khoa" />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField name="description" label="Mô tả" />
              </Grid>
              <Grid item xs={12}>
                <Label>Kích hoạt</Label>
                <Controller
                  name="isActive"
                  control={control}
                  render={({ field }) => (
                    <Checkbox
                      {...field}
                      checked={field.value}
                      onChange={(e) => field.onChange(e.target.checked)}
                    />
                  )}
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Huỷ
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Cập nhật
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
