import { useState, useCallback } from 'react'

import Stack from '@mui/material/Stack'
import Container from '@mui/material/Container'
import Grid from '@mui/material/Unstable_Grid2'

import { paths } from 'src/routes/paths'

import {
  _orders as _cases,
  ORDER_STATUS_OPTIONS as CASE_STATUS_OPTIONS
} from 'src/_mock'

import { useSettingsContext } from 'src/components/settings'

import CaseDetailsInfo from '../case-details-info'
import CaseDetailsItems from '../case-details-item'
import CaseDetailsToolbar from '../case-details-toolbar'
import CaseDetailsHistory from '../case-details-history'
import CaseDetailsMedicalForms from '../case-details-medical-forms'

// ----------------------------------------------------------------------

type MedicalFormData = {
  patientName?: string
  patientAge?: number
  gender?: string
  address?: string
  phone?: string
  symptoms?: string
  diagnosis?: string
  note?: string
  doctorName?: string
  [key: string]: any
}

type Props = {
  taxes: number
  id: string
  shipping: number
  discount: number
  subTotal: number
  totalAmount: number
  items: any[]
  medicalFormData?: MedicalFormData
}

export default function CaseDetailsView({
  id,
  taxes,
  shipping,
  discount,
  subTotal,
  totalAmount,
  items,
  medicalFormData
}: Props) {
  const settings = useSettingsContext()

  const currentCase = _cases.find(item => item.id === id)

  const [status, setStatus] = useState(currentCase?.status || '')

  const handleChangeStatus = useCallback((newValue: string) => {
    setStatus(newValue)
  }, [])

  if (!currentCase) return null
  return (
    <Container maxWidth={settings.themeStretch ? false : 'lg'}>
      <CaseDetailsToolbar
        backLink={paths.dashboard.case.root}
        orderNumber={currentCase.orderNumber}
        createdAt={currentCase.createdAt}
        status={status}
        onChangeStatus={handleChangeStatus}
        statusOptions={CASE_STATUS_OPTIONS}
      />

      <Grid container spacing={3}>
        <Grid xs={12} md={8}>
          <Stack spacing={3} direction={{ xs: 'column-reverse', md: 'column' }}>
            <CaseDetailsItems
              items={currentCase.items}
              taxes={currentCase.taxes}
              shipping={currentCase.shipping}
              discount={currentCase.discount}
              subTotal={currentCase.subTotal}
              totalAmount={currentCase.totalAmount}
            />
          </Stack>
        </Grid>
        <Grid container spacing={3}>
          <Grid xs={12} md={8}>
            <Stack
              spacing={3}
              direction={{ xs: 'column-reverse', md: 'column' }}
            >
              <CaseDetailsMedicalForms
                medicalFormData={medicalFormData || {}}
              />
              <CaseDetailsHistory history={currentCase.history} />
            </Stack>
          </Grid>
        </Grid>
        <Grid xs={12} md={4}>
          <CaseDetailsInfo
            customer={currentCase.customer}
            delivery={currentCase.delivery}
            payment={currentCase.payment}
            shippingAddress={currentCase.shippingAddress}
          />
        </Grid>
      </Grid>
    </Container>
  )
}
