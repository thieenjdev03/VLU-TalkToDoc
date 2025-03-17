import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useUpdatePharmacy } from 'src/api/pharmacy'; // Updated to use specialty API

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { IPharmacyItem } from 'src/types/pharmacy'; // Updated type

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentPharmacy?: IPharmacyItem; // Updated type
};

export default function PharmacyQuickEditForm({ currentPharmacy, open, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { updatePharmacy } = useUpdatePharmacy(); // Ensure the correct function is used for updating specialties

  // 🛠 Schema validation cho chuyên khoa
  const NewPharmacySchema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string().required('Tên chuyên khoa không được để trống'),
        description: Yup.string().required('Mô tả không được để trống'),
        status: Yup.string().required('Trạng thái không được để trống'),
      }),
    []
  );

  // 🛠 Default values cho chuyên khoa
  const defaultValues = useMemo(
    () => ({
      _id: currentPharmacy?._id || '',
      name: currentPharmacy?.name || '',
      description: currentPharmacy?.description || '',
      status: currentPharmacy?.status || 'active',
    }),
    [currentPharmacy]
  );

  const methods = useForm({
    resolver: yupResolver(NewPharmacySchema) as Resolver<any>,
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = methods;
  console.log(errors);
  const onSubmit = handleSubmit(async (data) => {
    try {
      await updatePharmacy({ id: data._id, data });
      reset();
      onClose();
      enqueueSnackbar('Cập nhật thành công!');
      window.location.reload();
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
              <Grid item xs={12} sm={6}>
                <RHFTextField name="name" label="Tên chuyên khoa" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="description" label="Mô tả" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="status" label="Trạng thái" />
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
