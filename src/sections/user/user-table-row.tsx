import moment from 'moment'
import { useState } from 'react'
import { enqueueSnackbar } from 'notistack'

import Button from '@mui/material/Button'
import Avatar from '@mui/material/Avatar'
import Tooltip from '@mui/material/Tooltip'
import MenuItem from '@mui/material/MenuItem'
import TableRow from '@mui/material/TableRow'
import Checkbox from '@mui/material/Checkbox'
import TableCell from '@mui/material/TableCell'
import IconButton from '@mui/material/IconButton'
import ListItemText from '@mui/material/ListItemText'

import { useBoolean } from 'src/hooks/use-boolean'

import { formatCurrencyVND } from 'src/utils/formatCurrency'

import { useUpdateUser } from 'src/api/user'

import Label from 'src/components/label'
import Iconify from 'src/components/iconify'
import { ConfirmDialog } from 'src/components/custom-dialog'
import CustomPopover, { usePopover } from 'src/components/custom-popover'

import { IUserItem } from 'src/types/user'

import StatusOption from './StatusOption'
import UserQuickEditForm from './user-quick-edit-form'
// ----------------------------------------------------------------------
type Props = {
  selected: boolean
  row: IUserItem
  onSelectRow: VoidFunction
  onDeleteRow: VoidFunction
  typeUser: 'user' | 'doctor' | 'employee' | 'patient'
  hospitalList: any
  ranking: any
}

export default function UserTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  typeUser,
  hospitalList,
  ranking
}: Props) {
  const {
    fullName,
    avatarUrl,
    email,
    phoneNumber,
    hospital,
    rank,
    specialty,
    city,
    experienceYears,
    licenseNo,
    gender,
    address,
    medicalHistory,
    birthDate,
    position,
    department,
    id,
    isActive,
    salary,
    registrationStatus,
    _id
  } = row

  const confirm = useBoolean()
  const quickEdit = useBoolean()
  const popover = usePopover()
  const hospitalOptions = hospitalList?.map((item: any) => ({
    value: item._id,
    label: item.name
  }))
  const { updateUser } = useUpdateUser({ typeUser })
  const [currentValueStatus, setCurrentValueStatus] = useState(
    row.registrationStatus
  )
  const handleChangeStatus = async (val: string) => {
    try {
      await updateUser({
        id: _id,
        data: {
          registrationStatus: val
        }
      })
      setCurrentValueStatus(val as any)
      enqueueSnackbar('Cập nhật trạng thái thành công', { variant: 'success' })
    } catch (error) {
      enqueueSnackbar('Cập nhật trạng thái thất bại', { variant: 'error' })
    }
  }

  const renderCells = () => {
    switch (typeUser) {
      case 'doctor':
        return (
          <>
            <TableCell>{id}</TableCell>
            <TableCell>
              <div className="flex items-center">
                <Avatar alt={fullName} src={avatarUrl || ''} sx={{ mr: 2 }} />
                <ListItemText primary={fullName} secondary={email} />
              </div>
            </TableCell>
            <TableCell>{hospital?.name || '-'}</TableCell>
            <TableCell>{position || '-'}</TableCell>
            <TableCell>{rank?.name || '-'}</TableCell>
            <TableCell>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(specialty) && specialty.length > 0
                  ? specialty.map((s, index) => (
                      <span
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                        key={index}
                      >
                        {s?.name || s}
                      </span>
                    ))
                  : '-'}
              </div>
            </TableCell>
            <TableCell>{phoneNumber || '-'}</TableCell>
            <TableCell>{experienceYears ?? '-'}</TableCell>
            <TableCell>{licenseNo || '-'}</TableCell>
            <TableCell>
              <Checkbox checked={isActive} disabled />
            </TableCell>
            {/* <TableCell 
            onClick={() => {
              if (files && files?.length !== 0) {
                window.open(files[0]?.url, '_blank')
              }
            }}
            sx={{ textDecoration: 'underline', cursor: 'pointer' }}>
              {files && files?.length !== 0
                ? `${files?.length} File hồ sơ`
                : `Không có`}
            </TableCell> */}
            <TableCell>
              <StatusOption
                value={currentValueStatus || registrationStatus}
                onChange={async val => {
                  if (val) {
                    await handleChangeStatus(val)
                  }
                }}
              />{' '}
            </TableCell>
            <TableCell>
              {moment(birthDate).format('DD/MM/YYYY HH:mm:ss') || '-'}
            </TableCell>
          </>
        )

      case 'employee':
        return (
          <>
            <TableCell>{id}</TableCell>
            <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar alt={fullName} src={avatarUrl || ''} sx={{ mr: 2 }} />
              <ListItemText primary={fullName} secondary={email} />
            </TableCell>
            <TableCell>{phoneNumber}</TableCell>
            <TableCell>{city?.name || city}</TableCell>
            <TableCell>{department}</TableCell>
            <TableCell>{position}</TableCell>
            <TableCell>{formatCurrencyVND(salary)}</TableCell>
            <TableCell>
              <Checkbox checked={isActive} disabled />
            </TableCell>
          </>
        )

      default: // patient
        return (
          <>
            <TableCell>{id}</TableCell>
            <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar alt={fullName} src={avatarUrl || ''} sx={{ mr: 2 }} />
              <ListItemText primary={fullName} secondary={email} />
            </TableCell>
            <TableCell>{phoneNumber}</TableCell>
            <TableCell>{moment(birthDate).format('l') || '-'}</TableCell>
            <TableCell>
              <Label
                variant="soft"
                color={(() => {
                  if (gender === 'male') return 'info'
                  if (gender === 'female') return 'error'
                  return 'default'
                })()}
              >
                {(() => {
                  switch (gender) {
                    case 'male':
                      return 'Nam'
                    case 'female':
                      return 'Nữ'
                    default:
                      return 'Khác'
                  }
                })()}
              </Label>
            </TableCell>
            <TableCell>{address}</TableCell>

            {/* Hiển thị trạng thái tài khoản */}
            <TableCell>
              <Checkbox checked={isActive} disabled />
            </TableCell>
          </>
        )
    }
  }

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        {renderCells()}
        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Sửa nhanh" placement="top" arrow>
            <IconButton
              color={quickEdit.value ? 'inherit' : 'default'}
              onClick={quickEdit.onTrue}
            >
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <IconButton
            color={popover.open ? 'inherit' : 'default'}
            onClick={popover.onOpen}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <UserQuickEditForm
        typeUser={typeUser as 'doctor' | 'employee' | 'patient'}
        currentUser={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
        ranking={ranking}
        hospitalList={hospitalOptions}
      />

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
          Xoá
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value || false}
        onClose={confirm.onFalse}
        title={`Xoá người dùng ${
          {
            doctor: 'Bác Sĩ',
            employee: 'Nhân Viên',
            user: 'Người Dùng',
            patient: 'Bệnh Nhân'
          }[typeUser]
        }`}
        content="Bạn có chắc chắn muốn xoá chứ?"
        action={
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow() // Changed from the incorrect syntax
              confirm.onFalse() // This will close the modal
            }}
          >
            Xoá
          </Button>
        }
      />
    </>
  )
}
