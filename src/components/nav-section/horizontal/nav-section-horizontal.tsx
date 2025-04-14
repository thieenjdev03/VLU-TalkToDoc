import { memo } from 'react';

import Stack from '@mui/material/Stack';

import NavList from './nav-list';
import { NavProps, NavGroupProps } from '../types';

// ----------------------------------------------------------------------

function NavSectionHorizontal({ data, slotProps, sx, ...other }: NavProps) {
  console.log(data);
  return (
    <Stack
      component="nav"
      id="nav-section-horizontal"
      direction="row"
      alignItems="center"
      spacing={`${slotProps?.gap || 6}px`}
      sx={{
        mx: 'auto',
        ...sx,
      }}
      {...other}
    >
      {data.map(
        (group, index) =>
          !group.hidden && (
            <Group key={group.subheader || index} items={group.items} slotProps={slotProps} />
          )
      )}
    </Stack>
  );
}

export default memo(NavSectionHorizontal);

// ----------------------------------------------------------------------

function Group({ items, slotProps, hidden }: NavGroupProps & { hidden?: boolean }) {
  return (
    <>
      {items.map((list) => (
        <NavList
          hidden={list.hidden}
          key={list.title}
          data={list}
          depth={1}
          slotProps={slotProps}
        />
      ))}
    </>
  );
}
