import * as Yup from 'yup';
import { useForm, Resolver } from 'react-hook-form';
import { useMemo, useState, useEffect } from 'react';
import { yupResolver } from '@hookform/resolvers/yup';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';

import { useUpdateUser } from 'src/api/user';
import { useGetSpecialties } from 'src/api/specialty';

import { useSnackbar } from 'src/components/snackbar';
import FormProvider, { RHFTextField, RHFAutocomplete } from 'src/components/hook-form';

import { IUserItem } from 'src/types/user';
import { ISpecialtyItem } from 'src/types/specialties';

type Props = {
  open: boolean;
  onClose: VoidFunction;
  currentUser?: IUserItem;
  typeUser: 'doctor' | 'patient' | 'employee' | 'user';
};

export default function UserQuickEditForm({ currentUser, open, onClose, typeUser }: Props) {
  const { enqueueSnackbar } = useSnackbar();
  const { updateUser } = useUpdateUser({ typeUser });

  const { specialties } = useGetSpecialties();
  const [specialtyList, setSpecialtyList] = useState<ISpecialtyItem[]>([]);
  useEffect(() => {
    if (specialties.length) {
      setSpecialtyList(specialties);
    }
  }, [specialties]);
  console.log('specialtyList check', specialtyList);
  // 🛠 Schema validation cho từng loại user
  const NewUserSchema = useMemo(() => {
    switch (typeUser) {
      case 'doctor':
        return Yup.object().shape({
          fullName: Yup.string().required('Họ và Tên không được để trống'),
          email: Yup.string().required('Email không được để trống').email('Email không hợp lệ'),
          phoneNumber: Yup.string().required('Số điện thoại không được để trống'),
          specialty: Yup.array().min(1, 'Chọn ít nhất một chuyên khoa'),
          hospitalId: Yup.string().required('Bệnh viện không được để trống'),
          rank: Yup.string().required('Cấp bậc không được để trống'),
          experienceYears: Yup.number().required('Số năm kinh nghiệm không được để trống'),
          licenseNo: Yup.string().required('Mã giấy phép không được để trống'),
        });
      case 'patient':
        return Yup.object().shape({
          fullName: Yup.string().required('Họ và Tên không được để trống'),
          email: Yup.string().email('Email không hợp lệ'),
          phoneNumber: Yup.string().required('Số điện thoại không được để trống'),
          address: Yup.string().required('Địa chỉ không được để trống'),
          birthDate: Yup.string().required('Ngày sinh không được để trống'),
          gender: Yup.string().required('Giới tính không được để trống'),
        });
      case 'employee':
        return Yup.object().shape({
          fullName: Yup.string().required('Họ và Tên không được để trống'),
          email: Yup.string().required('Email không được để trống').email('Email không hợp lệ'),
          phoneNumber: Yup.string().required('Số điện thoại không được để trống'),
          role: Yup.string().required('Vai trò không được để trống'),
          hospitalId: Yup.string().required('Bệnh viện không được để trống'),
          department: Yup.string().required('Bộ phận không được để trống'),
        });
      default:
        return Yup.object().shape({});
    }
  }, [typeUser]);

  // 🛠 Default values theo typeUser
  const defaultValues = useMemo(
    () => ({
      _id: currentUser?._id || '',
      fullName: currentUser?.fullName || '',
      email: currentUser?.email || '',
      phoneNumber: currentUser?.phoneNumber || '',
      ...(typeUser === 'doctor' && {
        specialty: currentUser?.specialty || [],
        hospitalId: currentUser?.hospitalId || '',
        rank: currentUser?.rank || '',
        experienceYears: currentUser?.experienceYears || 0,
        licenseNo: currentUser?.licenseNo || '',
      }),
      ...(typeUser === 'patient' && {
        address: currentUser?.address || '',
        birthDate: currentUser?.birthDate || '',
        gender: currentUser?.gender || '',
      }),
      ...(typeUser === 'employee' && {
        role: currentUser?.role || '',
        hospitalId: currentUser?.hospitalId || '',
        department: currentUser?.department || '',
        specialty: currentUser?.specialty,
        position: currentUser?.position || '',
      }),
    }),
    [currentUser, typeUser]
  );
  const methods = useForm({
    resolver: yupResolver(NewUserSchema) as Resolver<any>,
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
  } = methods;
  console.log(errors);
  const onSubmit = handleSubmit(async (data) => {
    try {
      let formattedData;
      if (typeUser === 'doctor') {
        formattedData = {
          ...data,
          specialty: Array.isArray(data.specialty)
            ? data.specialty.map((item: any) => (typeof item === 'object' ? item.value : item))
            : [],
        };
      } else if (typeUser === 'patient') {
        formattedData = {
          ...data,
        };
      } else if (typeUser === 'employee') {
        formattedData = {
          ...data,
          specialty: Array.isArray(data.specialty)
            ? data.specialty.map((item: any) => (typeof item === 'object' ? item.value : item))
            : [],
        };
      }
      await updateUser({ id: formattedData?._id || '', data: formattedData });
      reset();
      onClose();
      enqueueSnackbar('Cập nhật thành công!');
      // window.location.reload();
    } catch (error) {
      console.error(error);
      enqueueSnackbar('Cập nhật thất bại', { variant: 'error' });
    }
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle>Cập nhật thông tin người dùng</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'grid', gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="fullName" label="Họ và Tên" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="email" label="Địa chỉ Email" />
              </Grid>
              <Grid item xs={12} sm={6}>
                <RHFTextField name="phoneNumber" label="Số điện thoại" />
              </Grid>
              {typeUser === 'doctor' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <RHFAutocomplete
                      name="specialty"
                      label="Chuyên khoa"
                      multiple
                      options={specialtyList.map((item) => ({
                        value: item._id,
                        label: item.name,
                      }))}
                      getOptionLabel={(option) =>
                        typeof option === 'string' ? option : option.label
                      }
                      isOptionEqualToValue={(option, value: any) =>
                        typeof option === 'string' ? option === value : option.value === value
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="hospitalId" label="Bệnh viện" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="rank" label="Cấp bậc" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="experienceYears" label="Số năm kinh nghiệm" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="licenseNo" label="Mã giấy phép" />
                  </Grid>
                </>
              )}

              {typeUser === 'patient' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="address" label="Địa chỉ" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="birthDate" label="Ngày sinh" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFAutocomplete
                      name="gender"
                      label="Giới tính"
                      options={[
                        { value: 'male', label: 'Nam' },
                        { value: 'female', label: 'Nữ' },
                        { value: 'other', label: 'Khác' },
                      ]}
                      getOptionLabel={(option) =>
                        typeof option === 'string' ? option : option.label
                      }
                      isOptionEqualToValue={(option, value: any) =>
                        typeof option === 'string' ? option === value : option.value === value
                      }
                      onChange={(event, newValue: any) =>
                        setValue('gender', newValue.value, { shouldValidate: true })
                      }
                    />
                  </Grid>
                </>
              )}

              {typeUser === 'employee' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="position" label="Vị trí" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFAutocomplete
                      name="specialty"
                      label="Chuyên khoa"
                      multiple
                      options={specialtyList.map((item) => ({
                        value: item._id,
                        label: item.name,
                      }))}
                      getOptionLabel={(option) =>
                        typeof option === 'string' ? option : option.label
                      }
                      isOptionEqualToValue={(option, value: any) =>
                        typeof option === 'string' ? option === value : option.value === value
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="department" label="Bộ Phận" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="hospitalId" label="Bệnh viện" />
                  </Grid>
                </>
              )}
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
