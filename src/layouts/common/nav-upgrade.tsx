import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { useMockedUser } from 'src/hooks/use-mocked-user';

import Label from 'src/components/label';

// ----------------------------------------------------------------------

export default function NavUpgrade() {
  const { user } = useMockedUser();

  const handleShowRoleName = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Quản trị viên';
      case 'doctor':
        return 'Bác sĩ';
      case 'patient':
        return 'Bệnh nhân';
      default:
        return role;
    }
  };
  return (
    <Stack
      sx={{
        px: 2,
        py: 5,
        textAlign: 'center',
      }}
    >
      <Stack alignItems="center">
        <Box sx={{ position: 'relative' }}>
          <Avatar src={user?.photoURL} alt={user?.name} sx={{ width: 48, height: 48 }}>
            {user?.name?.charAt(0).toUpperCase()}
          </Avatar>

          <Label
            color="success"
            variant="filled"
            sx={{
              top: -6,
              px: 0.5,
              left: 40,
              height: 20,
              position: 'absolute',
              borderBottomLeftRadius: 2,
            }}
          >
            Online
          </Label>
        </Box>

        <Stack spacing={0.5} sx={{ mb: 2, mt: 1.5, width: 1 }}>
          <Typography variant="subtitle1" noWrap>
            {user?.name}
          </Typography>

          <Typography variant="body2" noWrap sx={{ color: 'text.disabled' }}>
            {user?.email}
          </Typography>

          <Typography variant="body2" noWrap sx={{ color: 'text.disabled' }}>
            Vai trò: {handleShowRoleName(user?.role.toLowerCase())}
          </Typography>
        </Stack>
      </Stack>
    </Stack>
  );
}
