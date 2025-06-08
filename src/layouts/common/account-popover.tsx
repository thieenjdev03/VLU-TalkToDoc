import { m } from 'framer-motion'
import { useState, useEffect } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Avatar from '@mui/material/Avatar'
import Divider from '@mui/material/Divider'
import { alpha } from '@mui/material/styles'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { paths } from 'src/routes/paths'
import { useRouter } from 'src/routes/hooks'

import { useAuthContext } from 'src/auth/hooks'
import { getUserProfileFromToken } from 'src/api/auth'

import { varHover } from 'src/components/animate'
import { useSnackbar } from 'src/components/snackbar'
import CustomPopover, { usePopover } from 'src/components/custom-popover'

// ----------------------------------------------------------------------

const OPTIONS = [
  {
    label: 'Trang chủ',
    linkTo: paths.dashboard.root
  },
  // {
  //   label: 'Thông tin cá nhân',
  //   linkTo: paths.dashboard.user.profile,
  // },
  {
    label: 'Cài đặt tài khoản',
    linkTo: paths.dashboard.user.account
  }
]
const OPTIONS_ADMIN = [
  {
    label: 'Trang chủ',
    linkTo: paths.dashboard.root
  }
  // {
  //   label: 'Thông tin cá nhân',
  //   linkTo: paths.dashboard.user.profile,
  // },
  // {
  //   label: 'Cài đặt tài khoản',
  //   linkTo: paths.dashboard.user.account,
  // },
]
// ----------------------------------------------------------------------

export default function AccountPopover() {
  const router = useRouter()
  const { logout } = useAuthContext()
  const { enqueueSnackbar } = useSnackbar()
  const popover = usePopover()

  // State userProfile realtime
  const [user, setUser] = useState(() => {
    const userProfile = localStorage.getItem('userProfile')
    return userProfile ? JSON.parse(userProfile) : {}
  })

  // Refetch userProfile khi popover mở
  useEffect(() => {
    if (popover.open) {
      getUserProfileFromToken()
        .then(res => {
          console.log('res', res)
          if (res?.data) {
            const formattedData = {
              ...res.data,
              role: res?.data?.role?.toUpperCase()
            }
            localStorage.setItem('userProfile', JSON.stringify(formattedData))
            setUser(formattedData)
          }
        })
        .catch(err => {
          if (err?.response?.status === 401) {
            localStorage.removeItem('userProfile')
            localStorage.removeItem('accessToken')
            setUser({})
          }
        })
    }
  }, [popover.open])

  const handleLogout = async () => {
    try {
      await logout()
      popover.onClose()
      router.replace('/auth/jwt/login')
      localStorage.clear()
    } catch (error) {
      console.error(error)
      enqueueSnackbar('Unable to logout!', { variant: 'error' })
    }
  }

  const handleClickItem = (path: string) => {
    popover.onClose()
    router.push(path)
  }

  const handleShowRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên'
      case 'doctor':
        return 'Bác sĩ'
      case 'patient':
        return 'Bệnh nhân'
      default:
        return role
    }
  }
  console.log('user', user)
  return (
    <>
      <IconButton
        component={m.button}
        whileTap="tap"
        whileHover="hover"
        variants={varHover(1.05)}
        onClick={popover.onOpen}
        sx={{
          width: 40,
          height: 40,
          background: theme => alpha(theme.palette.grey[500], 0.08),
          ...(popover.open && {
            background: theme =>
              `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`
          })
        }}
      >
        <Avatar
          src={user?.avatarUrl}
          alt={user?.name}
          sx={{
            width: 36,
            height: 36,
            border: theme => `solid 2px ${theme.palette.background.default}`
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase()}
        </Avatar>
      </IconButton>
      <Divider sx={{ borderStyle: 'dashed' }} />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        sx={{ width: 200, p: 0 }}
      >
        <Box sx={{ p: 2, pb: 1.5 }}>
          <Typography variant="subtitle2" noWrap>
            {user?.fullName}
          </Typography>

          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {user?.email}
          </Typography>

          <Typography variant="body2" sx={{ mt: 1 }} noWrap>
            <div
              style={{
                color: 'text.primary',
                fontWeight: 'bold',
                fontSize: '14px'
              }}
            >
              Vai Trò: {handleShowRoleName(user?.role?.toLowerCase?.())}
            </div>
          </Typography>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box sx={{ px: 2, py: 1 }}>
          <Typography variant="body2" sx={{ mt: 1 }} noWrap>
            <div
              style={{
                color: 'text.primary',
                fontWeight: 'normal',
                fontSize: '14px'
              }}
            >
              Số dư:{' '}
              <span style={{ color: 'green' }}>
                {user?.walletBalance?.toLocaleString() ||
                  user?.wallet?.balance?.toLocaleString() ||
                  0}
                VNĐ
              </span>
            </div>
          </Typography>
        </Box>
        <Divider sx={{ borderStyle: 'dashed' }} />
        <Stack sx={{ p: 1 }}>
          {user?.role === 'ADMIN'
            ? OPTIONS_ADMIN.map(option => (
                <MenuItem
                  key={option.label}
                  onClick={() => handleClickItem(option.linkTo)}
                >
                  {option.label}
                </MenuItem>
              ))
            : OPTIONS.map(option => (
                <MenuItem
                  key={option.label}
                  onClick={() => handleClickItem(option.linkTo)}
                >
                  {option.label}
                </MenuItem>
              ))}
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <MenuItem
          onClick={handleLogout}
          sx={{ m: 1, fontWeight: 'fontWeightBold', color: 'error.main' }}
        >
          Đăng xuất
        </MenuItem>
      </CustomPopover>
    </>
  )
}
