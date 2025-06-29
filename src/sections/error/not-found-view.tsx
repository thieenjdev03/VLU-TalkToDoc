import { m } from 'framer-motion';

import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';

import { RouterLink } from 'src/routes/components';

import { PageNotFoundIllustration } from 'src/assets/illustrations';

import { varBounce, MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

export default function NotFoundView() {
  return (
    <MotionContainer>
      <m.div variants={varBounce().in}>
        <Typography variant="h3" sx={{ mb: 2 }}>
          Oops! Trang này không tồn tại
        </Typography>
      </m.div>

      <m.div variants={varBounce().in}>
        <Typography sx={{ color: 'text.secondary', mb: 3 }}>
          Có vẻ như trang bạn đang tìm kiếm đã được di chuyển hoặc không còn tồn tại. 
          Đừng lo lắng, hãy thử một trong những tùy chọn bên dưới để tiếp tục khám phá.
        </Typography>
      </m.div>

      <m.div variants={varBounce().in}>
        <PageNotFoundIllustration
          sx={{
            height: 260,
            my: { xs: 5, sm: 10 },
          }}
        />
      </m.div>

      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mt: 3 }}>
        <Button 
          component={RouterLink} 
          href="/dashboard" 
          size="large" 
          variant="contained"
          fullWidth={false}
        >
          Về trang chủ
        </Button>
        
      </Stack>
    </MotionContainer>
  );
}
