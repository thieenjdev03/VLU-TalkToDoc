import * as Yup from 'yup';
import React, { useMemo, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Controller, FormProvider } from 'react-hook-form';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import { Checkbox } from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import Label from 'src/components/label';

import { IPharmacyItem } from '../../types/hospital';
import { useUpdateHospital } from '../../api/hospital';
import { useSnackbar } from '../../components/snackbar';
import { RHFTextField } from '../../components/hook-form';

// Schema validation
const UpdateHospitalSchema = Yup.object().shape({
  id: Yup.string().required('ID không được để trống'),
  name: Yup.string().required('Tên Bệnh Viện không được để trống'),
  address: Yup.string().required('Địa chỉ không được để trống'),
  phoneNumber: Yup.string().required('Số điện thoại không được để trống'),
  isPublic: Yup.boolean(),
  isActive: Yup.boolean(),
});

// Interface for provinces API response

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentHospital?: IPharmacyItem;
  onSuccess?: VoidFunction;
};

export default function HospitalQuickEditForm({ currentHospital, open, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { updateHospital } = useUpdateHospital();

  // Load danh sách thành phố từ API

  const defaultValues = useMemo(
    () => ({
      id: currentHospital?.id || '',
      name: currentHospital?.name || '',
      address: currentHospital?.address || '',
      phoneNumber: currentHospital?.phoneNumber || '',
      isPublic: currentHospital?.isPublic ?? false, // Ensure boolean value
      isActive: currentHospital?.isActive ?? false, // Ensure boolean value
    }),
    [currentHospital]
  );

  const methods = useForm({
    resolver: yupResolver(UpdateHospitalSchema),
    defaultValues,
  });
  const {
    reset,
    handleSubmit,
    control, // Get control for Controller components
    formState: { isSubmitting, errors },
  } = methods;
  console.log('Form Errors:', errors);
  // Reset form khi currentHospital thay đổi
  useEffect(() => {
    reset(defaultValues);
  }, [currentHospital, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentHospital?._id) {
        await updateHospital({ _id: currentHospital._id, data });

        window.location.reload();
      } else {
        enqueueSnackbar('Hospital ID is missing', { variant: 'error' });
        return;
      }
      reset();
      enqueueSnackbar('Cập nhật bệnh viện thành công!');
      onClose();
    } catch (error) {
      enqueueSnackbar('Failed to update hospital', { variant: 'error' });
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <DialogTitle>Cập nhật thông tin Bệnh Viện</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <RHFTextField disabled name="id" label="ID" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="name" label="Tên Bệnh Viện" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="address" label="Địa chỉ" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="phoneNumber" label="Số điện thoại" />
                </Grid>
                <Grid item xs={12}>
                  <Label>BV Công</Label>
                  <Controller
                    name="isPublic"
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
                <Grid item xs={12}>
                  <Label>Kích Hoạt</Label>
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
            <Button variant="outlined" color="inherit" onClick={onClose}>
              Hủy
            </Button>
            <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
              Lưu
            </LoadingButton>
          </DialogActions>
        </form>
      </FormProvider>
    </Dialog>
  );
}
