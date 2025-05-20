import { keyframes } from '@mui/system'
import Typography from '@mui/material/Typography'
import { alpha, useTheme } from '@mui/material/styles'
import Stack, { StackProps } from '@mui/material/Stack'

import { bgGradient } from 'src/theme/css'

// ----------------------------------------------------------------------

const float = keyframes`
  0% {
    transform: translateY(0px);
  }
  50% {
    transform: translateY(-20px);
  }
  100% {
    transform: translateY(0px);
  }
`

const sitDown = keyframes`
  0% {
    transform: translateY(0) rotate(0deg) scale(1);
  }
  50% {
    transform: translateY(10px) rotate(5deg) scale(0.95);
  }
  100% {
    transform: translateY(20px) rotate(0deg) scale(0.9);
  }
`

const fadeInSlide = keyframes`
  0% {
    opacity: 0;
    transform: translateX(-20px);
  }
  100% {
    opacity: 1;
    transform: translateX(0);
  }
`

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    transform: translateY(20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`

type Props = StackProps & {
  title?: string
  description?: string
  img?: React.ReactNode
  action?: React.ReactNode
}

export default function AppWelcome({
  title,
  description,
  action,
  img,
  ...other
}: Props) {
  const theme = useTheme()

  return (
    <Stack
      flexDirection={{ xs: 'column', md: 'row' }}
      sx={{
        ...bgGradient({
          direction: '135deg',
          startColor: alpha(theme.palette.primary.light, 0.2),
          endColor: alpha(theme.palette.primary.main, 0.2)
        }),
        height: { md: 1 },
        borderRadius: 2,
        position: 'relative',
        color: 'primary.darker',
        backgroundColor: 'common.white'
      }}
      {...other}
    >
      <Stack
        flexGrow={1}
        justifyContent="center"
        alignItems={{ xs: 'center', md: 'flex-start' }}
        sx={{
          p: {
            xs: theme.spacing(5, 3, 0, 3),
            md: theme.spacing(5)
          },
          textAlign: { xs: 'center', md: 'left' }
        }}
      >
        <Typography
          variant="h4"
          sx={{
            mb: 2,
            whiteSpace: 'pre-line',
            animation: `${fadeInSlide} 0.8s ease-out`
          }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            opacity: 0.8,
            maxWidth: 360,
            mb: { xs: 3, xl: 5 },
            animation: `${fadeInSlide} 0.8s ease-out 0.2s`,
            animationFillMode: 'both'
          }}
        >
          {description}
        </Typography>

        {action && (
          <div
            style={{
              animation: `${fadeInUp} 0.8s ease-out 0.4s`,
              animationFillMode: 'both'
            }}
          >
            {action}
          </div>
        )}
      </Stack>

      {img && (
        <Stack
          component="span"
          justifyContent="center"
          sx={{
            p: { xs: 5, md: 3 },
            maxWidth: 360,
            mx: 'auto',
            animation: `${float} 6s ease-in-out infinite`,
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
              animation: `${sitDown} 0.5s ease-in-out forwards`,
              cursor: 'pointer',
              '& > *': {
                transform: 'scale(1.05)',
                transition: 'transform 0.3s ease-in-out'
              }
            }
          }}
        >
          {img}
        </Stack>
      )}
    </Stack>
  )
}
