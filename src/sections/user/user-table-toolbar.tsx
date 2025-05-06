import { useCallback } from 'react';

import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import { SelectChangeEvent } from '@mui/material/Select';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import CustomPopover, { usePopover } from 'src/components/custom-popover';

import { IUserTableFilters, IUserTableFilterValue } from 'src/types/user';

// ----------------------------------------------------------------------

type Props = {
  filters: IUserTableFilters;
  onFilters: (name: string, value: IUserTableFilterValue) => void;
  roleOptions: string[];
  searchValue?: string;
  onSearchChange?: (query: string) => void;
  typeUser: 'user' | 'doctor' | 'employee' | 'patient';
};

export default function UserTableToolbar({
  filters,
  onFilters,
  roleOptions,
  searchValue = '',
  onSearchChange,
  typeUser,
}: Props) {
  const popover = usePopover();

  const handleFilterQuery = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const query = event.target.value;
      // Call onSearchChange for API search if provided
      if (onSearchChange) {
        onSearchChange(query);
      }
      onFilters('fullName', query);
    },
    [onFilters, onSearchChange]
  );

  const handleFilterSpecialty = useCallback(
    (event: SelectChangeEvent<string[]>) => {
      onFilters(
        'specialty',
        typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value
      );
    },
    [onFilters]
  );
  const renderTextForFilter = () => {
    if (typeUser === 'user') {
      return 'Người dùng';
    }
    if (typeUser === 'doctor') {
      return 'Chuyên Khoa';
    }
    if (typeUser === 'employee') {
      return 'Bộ Phận';
    }
    if (typeUser === 'patient') {
      return '';
    }
    return 'Chuyên khoa';
  };
  return (
    <>
      <Stack
        spacing={2}
        alignItems={{ xs: 'flex-end', md: 'center' }}
        direction={{
          xs: 'column',
          md: 'row',
        }}
        sx={{
          p: 2.5,
          pr: { xs: 2.5, md: 1 },
        }}
      >
        {/* Dropdown chọn chuyên khoa
        {typeUser === 'patient' || typeUser === 'user' ? (
          <div />
        ) : (
          // <FormControl
          //   sx={{
          //     flexShrink: 0,
          //     width: { xs: 1, md: 200 },
          //   }}
          // >
          //   <InputLabel>{renderTextForFilter()}</InputLabel>

          //   <Select
          //     multiple
          //     value={filters.specialty}
          //     onChange={handleFilterSpecialty}
          //     input={<OutlinedInput label="Chuyên Khoa" />}
          //     renderValue={(selected) => selected.map((value) => value).join(', ')}
          //     MenuProps={{
          //       PaperProps: {
          //         sx: { maxHeight: 240 },
          //       },
          //     }}
          //   >
          //     {roleOptions.map((option) => (
          //       <MenuItem key={option} value={option}>
          //         <Checkbox
          //           disableRipple
          //           size="small"
          //           checked={filters.specialty.includes(option)}
          //         />
          //         {option}
          //       </MenuItem>
          //     ))}
          //   </Select>
          // </FormControl>
        )} */}

        {/* Ô tìm kiếm */}
        <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
          <TextField
            fullWidth
            value={searchValue || filters.fullName}
            onChange={handleFilterQuery}
            placeholder="Tìm kiếm..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
                </InputAdornment>
              ),
            }}
          />

          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </Stack>
      </Stack>

      <CustomPopover
        open={popover.open}
        onClose={popover.onClose}
        arrow="right-top"
        sx={{ width: 140 }}
      >
        <MenuItem onClick={popover.onClose}>
          <Iconify icon="solar:printer-minimalistic-bold" />
          Print
        </MenuItem>

        <MenuItem onClick={popover.onClose}>
          <Iconify icon="solar:import-bold" />
          Import
        </MenuItem>

        <MenuItem onClick={popover.onClose}>
          <Iconify icon="solar:export-bold" />
          Export
        </MenuItem>
      </CustomPopover>
    </>
  );
}
