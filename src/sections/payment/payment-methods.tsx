import { useState, useCallback } from 'react'

import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import ListItemText from '@mui/material/ListItemText'
import Paper, { PaperProps } from '@mui/material/Paper'

import Iconify from 'src/components/iconify'

// ----------------------------------------------------------------------

const PAYMENT_OPTIONS = [
  {
    value: 'vnqr',
    label: 'VNQR Pay'
  },
  {
    value: 'wallet',
    label: 'Ví hệ thống'
  }
]

// ----------------------------------------------------------------------

export default function PaymentMethods() {
  const [method, setMethod] = useState('vnqr')

  const handleChangeMethod = useCallback((newValue: string) => {
    setMethod(newValue)
  }, [])

  return (
    <Stack spacing={2} sx={{ width: '100%' }}>
      <h3 className="text-lg font-semibold text-gray-800">
        Phương thức thanh toán:
      </h3>
      <Stack spacing={3}>
        {PAYMENT_OPTIONS.map(option => (
          <OptionItem
            key={option.label}
            option={option}
            selected={method === option.value}
            onClick={() => handleChangeMethod(option.value)}
          />
        ))}
      </Stack>
    </Stack>
  )
}

// ----------------------------------------------------------------------

type OptionItemProps = PaperProps & {
  option: {
    value: string
    label: string
  }
  selected: boolean
}

function OptionItem({ option, selected, ...other }: OptionItemProps) {
  const { value, label } = option

  const renderIcon = () => {
    switch (value) {
      case 'vnqr':
        return <Iconify icon="solar:qr-code-bold" width={24} />
      case 'wallet':
        return <Iconify icon="mdi:wallet" width={24} />
      default:
        return null
    }
  }

  return (
    <Paper
      variant="outlined"
      key={value}
      sx={{
        p: 2.5,
        cursor: 'pointer',
        ...(selected && {
          boxShadow: theme => `0 0 0 2px ${theme.palette.primary.main}`
        })
      }}
      {...other}
    >
      <ListItemText
        primary={
          <Stack direction="row" alignItems="center" className="w-full">
            <Iconify
              icon={
                selected
                  ? 'eva:checkmark-circle-2-fill'
                  : 'eva:radio-button-off-fill'
              }
              width={24}
              sx={{
                mr: 2,
                color: selected ? 'primary.main' : 'text.secondary'
              }}
            />

            <Box component="span" sx={{ flexGrow: 1 }}>
              {label}
            </Box>

            {renderIcon()}
          </Stack>
        }
        primaryTypographyProps={{ typography: 'subtitle2' }}
      />
    </Paper>
  )
}
