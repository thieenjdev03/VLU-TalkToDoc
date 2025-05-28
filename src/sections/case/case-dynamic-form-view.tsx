import * as Yup from 'yup'
import { useForm, Controller } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'

import { Box, Card, Divider, TextField, Typography } from '@mui/material'

type Question = {
  key: string
  label: string
  type: 'text' | 'select' | 'textarea' | 'number'
  options?: (string | number)[]
  required?: boolean
}

export default function CaseDynamicFormView({
  config,
  medicalFormData
}: {
  config: Question[]
  medicalFormData: any
}) {
  const schemaFields = config.reduce(
    (acc, item) => {
      const base = Yup.string()
      const number = Yup.number()

      if (item.required) {
        acc[item.key] =
          item.type === 'number'
            ? number.required(`${item.label} không được để trống`)
            : base.required(`${item.label} không được để trống`)
      } else {
        acc[item.key] = item.type === 'number' ? number : base
      }

      return acc
    },
    {} as Record<string, any>
  )

  const schema = Yup.object().shape(schemaFields)

  const {
    control,
    formState: { errors }
  } = useForm({
    defaultValues: medicalFormData || {},
    resolver: yupResolver(schema),
    mode: 'onBlur'
  })

  return (
    <Card sx={{ mb: 3, p: 2, borderRadius: 2, boxShadow: 3 }}>
      <Typography variant="h6" sx={{ mb: 1 }}>
        Thông tin triệu chứng và câu hỏi
      </Typography>
      <Divider sx={{ my: 2 }} />

      <Box sx={{ maxWidth: 600, mt: 2 }}>
        {config.map(item => (
          <Controller
            key={item.key}
            name={item.key}
            control={control}
            render={({ field }) => (
              <Box mb={3}>
                <TextField
                  {...field}
                  label={item.label}
                  fullWidth
                  error={!!errors[item.key]}
                  helperText={
                    errors[item.key]?.message
                      ? String(errors[item.key]?.message)
                      : ''
                  }
                  type={item.type === 'number' ? 'number' : undefined}
                  multiline={item.type === 'textarea'}
                  minRows={item.type === 'textarea' ? 3 : undefined}
                  disabled
                  InputLabelProps={{ shrink: true }}
                />
              </Box>
            )}
          />
        ))}
      </Box>
    </Card>
  )
}
