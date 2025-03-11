import { Controller, useFormContext } from 'react-hook-form';

import TextField, { TextFieldProps } from '@mui/material/TextField';

// ----------------------------------------------------------------------

type Props = TextFieldProps & {
  name: string;
};

export default function RHFTextField({ name, helperText, type, ...other }: Props) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState: { error } }) => (
        <TextField
          {...field}
          fullWidth
          type={type}
          value={type === 'number' && field.value === 0 ? '' : field.value}
          onChange={(event) => {
            if (type === 'number') {
              field.onChange(Number(event.target.value));
            } else {
              field.onChange(event.target.value);
            }
          }}
          error={!!error}
          helperText={error ? error?.message : helperText}
          sx={{
            '& .MuiInputBase-root': {
              color: 'black', // Màu chữ bên trong input
              '& .MuiOutlinedInput-input': {
                color: 'black', // Màu chữ bên trong input khi focus
              },
            },
            '& .MuiInputLabel-root': {
              color: error ? '#f44336' : '#dfdfdf', // Màu của label khi bình thường

              '&.Mui-focused': {
                color: error ? '#f44336' : '#007bff', // Màu của label khi focus
              },
              '&.Mui-error': {
                color: '#f44336', // Màu của label khi lỗi
              },
            },
            '& .MuiFormLabel-root ': {
              color: 'black', // Màu chữ bên trong input
              '& .MuiOutlinedInput-input': {
                color: 'black', // Màu chữ bên trong input khi focus
              },
            },
            '& .MuiOutlinedInput-root': {
              '& .MuiOutlinedInput-input': {
                backgroundColor: 'white', // Nền mặc định
                '&:-webkit-autofill': {
                  WebkitBoxShadow: '0 0 0 100px white inset', // Màu nền khi autofill
                  WebkitTextFillColor: 'black', // Màu chữ khi autofill
                  transition: 'background-color 5000s ease-in-out 0s',
                },
              },
              '& fieldset': {
                borderColor: error ? '#f44336' : '#dfdfdf', // Màu viền mặc định và khi lỗi
              },
              '&:hover fieldset': {
                borderColor: error ? '#f44336' : '#007bff', // Màu viền khi hover
              },
              '&.Mui-focused fieldset': {
                borderColor: error ? '#f44336' : '#007bff', // Màu viền khi focus
                borderWidth: '2px', // Độ dày của viền khi focus
              },
            },
            '& .MuiFormHelperText-root': {
              color: error ? '#f44336' : 'black', // Màu của helper text khi có lỗi hoặc không
            },
          }}
          {...other}
        />
      )}
    />
  );
}
