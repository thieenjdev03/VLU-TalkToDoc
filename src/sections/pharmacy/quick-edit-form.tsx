import axios from 'axios';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm, FormProvider } from 'react-hook-form';
import React, { useMemo, useState, useEffect } from 'react';

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
import { RHFTextField, RHFAutocomplete } from '../../components/hook-form';
// Schema validation
const UpdatePharmacySchema = Yup.object().shape({
  name: Yup.string().required('Tên Pharmacy không được để trống'),
  address: Yup.string().required('Địa chỉ không được để trống'),
  phone: Yup.string().required('Số điện thoại không được để trống'),
});

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentPharmacy?: IPharmacyItem;
  onSuccess?: VoidFunction; // Add this prop to trigger refetch
};

// Interface for provinces API response
interface IProvince {
  code: number;
  name: string;
  division_type: string;
  codename: string;
  phone_code: number;
}

export default function PharmacyQuickEditForm({
  currentPharmacy,
  open,
  onClose,
  onSuccess,
}: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { updatePharmacy } = useUpdatePharmacy();
  const [cities, setCities] = useState<IProvince[]>([]);
  const [loadingCities, setLoadingCities] = useState<boolean>(false);
  const defaultValues = useMemo(
    () => ({
      name: currentPharmacy?.name || '',
      address: currentPharmacy?.address || '',
      phone: currentPharmacy?.phoneNumber || '',
      city: currentPharmacy?.city || '',
      is24Hours: currentPharmacy?.is24Hours || false,
      status: currentPharmacy?.status || false,
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
    formState: { isSubmitting, errors },
  } = methods;
  console.log(errors);
  useEffect(() => {
    reset(defaultValues);
  }, [currentPharmacy, defaultValues, reset]);

  // Add effect to fetch cities data
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true);
      try {
        const response = await axios.get('https://provinces.open-api.vn/api/');
        console.log('Cities loaded:', response.data); // Debug log to verify data
        setCities(response.data);
      } catch (error) {
        console.error('Failed to fetch cities:', error);
        enqueueSnackbar('Failed to load cities data', { variant: 'error' });
      } finally {
        setLoadingCities(false);
      }
    };

    fetchCities();
  }, [enqueueSnackbar]);

  const onSubmit = handleSubmit(async (data) => {
    try {
      if (currentPharmacy?._id) {
        await updatePharmacy({ _id: currentPharmacy._id, data });
      } else {
        enqueueSnackbar('Pharmacy ID is missing', { variant: 'error' });
        return;
      }
      reset();
      enqueueSnackbar('Cập nhật nhà thuốc thành công!');

      // Call onSuccess to trigger refetching in parent component
      if (onSuccess) {
        onSuccess();
      }

      onClose();
    } catch (error) {
      enqueueSnackbar('Failed to update pharmacy', { variant: 'error' });
      console.error(error);
    }
  });

  // Simplify the options structure
  const cityOptions = cities.map((city) => city.name);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <FormProvider {...methods}>
        <form onSubmit={onSubmit}>
          <DialogTitle>Cập nhật thông tin Pharmacy</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
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
                  {loadingCities ? (
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
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Label>Hoạt động 24/7</Label>
                  <Checkbox
                    value={defaultValues.is24Hours}
                    checked={defaultValues.is24Hours}
                    name="is24Hours"
                  />
                  <Label>Trạng thái</Label>
                  <Checkbox name="status" />
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
