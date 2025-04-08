import * as Yup from 'yup';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';

import { Box, Button, MenuItem, TextField } from '@mui/material';

import { ISpecialtyItem } from 'src/types/specialties';

type Question = {
  key: string;
  label: string;
  type: 'text' | 'select' | 'textarea' | 'number';
  options?: (string | number)[];
  required?: boolean;
};

export default function DynamicFormMUI({
  config,
  setCurrentStep,
  onSelect,
  specialty,
}: {
  config: Question[];
  setCurrentStep: (step: string) => void;
  onSelect: (key: string) => void;
  specialty: ISpecialtyItem;
}) {
  const schemaFields = config.reduce(
    (acc, item) => {
      const base = Yup.string();
      const number = Yup.number();

      if (item.required) {
        if (item.type === 'number') {
          acc[item.key] = number.required(`${item.label} không được để trống`);
        } else {
          acc[item.key] = base.required(`${item.label} không được để trống`);
        }
      } else if (item.type === 'number') {
        acc[item.key] = number;
      } else {
        acc[item.key] = base;
      }

      return acc;
    },
    {} as Record<string, any>
  );

  const schema = Yup.object().shape(schemaFields);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {},
    resolver: yupResolver(schema),
  });
  const userPatient = localStorage.getItem('userProfile');
  const onSubmit = (data: any) => {
    if (JSON.parse(userPatient || '{}')?.role === 'PATIENT') {
      const case_data = {
        ...data,
        rawJson: {
          answers: data,
        },
        specialty,
        patient: userPatient,
      };
      // Lưu vào localStorage
      localStorage.setItem('booking_form_data_1', JSON.stringify(case_data));
    }

    // Đi tiếp
    setCurrentStep('select-time-booking');
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}
    >
      <h2 className="text-xl font-bold mb-4">Trả lời các câu hỏi bên dưới để đến bước tiếp theo</h2>
      {config.map((item) => (
        <Controller
          key={item.key}
          name={item.key}
          control={control}
          render={({ field }) => (
            <Box mb={3}>
              {item.type === 'text' && (
                <TextField
                  {...field}
                  label={item.label}
                  fullWidth
                  error={!!errors[item.key]}
                  helperText={errors[item.key]?.message}
                />
              )}

              {item.type === 'number' && (
                <TextField
                  {...field}
                  label={item.label}
                  fullWidth
                  type="number"
                  error={!!errors[item.key]}
                  helperText={errors[item.key]?.message}
                />
              )}

              {item.type === 'select' && (
                <TextField
                  {...field}
                  select
                  label={item.label}
                  fullWidth
                  error={!!errors[item.key]}
                  helperText={errors[item.key]?.message}
                >
                  {item.options?.map((opt) => (
                    <MenuItem key={String(opt)} value={String(opt)}>
                      {opt}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              {item.type === 'textarea' && (
                <TextField
                  {...field}
                  label={item.label}
                  fullWidth
                  multiline
                  minRows={3}
                  error={!!errors[item.key]}
                  helperText={errors[item.key]?.message}
                />
              )}
            </Box>
          )}
        />
      ))}

      <div className="flex gap-4 justify-between">
        <Button
          onClick={() => {
            setCurrentStep('select-specialty');
            onSelect('');
          }}
          type="button"
          variant="outlined"
          color="primary"
        >
          Trở Về
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Tiếp Theo
        </Button>
      </div>
    </Box>
  );
}
