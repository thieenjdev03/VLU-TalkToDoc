import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IUserItem } from 'src/types/user';
import { ISpecialtyItem } from 'src/types/specialties';

import UserQuickEditForm from './user-quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: IUserItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  typeUser: 'user' | 'doctor' | 'employee' | 'patient';
  specialtyList: ISpecialtyItem[];
};

export default function UserTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  typeUser,
  specialtyList,
}: Props) {
  const {
    fullName,
    avatarUrl,
    status,
    email,
    phoneNumber,
    hospitalId,
    rank,
    specialty,
    city,
    experienceYears,
    licenseNo,
    gender,
    address,
    medicalHistory,
    _id,
    birthDate,
    position,
    department,
  } = row;

  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();
  const handleRenderSpecialty = (listSpecialty: string[]) => {
    const _specialtyList = listSpecialty
      ?.map((itemId) => {
        const _specialty = specialtyList?.find((s) => s._id === itemId);
        return _specialty ? _specialty.name : null;
      })
      ?.filter((name) => name !== null);
    return _specialtyList?.join(', ');
  };
  const renderCells = () => {
    switch (typeUser) {
      case 'doctor':
        return (
          <>
            <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar alt={fullName} src={avatarUrl?.preview || ''} sx={{ mr: 2 }} />
              <ListItemText primary={fullName} secondary={email} />
            </TableCell>
            <TableCell>{hospitalId}</TableCell>
            <TableCell>{rank}</TableCell>
            <TableCell>{handleRenderSpecialty(specialty)}</TableCell>
            <TableCell>{city}</TableCell>
            <TableCell>{phoneNumber}</TableCell>
            <TableCell>{experienceYears}</TableCell>
            <TableCell>{licenseNo}</TableCell>
            <TableCell>
              <Label
                variant="soft"
                color={
                  (status === 'active' && 'success') ||
                  (status === 'pending' && 'warning') ||
                  (status === 'banned' && 'error') ||
                  'default'
                }
              >
                {status}
              </Label>
            </TableCell>
          </>
        );

      case 'employee':
        return (
          <>
            <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar alt={fullName} src={avatarUrl?.preview || ''} sx={{ mr: 2 }} />
              <ListItemText primary={fullName} secondary={email} />
            </TableCell>
            <TableCell>{phoneNumber}</TableCell>
            <TableCell>{department}</TableCell>
            <TableCell>{position}</TableCell>
            <TableCell>{handleRenderSpecialty(specialty)}</TableCell>
            <TableCell>
              <Label
                variant="soft"
                color={
                  (status === 'active' && 'success') ||
                  (status === 'pending' && 'warning') ||
                  (status === 'banned' && 'error') ||
                  'default'
                }
              >
                {status}
              </Label>
            </TableCell>
          </>
        );

      default: // patient
        return (
          <>
            {/* Hiển thị Avatar và Họ tên + Email */}
            <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar alt={fullName} src={avatarUrl?.preview} sx={{ mr: 2 }} />
              <ListItemText primary={fullName} secondary={email} />
            </TableCell>
            <TableCell>{phoneNumber}</TableCell>
            <TableCell>{birthDate || '-'}</TableCell>
            {/* Hiển thị địa chỉ */}
            <TableCell>
              <Label
                variant="soft"
                color={(() => {
                  if (gender === 'male') return 'info';
                  if (gender === 'female') return 'error';
                  return 'default';
                })()}
              >
                {(() => {
                  switch (gender) {
                    case 'male':
                      return 'Nam';
                    case 'female':
                      return 'Nữ';
                    default:
                      return 'Khác';
                  }
                })()}
              </Label>
            </TableCell>
            <TableCell>{address}</TableCell>

            {/* Hiển thị lịch sử bệnh án */}
            <TableCell>
              {medicalHistory?.length > 0 ? (
                <Tooltip
                  title={medicalHistory
                    .map((item: any) => `${item.condition} (${item.diagnosisDate})`)
                    .join(', ')}
                >
                  <Typography
                    variant="body2"
                    sx={{ cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    {medicalHistory.length} bệnh án
                  </Typography>
                </Tooltip>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Không có
                </Typography>
              )}
            </TableCell>
            <TableCell>{_id}</TableCell>
            {/* Hiển thị trạng thái tài khoản */}
            <TableCell>
              <Label
                variant="soft"
                color={
                  (status === 'active' && 'success') ||
                  (status === 'pending' && 'warning') ||
                  (status === 'banned' && 'error') ||
                  'default'
                }
              >
                {status}
              </Label>
            </TableCell>
          </>
        );
    }
  };

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox checked={selected} onClick={onSelectRow} />
        </TableCell>

        {renderCells()}

        <TableCell align="right" sx={{ px: 1, whiteSpace: 'nowrap' }}>
          <Tooltip title="Sửa nhanh" placement="top" arrow>
            <IconButton color={quickEdit.value ? 'inherit' : 'default'} onClick={quickEdit.onTrue}>
              <Iconify icon="solar:pen-bold" />
            </IconButton>
          </Tooltip>

          <IconButton color={popover.open ? 'inherit' : 'default'} onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <UserQuickEditForm
        typeUser={typeUser as 'doctor' | 'employee' | 'patient'}
        currentUser={row}
        open={quickEdit.value}
        onClose={quickEdit.onFalse}
      />

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem
          onClick={() => {
            confirm.onTrue();
            popover.onClose();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold" />
          Xoá
        </MenuItem>

        {/* <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Chỉnh Sửa
        </MenuItem> */}
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value || false}
        onClose={confirm.onFalse}
        title={`Xoá người dùng ${
          {
            doctor: 'Bác Sĩ',
            employee: 'Nhân Viên',
            user: 'Người Dùng',
            patient: 'Bệnh Nhân',
          }[typeUser]
        }`}
        content="Bạn có chắc chắn muốn xoá chứ?"
        action={
          <Button variant="contained" color="error" onClick={onDeleteRow}>
            Xoá
          </Button>
        }
      />
    </>
  );
}
