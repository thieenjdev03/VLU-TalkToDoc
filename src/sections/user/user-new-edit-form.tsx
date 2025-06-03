import axios from 'axios'
import * as Yup from 'yup'
import moment from 'moment'
import { Icon } from '@iconify/react'
import { useMemo, useState, useEffect } from 'react'
import { yupResolver } from '@hookform/resolvers/yup'
import { useForm, Resolver, Controller } from 'react-hook-form'

import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Stack from '@mui/material/Stack'
import Switch from '@mui/material/Switch'
import Divider from '@mui/material/Divider'
import Typography from '@mui/material/Typography'
import LoadingButton from '@mui/lab/LoadingButton'
import InputAdornment from '@mui/material/InputAdornment'
import FormControlLabel from '@mui/material/FormControlLabel'
import {
  Table,
  Dialog,
  Button,
  Tooltip,
  TableRow,
  TableHead,
  TableCell,
  TableBody,
  IconButton,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'

import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'

import { useGetRanking } from 'src/api/ranking'
import { useGetSpecialties } from 'src/api/specialty'
import { useCreateUser, useUpdateUser } from 'src/api/user'

import Label from 'src/components/label'
import { useSnackbar } from 'src/components/snackbar'
import FormProvider, {
  RHFTextField,
  RHFAutocomplete,
  RHFUploadAvatar
} from 'src/components/hook-form'

import { IUserItem } from 'src/types/user'
import { ISpecialtyItem } from 'src/types/specialties'

// ----------------------------------------------------------------------
type Ranking = {
  _id: string
  name: string
}
type Props = {
  currentUser?: IUserItem
  typeUser: 'user' | 'doctor' | 'employee' | 'patient' | 'admin'
  hospitals: any
  isSettingAccount?: boolean
  updateUserPage?: boolean
}

interface IProvince {
  code: number
  name: string
  division_type: string
  codename: string
  phone_code: number
}

type PerformanceScoreLog = {
  appointmentId: string
  score: number
  reason: string
  createdAt: string
  _id: string
}

function PerformanceScoreLogModal({
  open,
  onClose,
  logs
}: {
  open: boolean
  onClose: () => void
  logs: PerformanceScoreLog[]
}) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Lịch sử trừ điểm</DialogTitle>
      <DialogContent>
        {logs?.length ? (
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Thời gian</TableCell>
                <TableCell>Lý do</TableCell>
                <TableCell>Số điểm</TableCell>
                <TableCell>Mã lịch hẹn</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log: PerformanceScoreLog) => (
                <TableRow key={log._id}>
                  <TableCell>
                    {moment(log.createdAt).format('DD/MM/YYYY HH:mm')}
                  </TableCell>
                  <TableCell>{log.reason}</TableCell>
                  <TableCell style={{ color: log.score < 0 ? 'red' : 'green' }}>
                    {log.score}
                  </TableCell>
                  <TableCell>{log.appointmentId}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <Typography variant="body2">Không có lịch sử trừ điểm</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Đóng</Button>
      </DialogActions>
    </Dialog>
  )
}

export default function UserNewEditForm({
  currentUser,
  typeUser,
  updateUserPage,
  hospitals,
  isSettingAccount
}: Props) {
  console.log('updateUserPage:', updateUserPage)
  const router = useRouter()
  const { specialties } = useGetSpecialties({
    query: '',
    page: 1,
    limit: 10,
    sortField: 'updatedAt',
    sortOrder: 'desc'
  })
  console.log('currentUser:', currentUser)
  const [specialtyList, setSpecialtyList] = useState<ISpecialtyItem[]>([])
  const { providerRanking: rankingData } = useGetRanking({
    query: '',
    page: 1,
    limit: 10,
    sortField: '',
    sortOrder: 'desc'
  })

  const { enqueueSnackbar } = useSnackbar()
  const { createUser } = useCreateUser({
    typeUser: typeUser as 'user' | 'doctor' | 'employee' | 'patient' | 'all'
  })
  const { updateUser } = useUpdateUser({
    typeUser: typeUser as 'user' | 'doctor' | 'employee' | 'patient' | 'all'
  })
  const [cities, setCities] = useState<IProvince[]>([])
  const [loadingCities, setLoadingCities] = useState<boolean>(false)
  useEffect(() => {
    if (specialties?.data?.length) {
      setSpecialtyList(specialties?.data)
    }
  }, [specialties])
  const [rankingList, setRankingList] = useState<Ranking[]>([])
  useEffect(() => {
    if (rankingData?.data?.length) {
      setRankingList(rankingData?.data)
    }
  }, [rankingData])

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
  const formatNumber = (value: number | string) => {
    if (!value) return ''
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  }

  // Parse formatted number back to number
  const parseNumber = (value: string) => value.replace(/,/g, '')
  const handleRenderRegistrationStatus = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Đã xác nhận'
      case 'rejected':
        return 'Từ chối'
      case 'updating':
        return 'Cần cập nhật'
      case 'pending':
        return 'Chờ xác nhận'
      default:
        return 'Chờ xác nhận'
    }
  }
  const cityOptions = cities.map(city => city.name)
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
          position: Yup.string().required('Vai trò không được để trống'),
          department: Yup.string().required('Bộ phận không được để trống')
        })
      default:
        return Yup.object().shape({})
    }
  }, [typeUser])
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
          console.log('imageUrl:', data.secure_url)
        } else {
          enqueueSnackbar('Không thể lấy được đường dẫn ảnh từ Cloudinary!', {
            variant: 'error'
          })
        }
      } catch (error) {
        console.error('Upload error:', error)
        enqueueSnackbar('Upload ảnh thất bại!', { variant: 'error' })
      }
    }
  }
  const defaultValues = useMemo(
    () => ({
      fullName: currentUser?.fullName || '',
      email: currentUser?.email || '',
      isActive: currentUser?.isActive || false,
      phoneNumber: currentUser?.phoneNumber || '',
      avatarUrl: currentUser?.avatarUrl || '',
      username: currentUser?.username || '',
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
        licenseNo: currentUser?.licenseNo || ''
      }),
      ...(typeUser === 'patient' && {
        address: currentUser?.address || '',
        birthDate: currentUser?.birthDate
          ? currentUser.birthDate.split('T')[0]
          : '',
        gender: currentUser?.gender || ''
      }),
      ...(typeUser === 'employee' && {
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
    reset,
    control,
    setValue,
    handleSubmit,
    formState: { isSubmitting }
  } = methods

  const onSubmit = handleSubmit(async data => {
    try {
      let formattedData
      let path
      if (typeUser === 'doctor') {
        path = paths.dashboard.user.list_doctor
        formattedData = {
          ...data,
          specialty: data.specialty?.map((item: any) => item.value), // 👈 chỉ lấy ID
          rank: data.rank?.value, // 👈 chỉ gửi _id
          hospital: data.hospital?.value, // string ID
          // city: cities.find((c) => c.name === data.city), // full object (name, code, etc.)
          position: data.position || ''
        }
      } else if (typeUser === 'patient') {
        path = paths.dashboard.user.list_patient
        formattedData = {
          ...data
        }
      } else if (typeUser === 'employee') {
        path = paths.dashboard.user.list_employee
        formattedData = {
          ...data
        }
      }
      if (updateUserPage) {
        await updateUser({
          id: currentUser?._id || '',
          data: { avatarUrl: data?.avatarUrl, ...formattedData }
        })
        reset()
        enqueueSnackbar(
          currentUser ? 'Cập nhật thành công!' : 'Tạo mới thành công!'
        )
      } else {
        await createUser({ data: formattedData })
        reset()
        enqueueSnackbar(
          currentUser ? 'Cập nhật thành công!' : 'Tạo mới thành công!'
        )
        router.push(path || '')
      }
    } catch (err) {
      enqueueSnackbar('Lỗi khi tạo tài khoản!', { variant: 'error' })
      console.error(err)
    }
  })

  const renderBasicFields = (
    <Box
      rowGap={3}
      columnGap={2}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(1, 1fr)'
      }}
    >
      <Box sx={{ fontSize: '16px', fontWeight: '700' }}>
        Nhập thông tin người dùng:{' '}
      </Box>

      <RHFTextField name="fullName" label="Họ & Tên" />
      <RHFTextField name="phoneNumber" label="Số điện thoại" />
      <RHFTextField name="username" label="Tên tài khoản" />
      <RHFTextField name="password" type="password" label="Mật khẩu" />
      <Box
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(1, 1fr)'
        }}
      >
        <RHFTextField name="email" label="Email" />
      </Box>
      {/* <FormControlLabel
        control={
          <Controller
            name="isActive"
            control={control}
            render={({ field }) => (
              <Switch
                {...field}
                checked={field.value}
                onChange={(event) => field.onChange(event.target.checked)}
              />
            )}
          />
        }
        label="Kích hoạt"
      /> */}
    </Box>
  )

  const renderUserFields = (
    <Box
      rowGap={3}
      columnGap={2}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(1, 1fr)'
      }}
    >
      {renderBasicFields}
    </Box>
  )

  const renderPatientFields = (
    <Box sx={{ mb: 5 }}>
      <Box
        rowGap={3}
        columnGap={2}
        display="grid"
        gridTemplateColumns={{
          xs: 'repeat(1, 1fr)',
          sm: 'repeat(1, 1fr)'
        }}
      >
        {renderBasicFields}
        <RHFTextField name="address" label="Địa chỉ" />
        <Box
          rowGap={3}
          columnGap={2}
          display="grid"
          gridTemplateColumns={{
            xs: 'repeat(1, 1fr)',
            sm: 'repeat(1, 1fr)'
          }}
        >
          <RHFTextField
            name="birthDate"
            label="Ngày sinh"
            type="date"
            InputLabelProps={{
              shrink: true
            }}
          />
          <RHFAutocomplete
            name="gender"
            label="Giới tính"
            options={[
              { value: 'male', label: 'Nam' },
              { value: 'female', label: 'Nữ' },
              { value: 'other', label: 'Khác' }
            ]}
            getOptionLabel={option =>
              typeof option === 'string' ? option : option.label
            }
            isOptionEqualToValue={(option, value: any) =>
              typeof option === 'string'
                ? option === value
                : option.value === value
            }
            onChange={(event, newValue: any) =>
              setValue('gender', newValue.value, { shouldValidate: true })
            }
          />
        </Box>
      </Box>
    </Box>
  )

  const hospitalOptions =
    hospitals?.map((hospital: any) => ({
      value: hospital._id,
      label: hospital.name
    })) || []

  const renderDoctorFields = (
    <Box
      rowGap={3}
      columnGap={2}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(1, 1fr)'
      }}
    >
      {renderBasicFields}
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
          options={hospitalOptions}
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
          options={rankingList?.map((item: Ranking) => ({
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
        <RHFTextField name="experienceYears" label="Số năm kinh nghiệm" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <RHFTextField name="licenseNo" label="Mã giấy phép" />
      </Grid>
    </Box>
  )

  const renderEmployeeFields = (
    <Box
      rowGap={3}
      columnGap={2}
      display="grid"
      gridTemplateColumns={{
        xs: 'repeat(1, 1fr)',
        sm: 'repeat(1 1fr)'
      }}
    >
      {renderBasicFields}
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
      <RHFTextField name="position" label="Vai Trò" />
      <RHFTextField name="department" label="Bộ Phận" />
      <Controller
        name="salary"
        control={control}
        render={({ field, fieldState: { error } }) => (
          <RHFTextField
            name="salary"
            label="Lương / Tháng"
            value={formatNumber(field.value || 0)}
            onChange={e => {
              const parsedValue = parseNumber(e.target.value)
              if (!parsedValue || /^\d+$/.test(parsedValue)) {
                field.onChange(parsedValue)
              }
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">VND</InputAdornment>
            }}
            helperText={error?.message || 'Nhập số tiền không có dấu phẩy'}
            error={!!error}
          />
        )}
      />
    </Box>
  )

  const [openPerformanceLogModal, setOpenPerformanceLogModal] = useState(false)

  return (
    <FormProvider methods={methods} onSubmit={onSubmit}>
      <Grid container spacing={3}>
        {(typeUser === 'doctor' || typeUser === 'patient') && (
          <Grid xs={12} md={4}>
            <Card sx={{ pt: 10, pb: 5, px: 3 }}>
              {currentUser && (
                <Label
                  color={
                    (currentUser.registrationStatus === 'approved' &&
                      'success') ||
                    (currentUser.registrationStatus === 'rejected' &&
                      'error') ||
                    (currentUser.registrationStatus === 'updating' &&
                      'warning') ||
                    (currentUser.registrationStatus === 'pending' &&
                      'warning') ||
                    'warning'
                  }
                  sx={{ position: 'absolute', top: 24, right: 24 }}
                >
                  {handleRenderRegistrationStatus(
                    currentUser.registrationStatus || ''
                  )}
                </Label>
              )}

              <Box sx={{ mb: 5 }}>
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
                        color: 'text.disabled'
                      }}
                    >
                      Cho phép *.jpeg, *.jpg, *.png, *.gif <br /> dung lượng tối
                      đa 3MB
                    </Typography>
                  }
                />
              </Box>

              {updateUserPage && (
                <>
                  <Stack
                    direction="row"
                    spacing={2}
                    padding={1}
                    alignItems="center"
                  >
                    <Typography
                      hidden={currentUser?.role !== 'doctor'}
                      variant="subtitle2"
                      sx={{ mb: 0.5 }}
                    >
                      Điểm năng suất:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                      hidden={currentUser?.role !== 'doctor'}
                    >
                      <span style={{ color: 'green' }}>
                        {currentUser?.performanceScore || 0}
                      </span>
                    </Typography>
                    <Box
                      hidden={currentUser?.role !== 'doctor'}
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <Tooltip title="Điểm năng suất được tính dựa trên số lượng cuộc hẹn hoàn thành và đánh giá từ bệnh nhân. Nếu điểm về 0, tài khoản sẽ bị tạm khóa.">
                        <IconButton
                          size="medium"
                          onClick={() => setOpenPerformanceLogModal(true)}
                        >
                          <Icon
                            icon="eva:info-outline"
                            width={20}
                            height={20}
                          />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </Stack>
                  <Stack
                    direction="row"
                    spacing={2}
                    padding={1}
                    alignItems="center"
                  >
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Thông tin số dư:
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary' }}
                    >
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: 'green' }}>
                          {currentUser?.role === 'patient'
                            ? currentUser?.walletBalance?.toLocaleString()
                            : currentUser?.wallet?.balance?.toLocaleString() ||
                              0}{' '}
                          VNĐ
                        </span>
                        <Tooltip title="Số dư hiện tại là doanh thu đã trừ phí nền tảng. Số dư này sẽ được hệ thống tự động chốt và chuyển khoản cho bạn vào cuối mỗi tháng. Bạn không thể rút thủ công.">
                          <IconButton size="medium">
                            <Icon
                              icon="eva:info-outline"
                              width={20}
                              height={20}
                            />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Typography>
                  </Stack>
                </>
              )}
              <Divider
                sx={{ borderStyle: 'dashed', marginTop: 1, marginBottom: 2 }}
              />
              {currentUser && (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <FormControlLabel
                    labelPlacement="start"
                    control={
                      <Controller
                        name="isActive"
                        control={control}
                        render={({ field }) => (
                          <Switch
                            {...field}
                            disabled={
                              currentUser.registrationStatus !== 'approved'
                            }
                            checked={field.value}
                            onChange={event =>
                              field.onChange(event.target.checked)
                            }
                          />
                        )}
                      />
                    }
                    label={
                      <Stack direction="column" spacing={1} padding={1}>
                        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                          Công khai hồ sơ
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary' }}
                        >
                          *Nếu hồ sơ đăng ký đã được xác nhận mới được công khai
                        </Typography>
                      </Stack>
                    }
                    sx={{
                      mx: 0,
                      mb: 3,
                      width: 1,
                      justifyContent: 'space-between'
                    }}
                  />
                </Box>
              )}
            </Card>
          </Grid>
        )}
        <Grid xs={12} md={8}>
          <Card sx={{ p: 3 }}>
            {typeUser === 'user' && renderUserFields}
            {typeUser === 'doctor' && renderDoctorFields}
            {typeUser === 'employee' && renderEmployeeFields}
            {typeUser === 'patient' && renderPatientFields}
            <Box
              sx={{
                fontSize: '12px',
                fontWeight: '400',
                fontStyle: 'italic',
                marginTop: '10px',
                marginLeft: '10px'
              }}
            >
              *Vui Lòng Cam Kết Thông Tin Hoàn Toàn Chính Xác!
            </Box>
            <Stack alignItems="flex-end" sx={{ mt: 3 }}>
              <LoadingButton
                type="submit"
                variant="contained"
                loading={isSubmitting}
                onClick={() => {
                  console.log('Clicked submit button')
                }}
              >
                {currentUser || isSettingAccount ? 'Lưu thay đổi' : 'Tạo mới'}
              </LoadingButton>
            </Stack>
          </Card>
        </Grid>
      </Grid>
      <PerformanceScoreLogModal
        open={openPerformanceLogModal}
        onClose={() => setOpenPerformanceLogModal(false)}
        logs={currentUser?.performanceScoreLogs || []}
      />
    </FormProvider>
  )
}
