import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import MenuItem from '@mui/material/MenuItem'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { RouterLink } from 'src/routes/components'

import { useCallStore } from 'src/store/call-store'

import Label from 'src/components/label'
import Iconify from 'src/components/iconify'
import CustomPopover, { usePopover } from 'src/components/custom-popover'

// ----------------------------------------------------------------------

type Props = {
  status: string
  backLink: string
  orderNumber: string
  createdAt: Date
  onChangeStatus: (newValue: string) => void
  statusOptions: {
    value: string
    label: string
  }[]
  currentAppointment: any
}

export default function OrderDetailsToolbar({
  status,
  backLink,
  createdAt,
  orderNumber,
  statusOptions,
  onChangeStatus,
  onOpenPrescriptionModal,
  currentAppointment
}: Props & { onOpenPrescriptionModal?: () => void }) {
  const popover = usePopover()
  const { openCall } = useCallStore()
  const handleRenderStatus = (statusString: string) => {
    switch (statusString) {
      case 'completed':
        return 'Hoàn thành'
      case 'pending':
        return 'Chờ xử lý'
      case 'cancelled':
        return 'Đã hủy'
      case 'refunded':
        return 'Hoàn tiền'
      case 'assigned':
        return 'Đã tiếp nhận'
      case 'in_progress':
        return 'Đang xử lý'
      case 'waiting_for_confirmation':
        return 'Chờ xác nhận'
      case 'waiting_for_payment':
        return 'Chờ thanh toán'
      case 'waiting_for_delivery':
      default:
        return statusString
    }
  }

  return (
    <>
      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        sx={{
          mb: { xs: 3, md: 5 }
        }}
      >
        <Stack spacing={1} direction="row" alignItems="flex-start">
          <IconButton component={RouterLink} href={backLink}>
            <Iconify icon="eva:arrow-ios-back-fill" />
          </IconButton>

          <Stack spacing={0.5}>
            <Stack spacing={1} direction="row" alignItems="center">
              <Typography variant="h4"> Bệnh án {orderNumber} </Typography>
              <Label
                variant="soft"
                color={
                  (status === 'completed' && 'success') ||
                  (status === 'pending' && 'warning') ||
                  (status === 'cancelled' && 'error') ||
                  (status === 'assigned' && 'info') ||
                  'default'
                }
              >
                {handleRenderStatus(status)}
              </Label>
            </Stack>
          </Stack>
        </Stack>

        <Stack
          flexGrow={1}
          spacing={1.5}
          direction="row"
          alignItems="center"
          justifyContent="flex-end"
        >
          <Button
            variant="outlined"
            color="primary"
            onClick={() => openCall(currentAppointment)}
            sx={{ minWidth: 160 }}
          >
            <Iconify icon="eva:phone-fill" />
            Gọi thoại
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={onOpenPrescriptionModal}
            sx={{ minWidth: 160 }}
          >
            Kê đơn thuốc
          </Button>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="top-right"
        sx={{ width: 140 }}
      >
        {statusOptions.map(option => (
          <MenuItem
            key={option.value}
            selected={option.value === status}
            onClick={() => {
              popover.onClose()
              onChangeStatus(option.value)
            }}
          >
            {option.label}
          </MenuItem>
        ))}
      </CustomPopover>
    </>
  )
}
