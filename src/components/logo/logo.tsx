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
          display: 'inline-flex',
          ...sx,
        }}
        {...other}
      >
        <img
          src="https://res.cloudinary.com/dut4zlbui/image/upload/v1741615997/tuw1thbedrzcp17iv34p.png"
          alt="logo"
          style={{ width: '200px', height: 'auto' }}
        />
      </Box>
    );

    if (disabledLink) {
      return logo;
    }

    return (
      <Link component={RouterLink} href="/dashboard" sx={{ display: 'contents' }}>
        {logo}
      </Link>
    );
  }
);

export default Logo;
