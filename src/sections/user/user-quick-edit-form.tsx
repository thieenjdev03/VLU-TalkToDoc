import axios from 'axios'
import * as Yup from 'yup'
import moment from 'moment'
import { useMemo, useState, useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Resolver, Controller } from 'react-hook-form'

import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import Switch from '@mui/material/Switch'
import LoadingButton from '@mui/lab/LoadingButton'
import DialogTitle from '@mui/material/DialogTitle'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import InputAdornment from '@mui/material/InputAdornment'
import FormControlLabel from '@mui/material/FormControlLabel'

import { useUpdateUser } from 'src/api/user'
import { useGetSpecialties } from 'src/api/specialty'

import { useSnackbar } from 'src/components/snackbar'
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFUploadAvatar
} from 'src/components/hook-form'

import { IUserItem } from 'src/types/user'
import { IProvince } from 'src/types/hospital'
import { ISpecialtyItem } from 'src/types/specialties'

type Ranking = {
  _id: string
  name: string
}
type Props = {
  open: boolean
  onClose: VoidFunction
  currentUser?: IUserItem
  typeUser: 'doctor' | 'patient' | 'employee' | 'user'
  ranking: { data: Ranking[] }
  hospitalList: any
}

export default function UserQuickEditForm({
  currentUser,
  open,
  onClose,
  typeUser,
  ranking,
  hospitalList
}: Props) {
  const { enqueueSnackbar } = useSnackbar()
  const { updateUser } = useUpdateUser({ typeUser })
  const [cities, setCities] = useState<IProvince[]>([])
  const [loadingCities, setLoadingCities] = useState<boolean>(false)

  // Load danh sách thành phố từ API
  useEffect(() => {
    const fetchCities = async () => {
      setLoadingCities(true)
      try {
        const response = await axios.get('https://provinces.open-api.vn/api/')
        setCities(response.data)
      } catch (error) {
        enqueueSnackbar('Failed to load cities data', { variant: 'error' })
      } finally {
        setLoadingCities(false)
      }
    }
    fetchCities()
  }, [enqueueSnackbar])

  const cityOptions = cities.map(city => city.name)

  const { specialties } = useGetSpecialties({
    query: '',
    page: 1,
    limit: 10,
    sortField: 'updatedAt',
    sortOrder: 'desc'
  })
  const [specialtyList, setSpecialtyList] = useState<ISpecialtyItem[]>([])
  useEffect(() => {
    if (specialties?.data?.length) {
      setSpecialtyList(specialties?.data)
    }
  }, [specialties])
  // 🛠 Schema validation cho từng loại user
  const NewUserSchema = useMemo(() => {
    switch (typeUser) {
      case 'doctor':
        return Yup.object().shape({
          fullName: Yup.string().required('Họ và Tên không được để trống'),
          email: Yup.string()
            .required('Email không được để trống')
            .email('Email không hợp lệ'),
          phoneNumber: Yup.string().required(
            'Số điện thoại không được để trống'
          ),
          experienceYears: Yup.number().required(
            'Số năm kinh nghiệm không được để trống'
          ),
          licenseNo: Yup.string().required('Mã giấy phép không được để trống')
        })
      case 'patient':
        return Yup.object().shape({
          fullName: Yup.string().required('Họ và Tên không được để trống'),
          email: Yup.string().email('Email không hợp lệ'),
          phoneNumber: Yup.string().required(
            'Số điện thoại không được để trống'
          ),
          address: Yup.string().required('Địa chỉ không được để trống'),
          birthDate: Yup.string().required('Ngày sinh không được để trống'),
          gender: Yup.string().required('Giới tính không được để trống')
        })
      case 'employee':
        return Yup.object().shape({
          fullName: Yup.string().required('Họ và Tên không được để trống'),
          email: Yup.string()
            .required('Email không được để trống')
            .email('Email không hợp lệ'),
          phoneNumber: Yup.string().required(
            'Số điện thoại không được để trống'
          ),
          role: Yup.string().required('Vai trò không được để trống'),
          department: Yup.string().required('Bộ phận không được để trống')
        })
      default:
        return Yup.object().shape({})
    }
  }, [typeUser])
  const formatNumber = (value: number | string) => {
    if (!value) return ''
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // Parse formatted number back to number
  const parseNumber = (value: string) => value.replace(/,/g, '')
  const handleDrop = async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      try {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('upload_preset', 'talktodoc_unsigned')

        const response = await fetch(
          'https://api.cloudinary.com/v1_1/dut4zlbui/image/upload',
          {
            method: 'POST',
            body: formData
          }
        )

        const data = await response.json()
        if (data.secure_url) {
          setValue('avatarUrl', data.secure_url, { shouldValidate: true })
        } else {
          enqueueSnackbar('Không thể lấy được đường dẫn ảnh từ Cloudinary!', {
            variant: 'error'
          })
        }
      } catch (error) {
        enqueueSnackbar('Upload ảnh thất bại!', { variant: 'error' })
      }
    }
  }
  // 🛠 Default values theo typeUser
  const defaultValues = useMemo(
    () => ({
      _id: currentUser?._id || '',
      fullName: currentUser?.fullName || '',
      email: currentUser?.email || '',
      isActive: currentUser?.isActive || false,
      phoneNumber: currentUser?.phoneNumber || '',
      avatarUrl: currentUser?.avatarUrl || '',
      ...(typeUser === 'doctor' && {
        specialty: Array.isArray(currentUser?.specialty)
          ? currentUser.specialty.map((s: any) =>
              typeof s === 'object' ? { value: s._id, label: s.name } : s
            )
          : [],
        position: currentUser?.position || '',
        hospital:
          currentUser?.hospital && typeof currentUser.hospital === 'object'
            ? {
                value: currentUser.hospital._id,
                label: currentUser.hospital.name
              }
            : '',
        rank:
          currentUser?.rank && typeof currentUser.rank === 'object'
            ? { value: currentUser.rank._id, label: currentUser.rank.name }
            : '',
        experienceYears: currentUser?.experienceYears || 0,
        licenseNo: currentUser?.licenseNo || '',
        registrationStatus: currentUser?.registrationStatus || 'pending'
      }),
      ...(typeUser === 'patient' && {
        address: currentUser?.address || '',
        birthDate: moment(currentUser?.birthDate).format('L') || '',
        gender: currentUser?.gender || ''
      }),
      ...(typeUser === 'employee' && {
        role: currentUser?.role || '',
        hospital:
          currentUser?.hospital && typeof currentUser.hospital === 'object'
            ? {
                value: currentUser.hospital._id,
                label: currentUser.hospital.name
              }
            : '',
        department: currentUser?.department || '',
        specialty: Array.isArray(currentUser?.specialty)
          ? currentUser.specialty.map((s: any) =>
              typeof s === 'object' ? { value: s._id, label: s.name } : s
            )
          : [],
        position: currentUser?.position || '',
        salary: currentUser?.salary || 0,
        city:
          currentUser?.city && typeof currentUser.city === 'object'
            ? currentUser.city.name
            : currentUser?.city || ''
      })
    }),
    [currentUser, typeUser]
  )
  const methods = useForm({
    resolver: yupResolver(NewUserSchema) as Resolver<any>,
    defaultValues
  })

  const {
    handleSubmit,
    setValue,
    formState: { isSubmitting, errors },
    control
  } = methods
  console.log(errors)
  const onSubmit = handleSubmit(async data => {
    try {
      let formattedData
      if (typeUser === 'doctor') {
        formattedData = {
          ...data,
          rank: data.rank?.value,
          hospital: data.hospital?.value,
          position: data.position || '',
          specialty: Array.isArray(data.specialty)
            ? data.specialty.map((item: any) =>
                typeof item === 'object' ? item.value : item
              )
            : []
        }
      } else if (typeUser === 'patient') {
        formattedData = {
          ...data
        }
      } else if (typeUser === 'employee') {
        formattedData = {
          ...data,
          specialty: Array.isArray(data.specialty)
            ? data.specialty.map((item: any) =>
                typeof item === 'object' ? item.value : item
              )
            : []
        }
      }
      await updateUser({ id: formattedData?._id || '', data: formattedData })
      enqueueSnackbar('Cập nhật thành công!')
    } catch (error) {
      console.error(error)
      enqueueSnackbar('Cập nhật thất bại', { variant: 'error' })
    }
  })

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <FormProvider methods={methods} onSubmit={onSubmit}>
        <DialogTitle sx={{ fontFamily: 'Roboto, sans-serif' }}>
          Cập nhật thông tin người dùng
        </DialogTitle>
        <DialogContent>
          <Box sx={{ gap: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={12}>
                <RHFUploadAvatar
                  name="avatarUrl"
                  onDrop={handleDrop}
                  maxSize={3145728}
                  helperText={
                    <span style={{ fontSize: '12px', color: '#888' }}>
                      Cho phép: *.jpeg, *.jpg, *.png, dung lượng tối đa 3MB
                    </span>
                  }
                />
              </Grid>
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
                      options={specialtyList.map(item => ({
                        value: item._id,
                        label: item.name
                      }))}
                      getOptionLabel={option =>
                        typeof option === 'string' ? option : option.label
                      }
                      isOptionEqualToValue={(option, value: any) =>
                        typeof option === 'string'
                          ? option === value
                          : option.value === value
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFAutocomplete
                      name="hospital"
                      label="Bệnh Viện"
                      multiple={false}
                      options={hospitalList}
                      getOptionLabel={(option: any) =>
                        typeof option === 'string' ? option : option.label
                      }
                      isOptionEqualToValue={(option: any, value: any) =>
                        option?.value === value?.value
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="position" label="Chức Vụ" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFAutocomplete
                      name="rank"
                      label="Cấp Bậc"
                      multiple={false}
                      options={ranking?.data?.map((item: Ranking) => ({
                        value: item._id,
                        label: item.name
                      }))}
                      getOptionLabel={(option: any) =>
                        typeof option === 'string' ? option : option.label
                      }
                      isOptionEqualToValue={(option: any, value: any) =>
                        option?.value === value?.value
                      }
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField
                      name="experienceYears"
                      label="Số năm kinh nghiệm"
                    />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="licenseNo" label="Mã giấy phép" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFAutocomplete
                      name="registrationStatus"
                      label="Trạng thái đăng ký"
                      options={[
                        { value: 'pending', label: 'Chờ xác nhận' },
                        { value: 'approved', label: 'Đã xác nhận' },
                        { value: 'rejected', label: 'Từ chối' },
                        { value: 'updating', label: 'Đang cập nhật' }
                      ]}
                      getOptionLabel={(option: any) => {
                        if (typeof option === 'string') {
                          switch (option) {
                            case 'pending':
                              return 'Chờ xác nhận'
                            case 'approved':
                              return 'Đã xác nhận'
                            case 'rejected':
                              return 'Từ chối'
                            case 'updating':
                              return 'Đang cập nhật'
                            default:
                              return option
                          }
                        }
                        return option.label
                      }}
                      isOptionEqualToValue={(option: any, value: any) =>
                        option?.value === value?.value
                      }
                      onChange={(event, newValue: any) => {
                        setValue('registrationStatus', newValue?.value, {
                          shouldValidate: true
                        })
                      }}
                    />
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
                        { value: 'other', label: 'Khác' }
                      ]}
                      getOptionLabel={(option: any) => {
                        if (typeof option === 'string') {
                          switch (option) {
                            case 'male':
                              return 'Nam'
                            case 'female':
                              return 'Nữ'
                            case 'other':
                              return 'Khác'
                            default:
                              return option
                          }
                        }
                        return option.label
                      }}
                      isOptionEqualToValue={(option, value: any) =>
                        typeof option === 'string'
                          ? option === value
                          : option.value === value
                      }
                      onChange={(event, newValue: any) =>
                        setValue('gender', newValue.value, {
                          shouldValidate: true
                        })
                      }
                    />
                  </Grid>
                </>
              )}

              {typeUser === 'employee' && (
                <>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="position" label="Vai Trò" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <RHFTextField name="department" label="Bộ Phận" />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Controller
                      name="salary"
                      control={control}
                      render={({ field, fieldState: { error } }) => (
                        <RHFTextField
                          name="salary"
                          label="Lương / Tháng"
                          value={formatNumber(field.value)}
                          onChange={e => {
                            const parsedValue = parseNumber(e.target.value)
                            if (!parsedValue || /^\d+$/.test(parsedValue)) {
                              field.onChange(parsedValue)
                            }
                          }}
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                VND
                              </InputAdornment>
                            )
                          }}
                          helperText={
                            error?.message || 'Nhập số tiền không có dấu phẩy'
                          }
                          error={!!error}
                        />
                      )}
                    />{' '}
                  </Grid>
                  <Grid item xs={12} sm={6}>
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
                        isOptionEqualToValue={(option, value) =>
                          option === value
                        }
                      />
                    )}{' '}
                  </Grid>
                </>
              )}
              <FormControlLabel
                sx={{ ml: '10px' }}
                control={
                  <Controller
                    name="isActive"
                    control={control}
                    render={({ field }) => (
                      <Switch
                        {...field}
                        checked={field.value}
                        onChange={event => field.onChange(event.target.checked)}
                      />
                    )}
                  />
                }
                label="Công khai hồ sơ"
              />
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button variant="outlined" onClick={onClose}>
            Huỷ
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={isSubmitting}
          >
            Cập nhật
          </LoadingButton>
        </DialogActions>
      </FormProvider>
    </Dialog>
  )
}
