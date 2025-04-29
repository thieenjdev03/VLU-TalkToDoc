import * as Yup from 'yup';
import { useMemo, useState } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, Resolver, Controller } from 'react-hook-form';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Checkbox from '@mui/material/Checkbox';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useUpdateSpecialty } from 'src/api/specialty';

import Label from 'src/components/label';
import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFUploadAvatar } from 'src/components/hook-form';

import { ISpecialtyItem } from 'src/types/specialties';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentSpecialty?: ISpecialtyItem;
};

export default function SpecialtyQuickEditForm({ currentSpecialty, open, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { updateSpecialty } = useUpdateSpecialty();
  const [render, setRender] = useState(false);

  const NewSpecialtySchema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string().required('Tên chuyên khoa không được để trống'),
        description: Yup.string().required('Mô tả không được để trống'),
        status: Yup.string().required('Kích hoạt không được để trống'),
        isActive: Yup.boolean(),
        avatarUrl: Yup.string().url('Đường dẫn ảnh không hợp lệ'),
      }),
    []
  );

  const defaultValues = useMemo(
    () => ({
      _id: currentSpecialty?._id || '',
      name: currentSpecialty?.name || '',
      description: currentSpecialty?.description || '',
      status: currentSpecialty?.status || 'isActive',
      isActive: currentSpecialty?.isActive || false,
      avatarUrl: currentSpecialty?.avatar || '',
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
    formState: { isSubmitting },
    control,
    setValue,
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await updateSpecialty({ id: data._id, data });
      reset();
      onClose();
      enqueueSnackbar('Cập nhật thành công!');
      setRender(!render);
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Cập nhật thất bại', { variant: 'error' });
    }
  });

  const handleDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'talktodoc_unsigned');

        const response = await fetch('https://api.cloudinary.com/v1_1/dut4zlbui/image/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await response.json();

        if (data.secure_url) {
          setValue('avatarUrl', data.secure_url, { shouldValidate: true });
          console.log('imageUrl:', data.secure_url);
        } else {
          enqueueSnackbar('Không thể lấy được đường dẫn ảnh từ Cloudinary!', { variant: 'error' });
        }
      } catch (error) {
        console.error('Upload error:', error);
        enqueueSnackbar('Upload ảnh thất bại!', { variant: 'error' });
      }
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Cập nhật thông tin chuyên khoa</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <Grid item xs={12}>
              <RHFUploadAvatar
                name="avatarUrl"
                maxSize={3145728}
                onDrop={handleDrop}
                accept={{ 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] }} // giới hạn định dạng ảnh
                helperText={
                  <Typography
                    variant="caption"
                    sx={{
                      mt: 3,
                      mx: 'auto',
                      display: 'block',
                      textAlign: 'center',
                      color: 'text.disabled',
                    }}
                  >
                    Cho phép *.jpeg, *.jpg, *.png, *.gif <br /> dung lượng tối đa 3MB
                  </Typography>
                }
              />
            </Grid>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <RHFTextField disabled name="_id" label="Mã Chuyên Khoa" />
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
