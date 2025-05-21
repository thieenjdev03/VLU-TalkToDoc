import { useState, useCallback } from 'react'

import Tab from '@mui/material/Tab'
import Tabs from '@mui/material/Tabs'
import Container from '@mui/material/Container'

import { paths } from 'src/routes/paths'

import {
  _userAbout,
  _userPlans,
  _userPayment,
  _userInvoices,
  _userAddressBook
} from 'src/_mock'

import Iconify from 'src/components/iconify'
import { useSettingsContext } from 'src/components/settings'
import CustomBreadcrumbs from 'src/components/custom-breadcrumbs'

import AccountGeneral from '../account-general'
import AccountBilling from '../account-billing'
import AccountSocialLinks from '../account-social-links'
import AccountAvailability from '../account-availability'
import AccountNotifications from '../account-notifications'
import AccountChangePassword from '../account-change-password'

// ----------------------------------------------------------------------
const userProfile = localStorage.getItem('userProfile')
const user = JSON.parse(userProfile || '{}')
const TABS = [
  {
    value: 'general',
    label: 'Thông tin chung',
    icon: <Iconify icon="solar:user-id-bold" width={24} />
  },
  // {
  //   value: 'billing',
  //   label: 'Billing',
  //   icon: <Iconify icon="solar:bill-list-bold" width={24} />,
  // },
  // {
  //   value: 'notifications',
  //   label: 'Notifications',
  //   icon: <Iconify icon="solar:bell-bing-bold" width={24} />,
  // },
  // {
  //   value: 'social',
  //   label: 'Social links',
  //   icon: <Iconify icon="solar:share-bold" width={24} />,
  // },
  {
    hidden: user?.role !== 'DOCTOR',
    value: 'availability',
    label: 'Giờ làm việc',
    icon: <Iconify icon="solar:calendar-bold" width={24} />
  }
]

// ----------------------------------------------------------------------

export default function AccountView() {
  const settings = useSettingsContext()

  const [currentTab, setCurrentTab] = useState('general')

  const handleChangeTab = useCallback(
    (event: React.SyntheticEvent, newValue: string) => {
      setCurrentTab(newValue)
    },
    []
  )

  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CustomBreadcrumbs
        heading="Cài đặt tài khoản"
        links={[
          { name: 'Trang Chủ', href: paths.dashboard.root },
          { name: 'Tài Khoản', href: paths.dashboard.user.root },
          { name: 'Cài Đặt' }
        ]}
        sx={{
          mb: { xs: 1, md: 2 }
        }}
      />

      <Tabs
        value={currentTab}
        onChange={handleChangeTab}
        sx={{
          mb: { xs: 1, md: 2 }
        }}
      >
        {TABS.map(
          tab =>
            !tab.hidden && (
              <Tab
                key={tab.value}
                label={tab.label}
                icon={tab.icon}
                value={tab.value}
              />
            )
        )}
      </Tabs>

      {currentTab === 'general' && <AccountGeneral />}
      {currentTab === 'availability' && <AccountAvailability />}

      {currentTab === 'billing' && (
        <AccountBilling
          plans={_userPlans}
          cards={_userPayment}
          invoices={_userInvoices}
          addressBook={_userAddressBook}
        />
      )}

      {currentTab === 'notifications' && <AccountNotifications />}

      {currentTab === 'social' && (
        <AccountSocialLinks socialLinks={_userAbout.socialLinks} />
      )}

      {currentTab === 'security' && <AccountChangePassword />}
    </Container>
  )
}
