import { memo } from 'react'

import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import { useTheme } from '@mui/material/styles'

import { bgBlur } from 'src/theme/css'

import Scrollbar from 'src/components/scrollbar'
import { NavSectionHorizontal } from 'src/components/nav-section'

import { HEADER } from '../config-layout'
import { useNavData } from './config-navigation'
import HeaderShadow from '../common/header-shadow'

// ----------------------------------------------------------------------

function NavHorizontal() {
  const theme = useTheme()
  const userProfile = localStorage.getItem('userProfile')
  const userProfileParsed = userProfile ? JSON.parse(userProfile) : {}
  const navData = useNavData()

  return (
    <AppBar
      component="div"
      sx={{
        top: HEADER.H_DESKTOP_OFFSET
      }}
    >
      <Toolbar
        sx={{
          ...bgBlur({
            color: theme.palette.background.default
          })
        }}
      >
        <Scrollbar
          sx={{
            '& .simplebar-content': {
              display: 'flex'
            }
          }}
        >
          <NavSectionHorizontal
            data={navData}
            slotProps={{
              currentRole: userProfileParsed?.role
            }}
            sx={{
              ...theme.mixins.toolbar
            }}
          />
        </Scrollbar>
      </Toolbar>

      <HeaderShadow />
    </AppBar>
  )
}

export default memo(NavHorizontal)
