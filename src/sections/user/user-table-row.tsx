import moment from 'moment';

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

import { formatCurrencyVND } from 'src/utils/formatCurrency';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IUserItem } from 'src/types/user';

import UserQuickEditForm from './user-quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  row: IUserItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  typeUser: 'user' | 'doctor' | 'employee' | 'patient';
  hospitalList: any;
  ranking: any;
  onUpdateSuccess?: () => void;
  handleRefreshData: () => void;
};

export default function UserTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  typeUser,
  hospitalList,
  ranking,
  onUpdateSuccess,
  handleRefreshData,
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
  } = row;

  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();
  const hospitalOptions = hospitalList?.map((item: any) => ({
    value: item._id,
    label: item.name,
  }));

  const renderCells = () => {
    switch (typeUser) {
      case 'doctor':
        return (
          <>
            <TableCell>{id}</TableCell>
            <TableCell
              sx={{
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                justifyItems: 'center',
              }}
            >
              <Avatar alt={fullName} src={avatarUrl || ''} sx={{ mr: 2 }} />
              <ListItemText primary={fullName} secondary={email} />
            </TableCell>
            <TableCell>{hospital?.name || '-'}</TableCell>
            <TableCell>{rank?.name || '-'}</TableCell>

            <TableCell>
              {Array.isArray(specialty) && specialty.length > 0
                ? specialty.map((s, index) => <li key={index}>{s?.name || s}</li>)
                : '-'}
            </TableCell>
            <TableCell>{city?.name || '-'}</TableCell>
            <TableCell>{phoneNumber || '-'}</TableCell>
            <TableCell>{experienceYears ?? '-'}</TableCell>
            <TableCell>{licenseNo || '-'}</TableCell>
            <TableCell>
              <Checkbox checked={isActive} disabled />
            </TableCell>
          </>
        );

      case 'employee':
        return (
          <>
            <TableCell>{id}</TableCell>
            <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar alt={fullName} src={avatarUrl?.preview || ''} sx={{ mr: 2 }} />
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
        );

      default: // patient
        return (
          <>
            <TableCell>{id}</TableCell>
            <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar alt={fullName} src={avatarUrl?.preview} sx={{ mr: 2 }} />
              <ListItemText primary={fullName} secondary={email} />
            </TableCell>
            <TableCell>{phoneNumber}</TableCell>
            <TableCell>{moment(birthDate).format('l') || '-'}</TableCell>
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
            {/* Hiển thị trạng thái tài khoản */}
            <TableCell>
              <Checkbox checked={isActive} disabled />
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
        ranking={ranking}
        hospitalList={hospitalOptions}
        onUpdateSuccess={() => {
          quickEdit.onFalse();
          onUpdateSuccess?.();
        }}
        handleRefreshData={handleRefreshData}
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
          <Button
            variant="contained"
            color="error"
            onClick={() => {
              onDeleteRow(); // Changed from the incorrect syntax
              confirm.onFalse(); // This will close the modal
            }}
          >
            Xoá
          </Button>
        }
      />
    </>
  );
}
