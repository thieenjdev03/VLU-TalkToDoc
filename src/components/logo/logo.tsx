import { forwardRef } from 'react';

import Link from '@mui/material/Link';
import Box, { BoxProps } from '@mui/material/Box';

import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

export interface LogoProps extends BoxProps {
  disabledLink?: boolean;
}

const Logo = forwardRef<HTMLDivElement, LogoProps>(
  ({ disabledLink = false, sx, ...other }, ref) => {
    const logo = (
      <Box
        ref={ref}
        component="div"
        sx={{
          display: 'flex',
          alignItems: 'center',
          margin: '0',
          justifyContent: 'center',
        }}
        {...other}
      >
        <img
          src="https://res.cloudinary.com/dut4zlbui/image/upload/v1746366836/geiw8b1qgv3w7sia9o4h.png"
          alt="logo"
          style={{ width: '240px', height: 'auto' }}
        />
      </Box>
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <Link
        component={RouterLink}
        href="/dashboard"
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0' }}
      >
        {logo}
      </Link>
    );
  }
);

export default Logo;
