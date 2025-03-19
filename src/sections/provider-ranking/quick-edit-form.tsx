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

import { useUpdateRanking } from 'src/api/ranking'; // Updated to use provider_ranking API

import Label from 'src/components/label'; // Updated to use Ranking API

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { IRankingItem } from 'src/types/provider-ranking'; // Updated type

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentRanking?: IRankingItem; // Updated type
};

export default function RankingQuickEditForm({ currentRanking, open, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { updateRanking } = useUpdateRanking(); // Ensure the correct function is used for updating provider_ranking
  const [render, setRender] = useState(false);
  // 🛠 Schema validation cho chuyên khoa
  const NewRankingSchema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string().required('Tên chuyên khoa không được để trống'),
        description: Yup.string().required('Mô tả không được để trống'),
        base_price: Yup.number().required('Lương không được để trống hoặc là Chữ'),
        isActive: Yup.boolean(),
      }),
    []
  );

  // 🛠 Default values cho chuyên khoa
  const defaultValues = useMemo(
    () => ({
      id: currentRanking?.id || '',
      name: currentRanking?.name || '',
      description: currentRanking?.description || '',
      base_price: currentRanking?.base_price || 'base_price',
      isActive: currentRanking?.isActive || false,
    }),
    [currentRanking]
  );

  const methods = useForm({
    resolver: yupResolver(NewRankingSchema) as Resolver<any>,
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
      await updateRanking({ id: data.id, data });
      reset();
      onClose();
      enqueueSnackbar('Cập nhật thành công!');
      window.location.reload();
      setRender(!render);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Cập nhật thất bại', { variant: 'error' });
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Cập nhật thông tin Cấp Bậc</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <RHFTextField disabled name="id" label="ID Cấp Bậc" />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField name="name" label="Tên Cấp Bậc" />
              </Grid>
              <Grid item xs={12}>
                <RHFTextField name="base_price" label="Lương / Giờ" />
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
