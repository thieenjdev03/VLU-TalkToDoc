import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import ListItemText from '@mui/material/ListItemText';

import { useBoolean } from 'src/hooks/use-boolean';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';
import { ConfirmDialog } from 'src/components/custom-dialog';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IUserItem } from 'src/types/user';

import UserQuickEditForm from './user-quick-edit-form';

// ----------------------------------------------------------------------

type Props = {
  selected: boolean;
  onEditRow: VoidFunction;
  row: IUserItem;
  onSelectRow: VoidFunction;
  onDeleteRow: VoidFunction;
  typeUser: 'user' | 'doctor' | 'employee';
};

export default function UserTableRow({
  row,
  selected,
  onEditRow,
  onSelectRow,
  onDeleteRow,
  typeUser,
}: Props) {
  const {
    fullName,
    avatarUrl,
    status,
    email,
    phoneNumber,
    company,
    role,
    hospitalId,
    rank,
    specialty,
    city,
    experienceYears,
    licenseNo,
  } = row;

  const confirm = useBoolean();
  const quickEdit = useBoolean();
  const popover = usePopover();

  const handleRenderSpecialty = (listSpecialty: string[]) => {
    const specialtyList = [
      { specialtyId: 'sp001', name: 'Nội khoa', description: 'Chuyên khoa Nội tổng quát' },
      { specialtyId: 'sp002', name: 'Ngoại khoa', description: 'Chuyên khoa Ngoại tổng quát' },
      { specialtyId: 'sp003', name: 'Sản phụ khoa', description: 'Chuyên khoa phụ nữ và sản khoa' },
      { specialtyId: 'sp004', name: 'Tim mạch', description: 'Chuyên khoa Tim mạch' },
      { specialtyId: 'sp005', name: 'Thần kinh', description: 'Chuyên khoa Thần kinh' },
    ];
    const specialtyId = specialtyList.filter((s) => listSpecialty.includes(s.specialtyId));
    if (specialtyId.length === 0) return '-';
    return specialtyId.map((item) => item.name).join(', ');
  };

  const handleRenderHospital = (listHospital: string) => {
    const _hospitalIds = [
      { hospitalId: 'h001', name: 'Bệnh viện Chợ Rẫy' },
      { hospitalId: 'h002', name: 'Bệnh viện Bạch Mai' },
      { hospitalId: 'h003', name: 'Bệnh viện Đại học Y Dược' },
      { hospitalId: 'h004', name: 'Bệnh viện Nhân Dân 115' },
      { hospitalId: 'h005', name: 'Bệnh viện Hữu Nghị Việt Đức' },
      { hospitalId: 'h006', name: 'Bệnh viện Đa khoa Xuyên Á' },
      { hospitalId: 'h007', name: 'Bệnh viện Ung bướu TP.HCM' },
      { hospitalId: 'h008', name: 'Bệnh viện Đa khoa An Bình' },
      { hospitalId: 'h009', name: 'Bệnh viện Chấn thương Chỉnh hình' },
      { hospitalId: 'h010', name: 'Bệnh viện Đa khoa Medlatec' },
      { hospitalId: 'h011', name: 'Bệnh viện Thống Nhất' },
      { hospitalId: 'h012', name: 'Bệnh viện Đa khoa Quốc tế Thu Cúc' },
      { hospitalId: 'h013', name: 'Bệnh viện Đa khoa Hồng Ngọc' },
      { hospitalId: 'h014', name: 'Bệnh viện Mắt Sài Gòn' },
      { hospitalId: 'h015', name: 'Bệnh viện Phạm Ngọc Thạch' },
      { hospitalId: 'h016', name: 'Bệnh viện Đa khoa Hoàn Mỹ' },
      { hospitalId: 'h017', name: 'Bệnh viện Tim Hà Nội' },
      { hospitalId: 'h018', name: 'Bệnh viện Răng Hàm Mặt Trung ương' },
      { hospitalId: 'h019', name: 'Bệnh viện Quốc tế City' },
      { hospitalId: 'h020', name: 'Bệnh viện Đa khoa Xuyên Á (Chi nhánh)' },
      { hospitalId: 'h021', name: 'Bệnh viện Ung bướu TP.HCM (Chi nhánh)' },
      { hospitalId: 'h022', name: 'Bệnh viện Đa khoa An Bình (Chi nhánh)' },
      { hospitalId: 'h023', name: 'Bệnh viện Chấn thương Chỉnh hình (Chi nhánh)' },
      { hospitalId: 'h024', name: 'Bệnh viện Đa khoa Medlatec (Chi nhánh)' },
      { hospitalId: 'h025', name: 'Bệnh viện Thống Nhất (Chi nhánh)' },
      { hospitalId: 'h026', name: 'Bệnh viện Đa khoa Quốc tế Thu Cúc (Chi nhánh)' },
      { hospitalId: 'h027', name: 'Bệnh viện Đa khoa Hồng Ngọc (Chi nhánh)' },
      { hospitalId: 'h028', name: 'Bệnh viện Mắt Sài Gòn (Chi nhánh)' },
      { hospitalId: 'h029', name: 'Bệnh viện Phạm Ngọc Thạch (Chi nhánh)' },
      { hospitalId: 'h030', name: 'Bệnh viện Đa khoa Hoàn Mỹ (Chi nhánh)' },
      { hospitalId: 'h031', name: 'Bệnh viện Tim Hà Nội (Chi nhánh)' },
      { hospitalId: 'h032', name: 'Bệnh viện Răng Hàm Mặt Trung ương (Chi nhánh)' },
      { hospitalId: 'h033', name: 'Bệnh viện Quốc tế City (Chi nhánh)' },
      { hospitalId: 'h034', name: 'Bệnh viện Đa khoa Xuyên Á (Chi nhánh 2)' },
      { hospitalId: 'h035', name: 'Bệnh viện Ung bướu TP.HCM (Chi nhánh 2)' },
      { hospitalId: 'h036', name: 'Bệnh viện Đa khoa An Bình (Chi nhánh 2)' },
      { hospitalId: 'h037', name: 'Bệnh viện Chấn thương Chỉnh hình (Chi nhánh 2)' },
    ];
    const _hospitalId = _hospitalIds.filter((h) => listHospital.includes(h.hospitalId));
    if (_hospitalId.length === 0) return '-';
    return _hospitalId.map((item) => item.name).join(', ');
  };

  const renderCells = () => {
    switch (typeUser) {
      case 'doctor':
        return (
          <>
            <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                alt={fullName}
                src={typeof avatarUrl === 'string' ? avatarUrl : ''}
                sx={{ mr: 2 }}
              />
              <ListItemText primary={fullName} secondary={email} />
            </TableCell>
            <TableCell>{handleRenderHospital(hospitalId)}</TableCell>
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
              <Avatar
                alt={fullName}
                src={typeof avatarUrl === 'string' ? avatarUrl : ''}
                sx={{ mr: 2 }}
              />
              <ListItemText primary={fullName} secondary={email} />
            </TableCell>
            <TableCell>{phoneNumber}</TableCell>
            <TableCell>{hospitalId}</TableCell>
            <TableCell>{role}</TableCell>
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

      default: // user
        return (
          <>
            <TableCell sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar
                alt={fullName}
                src={typeof avatarUrl === 'string' ? avatarUrl : ''}
                sx={{ mr: 2 }}
              />
              <ListItemText primary={fullName} secondary={email} />
            </TableCell>
            <TableCell>{phoneNumber}</TableCell>
            <TableCell>{company}</TableCell>
            <TableCell>{role}</TableCell>
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
          <Tooltip title="Quick Edit" placement="top" arrow>
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

        <MenuItem
          onClick={() => {
            onEditRow();
            popover.onClose();
          }}
        >
          <Iconify icon="solar:pen-bold" />
          Chỉnh Sửa
        </MenuItem>
      </CustomPopover>

      <ConfirmDialog
        open={confirm.value}
        onClose={confirm.onFalse}
        title={`Xoá người dùng ${
          {
            doctor: 'Bác Sĩ',
            employee: 'Nhân Viên',
            user: 'Bệnh Nhân',
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
