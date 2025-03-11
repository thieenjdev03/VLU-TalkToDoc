import * as Yup from 'yup';
import { useMemo } from 'react';
import { useForm, Resolver } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useUpdateDoctor } from 'src/api/user';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField } from 'src/components/hook-form';

import { IUserItem } from 'src/types/user';

// ----------------------------------------------------------------------

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentUser?: IUserItem;
  typeUser: 'doctor' | 'patient' | 'employee';
};

export default function UserQuickEditForm({ currentUser, open, onClose, typeUser }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { updateDoctor } = useUpdateDoctor();

  // 🛠 Xác định Schema Yup theo typeUser
  const NewUserSchema = useMemo(() => {
    switch (typeUser) {
      case 'doctor':
        return Yup.object().shape({
          fullName: Yup.string().required('Name is required'),
          email: Yup.string().required('Email is required').email('Invalid email address'),
          phoneNumber: Yup.string().required('Phone number is required'),
          specialty: Yup.array().min(1, 'At least one specialty is required'),
          hospitalId: Yup.string().required('Hospital is required'),
          rank: Yup.string().required('Rank is required'),
          experienceYears: Yup.number().required('Experience is required'),
          licenseNo: Yup.string().required('License No is required'),
        });
      case 'patient':
        return Yup.object().shape({
          fullName: Yup.string().required('Name is required'),
          email: Yup.string().email('Invalid email address'),
          phoneNumber: Yup.string().required('Phone number is required'),
          address: Yup.string().required('Address is required'),
          birthDate: Yup.string().required('Birth date is required'),
          gender: Yup.string().required('Gender is required'),
        });
      case 'employee':
        return Yup.object().shape({
          fullName: Yup.string().required('Name is required'),
          email: Yup.string().required('Email is required').email('Invalid email address'),
          phoneNumber: Yup.string().required('Phone number is required'),
          role: Yup.string().required('Role is required'),
          hospitalId: Yup.string().required('Hospital is required'),
        });
      default:
        return Yup.object().shape({});
    }
  }, [typeUser]);

  // 🛠 Default values dựa trên typeUser
  const defaultValues = useMemo(() => {
    switch (typeUser) {
      case 'doctor':
        return {
          _id: currentUser?._id || '',
          fullName: currentUser?.fullName || '',
          email: currentUser?.email || '',
          phoneNumber: currentUser?.phoneNumber || '',
          specialtyIds: currentUser?.specialty || [],
          hospitalId: currentUser?.hospitalId || '',
          rank: currentUser?.rank || '',
          experienceYears: currentUser?.experienceYears || 0,
          licenseNo: currentUser?.licenseNo || '',
        };
      case 'patient':
        return {
          _id: currentUser?._id || '',
          fullName: currentUser?.fullName || '',
          email: currentUser?.email || '',
          phoneNumber: currentUser?.phoneNumber || '',
          address: currentUser?.address || '',
        };
      case 'employee':
        return {
          _id: currentUser?._id || '',
          fullName: currentUser?.fullName || '',
          email: currentUser?.email || '',
          phoneNumber: currentUser?.phoneNumber || '',
          role: currentUser?.role || '',
          hospitalId: currentUser?.hospitalId || '',
        };
      default:
        return {};
    }
  }, [currentUser, typeUser]);

  const methods = useForm({
    resolver: yupResolver(NewUserSchema) as Resolver<any>,
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const onSubmit = handleSubmit(async (data) => {
    try {
      await new Promise((resolve) => setTimeout(resolve, 500));
      await updateDoctor({ id: data?._id || '', data });
      reset();
      onClose();
      enqueueSnackbar('Update success!');
      console.info('DATA', data);
    } catch (error) {
      console.error(error);
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Cập nhật thông tin người dùng</DialogTitle>

        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <RHFTextField name="fullName" label="Full Name" />
            <RHFTextField name="email" label="Email Address" />
            <RHFTextField name="phoneNumber" label="Phone Number" />

            {typeUser === 'doctor' && (
              <>
                <RHFTextField name="specialty" label="Specialty IDs" />
                <RHFTextField name="hospitalId" label="Hospital ID" />
                <RHFTextField name="rank" label="Rank" />
                <RHFTextField name="experienceYears" label="Experience Years" />
                <RHFTextField name="licenseNo" label="License No" />
              </>
            )}

            {typeUser === 'patient' && (
              <>
                <RHFTextField name="address" label="Address" />
                <RHFTextField name="birthDate" label="Birth Date" />
                <RHFTextField name="gender" label="Gender" />
              </>
            )}

            {typeUser === 'employee' && (
              <>
                <RHFTextField name="role" label="Role" />
                <RHFTextField name="hospitalId" label="Hospital ID" />
              </>
            )}
          </Box>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={isSubmitting}>
            Update
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  );
}
