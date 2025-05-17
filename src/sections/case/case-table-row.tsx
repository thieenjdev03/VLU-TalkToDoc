import Box from '@mui/material/Box'
import Paper from '@mui/material/Paper'
import Stack from '@mui/material/Stack'
import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Collapse from '@mui/material/Collapse'
import MenuItem from '@mui/material/MenuItem'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import ListItemText from '@mui/material/ListItemText'

import { useBoolean } from 'src/hooks/use-boolean'

import { fDate } from 'src/utils/format-time'
import { fCurrency } from 'src/utils/format-number'

import Label from 'src/components/label'
import Iconify from 'src/components/iconify'
import { ConfirmDialog } from 'src/components/custom-dialog'
import CustomPopover, { usePopover } from 'src/components/custom-popover'

// Nếu chưa có type CaseItem chuẩn, tạm thời dùng any để tránh lỗi
type CaseItemAny = any

type Props = {
  row: CaseItemAny
  selected: boolean
  onViewRow: VoidFunction
  onSelectRow: VoidFunction
  onDeleteRow: VoidFunction
}

export default function CaseTableRow({
  row,
  selected,
  onViewRow,
  onSelectRow,
  onDeleteRow
}: Props) {
  // destructuring với fallback cho các trường có thể không tồn tại
  const {
    items = [],
    status = '',
    caseNumber = '',
    createdAt = '',
    patient = {},
    doctor = {},
    gender = '',
    birthYear = '',
    phone = '',
    totalQuantity = 0,
    totalAmount = 0
  } = row || {}

  const confirm = useBoolean()
  const collapse = useBoolean()
  const popover = usePopover()

  function getStatusLabel(_status: string) {
    if (_status === 'completed') return 'Hoàn thành'
    if (_status === 'pending') return 'Chờ xử lý'
    if (_status === 'cancelled') return 'Đã hủy'
    if (_status === 'refunded') return 'Hoàn tiền'
    return _status
  }

  function getStatusColor(_status: string) {
    if (_status === 'completed') return 'success'
    if (_status === 'pending') return 'warning'
    if (_status === 'cancelled') return 'error'
    if (_status === 'refunded') return 'info'
    return 'default'
  }

  const renderPrimary = (
    <TableRow hover selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox checked={selected} onClick={onSelectRow} />
      </TableCell>

      <TableCell>
        <Box
          onClick={onViewRow}
          sx={{
            cursor: 'pointer',
            '&:hover': {
              textDecoration: 'underline'
            }
          }}
        >
          {caseNumber}
        </Box>
      </TableCell>

      <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
        <Avatar
          alt={patient?.name || ''}
          src={patient?.avatarUrl || ''}
          sx={{ mr: 2 }}
        />
        <ListItemText
          primary={patient?.name || ''}
          secondary={patient?.email || ''}
          primaryTypographyProps={{ typography: 'body2' }}
          secondaryTypographyProps={{
            component: 'span',
            color: 'text.disabled'
          }}
        />
      </TableCell>

      <TableCell>
        <ListItemText
          primary={doctor?.name || ''}
          secondary={doctor?.specialty || ''}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
          secondaryTypographyProps={{
            component: 'span',
            color: 'text.disabled'
          }}
        />
      </TableCell>

      <TableCell>
        <ListItemText
          primary={gender || ''}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        />
      </TableCell>

      <TableCell>
        <ListItemText
          primary={birthYear || ''}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        />
      </TableCell>

      <TableCell>
        <ListItemText
          primary={phone || ''}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        />
      </TableCell>

      <TableCell align="center">{totalQuantity}</TableCell>

      <TableCell>{fCurrency(totalAmount)}</TableCell>

      <TableCell>
        <Label variant="soft" color={getStatusColor(status)}>
          {getStatusLabel(status)}
        </Label>
      </TableCell>

      <TableCell>
        <ListItemText
          primary={fDate(createdAt)}
          primaryTypographyProps={{ typography: 'body2', noWrap: true }}
        />
      </TableCell>

      <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
        <IconButton
          color={collapse.value ? 'inherit' : 'default'}
          onClick={collapse.onToggle}
          sx={{
            ...(collapse.value && {
              bgcolor: 'action.hover'
            })
          }}
        >
          <Iconify icon="eva:arrow-ios-downward-fill" />
        </IconButton>

        <IconButton
          color={popover.open ? 'inherit' : 'default'}
          onClick={popover.onOpen}
        >
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  )

  const renderSecondary = (
    <TableRow>
      <TableCell sx={{ p: 0, border: 'none' }} colSpan={12}>
        <Collapse
          in={collapse.value}
          timeout="auto"
          unmountOnExit
          sx={{ bgcolor: 'background.neutral' }}
        >
          <Stack component={Paper} sx={{ m: 1.5 }}>
            {(items as any[]).map((item: any) => (
              <Stack
                key={item.id}
                direction="row"
                alignItems="center"
                sx={{
                  p: theme => theme.spacing(1.5, 2, 1.5, 1.5),
                  '&:not(:last-of-type)': {
                    borderBottom: theme =>
                      `solid 2px ${theme.palette.background.neutral}`
                  }
                }}
              >
                <Avatar
                  src={item.coverUrl}
                  variant="rounded"
                  sx={{ width: 48, height: 48, mr: 2 }}
                />

                <ListItemText
                  primary={item.name}
                  secondary={item.sku}
                  primaryTypographyProps={{
                    typography: 'body2'
                  }}
                  secondaryTypographyProps={{
                    component: 'span',
                    color: 'text.disabled',
                    mt: 0.5
                  }}
                />

                <Box>x{item.quantity}</Box>

                <Box sx={{ width: 110, textAlign: 'right' }}>
                  {fCurrency(item.price)}
                </Box>
              </Stack>
            ))}
          </Stack>
        </Collapse>
      </TableCell>
    </TableRow>
  )

  return (
    <>
      {renderPrimary}

      {renderSecondary}

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue()
            popover.onClose()
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Xóa
        </MenuItem>

        <MenuItem
          onClick={() => {
            onViewRow()
            popover.onClose()
          }}
        >
          <Iconify icon="solar:eye-bold" />
          Xem chi tiết
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title="Xóa bệnh án"
        content="Bạn có chắc chắn muốn xóa bệnh án này không?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow()
              confirm.onFalse()
            }}
          >
            Xóa
          </Button>
        }
      />
    </>
  )
}
