import axios from 'axios';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import React, { useMemo, useState, useEffect } from 'react';
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

import { IPharmacyItem } from '../../types/pharmacy';
import { useUpdatePharmacy } from '../../api/pharmacy';
import { useSnackbar } from '../../components/snackbar';
import { RHFTextField } from '../../components/hook-form';

// Schema validation
const UpdatePharmacySchema = Yup.object().shape({
  name: Yup.string().required('Tên Pharmacy không được để trống'),
  address: Yup.string().required('Địa chỉ không được để trống'),
  phone: Yup.string().required('Số điện thoại không được để trống'),
  city: Yup.string().required('Thành phố không được để trống'),
  is24Hours: Yup.boolean(),
  active: Yup.boolean(),
});

// Interface for provinces API response
interface IProvince {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  phone_code: number;
}

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentPharmacy?: IPharmacyItem;
  onSuccess?: VoidFunction;
};

export default function PharmacyQuickEditForm({ currentPharmacy, open, onClose }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { updatePharmacy } = useUpdatePharmacy();
  const [cities, setCities] = useState<IProvince[]>([]);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);

  // Load danh sách thành phố từ API
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const response = await axios.get('https://provinces.open-api.vn/api/');
        setCities(response.data);
      } catch (error) {
        enqueueSnackbar('Failed to load cities data', { variant: 'error' });
      } finally {
        setLoadingCities(false);
      }
    };
    fetchCities();
  }, [enqueueSnackbar]);

  const cityOptions = cities.map((city) => city.name);

  const defaultValues = useMemo(
    () => ({
      id: currentPharmacy?.id || '',
      name: currentPharmacy?.name || '',
      address: currentPharmacy?.address || '',
      phone: currentPharmacy?.phoneNumber || '',
      city: currentPharmacy?.city || '',
      is24Hours: currentPharmacy?.is24Hours ?? false, // Ensure boolean value
      active: currentPharmacy?.isActive ?? false, // Ensure boolean value
    }),
    [currentPharmacy]
  );

  const methods = useForm({
    resolver: yupResolver(UpdatePharmacySchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    control, // Get control for Controller components
    formState: { isSubmitting },
  } = methods;

  // Reset form khi currentPharmacy thay đổi
  useEffect(() => {
    reset(defaultValues);
  }, [currentPharmacy, defaultValues, reset]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentPharmacy?._id) {
        await updatePharmacy({ _id: currentPharmacy._id, data });

        window.location.reload();
      } else {
        enqueueSnackbar('Pharmacy ID is missing', { variant: 'error' });
        return;
      }
      reset();
      enqueueSnackbar('Cập nhật nhà thuốc thành công!');
      onClose();
    } catch (error) {
      enqueueSnackbar('Failed to update pharmacy', { variant: 'error' });
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <DialogTitle>Cập nhật thông tin Pharmacy</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <RHFTextField disabled name="id" label="ID" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="name" label="Tên Pharmacy" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="address" label="Địa chỉ" />
                </Grid>
                <Grid item xs={12}>
                  <RHFTextField name="phone" label="Số điện thoại" />
                </Grid>
                <Grid item xs={12}>
                  <Grid item xs={12}>
                    <RHFTextField name="city" label="Thành Phố/Tỉnh" />
                  </Grid>
                  {/* {loadingCities ? (
                    <RHFTextField
                      name="city"
                      label="Thành Phố/Tỉnh"
                      disabled
                      placeholder="Loading cities..."
                    />
                  ) : (
                    <RHFAutocomplete
                      name="city"
                      label="Thành Phố/Tỉnh"
                      placeholder="Chọn thành Phố/Tỉnh"
                      options={cityOptions}
                      isOptionEqualToValue={(option, value) => option === value}
                    />
                  )} */}
                </Grid>
                <Grid item xs={12}>
                  <Label>Hoạt động 24/7</Label>
                  <Controller
                    name="is24Hours"
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
                  <Label>Kích hoạt</Label>
                  <Controller
                    name="active"
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
