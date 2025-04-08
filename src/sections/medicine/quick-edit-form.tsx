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
import InputAdornment from '@mui/material/InputAdornment';

import { useUpdateMedicine } from 'src/api/medicine'; // Updated to use provider_medicine API

import Label from 'src/components/label'; // Updated to use Medicine API

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { IMedicineItem } from 'src/types/medicine'; // Updated type

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentMedicine?: IMedicineItem; // Updated type
};
export default function MedicineQuickEditForm({ currentMedicine, open, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { trigger: updateMedicine } = useUpdateMedicine();
  const [render, setRender] = useState(false);

  const NewMedicineSchema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string().required('Tên thuốc không được để trống'),
        description: Yup.string().required('Mô tả không được để trống'),
        price: Yup.number().required('Giá không được để trống hoặc sai định dạng'),
        isActive: Yup.boolean(),
      }),
    []
  );

  const defaultValues = useMemo(
    () => ({
      _id: currentMedicine?._id || '',
      id: currentMedicine?.id || '',
      name: currentMedicine?.name || '',
      description: currentMedicine?.description || '',
      price: currentMedicine?.price || '',
      isActive: currentMedicine?.isActive || false,
    }),
    [currentMedicine]
  );

  const methods = useForm({
    resolver: yupResolver(NewMedicineSchema) as Resolver<any>,
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
    control,
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateMedicine({ id: data._id, data });
      reset();
      onClose();
      enqueueSnackbar('Cập nhật thành công!');
      setRender(!render);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Cập nhật thất bại', { variant: 'error' });
    }
  });

  const formatNumber = (value: number | string) => {
    if (!value) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  };

  const parseNumber = (value: string) => value.replace(/,/g, '');

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Cập nhật thông tin thuốc</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <RHFTextField disabled name="id" label="Mã Thuốc" />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField name="name" label="Tên Thuốc" />
              </Grid>
              <Grid item xs={12}>
                <Controller
                  name="price"
                  control={control}
                  render={({ field, fieldState: { error } }) => (
                    <RHFTextField
                      name="price"
                      label="Giá Bán"
                      value={formatNumber(field.value)}
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
