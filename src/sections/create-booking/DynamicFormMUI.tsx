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
  formData,
  handleSubmit,
}: {
  config: Question[];
  setCurrentStep: (step: string, back?: boolean) => void;
  onSelect: (key: ISpecialtyItem) => void;
  specialty: ISpecialtyItem;
  formData: any;
  handleSubmit: (data: any) => void;
}) {
  const schemaFields = config.reduce(
    (acc, item) => {
      const base = Yup.string();
      const number = Yup.number();

      if (item.required) {
        acc[item.key] =
          item.type === 'number'
            ? number.required(`${item.label} không được để trống`)
            : base.required(`${item.label} không được để trống`);
      } else {
        acc[item.key] = item.type === 'number' ? number : base;
      }

      return acc;
    },
    {} as Record<string, any>
  );

  const schema = Yup.object().shape(schemaFields);

  const {
    control,
    handleSubmit: formSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: formData.medicalForm,
    resolver: yupResolver(schema),
  });

  const userPatient = localStorage.getItem('userProfile');
  const onSubmit = (data: any) => {
    if (JSON.parse(userPatient || '{}')?.role === 'PATIENT') {
      const caseData = {
        ...data,
        rawJson: {
          answers: data,
        },
        specialty: specialty._id,
        patient: userPatient,
      };
      localStorage.setItem('booking_form_data_1', JSON.stringify(caseData));
      formData.answers = data;
    }
    const currentAppointment = JSON.parse(localStorage.getItem('current_appointment') || '{}');
    handleSubmit({
      ...currentAppointment,
      medicalForm: {
        data,
      },
    });

    setCurrentStep('select-time-booking');
  };

  return (
    <Box
      component="form"
      onSubmit={formSubmit(onSubmit)}
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
              <TextField
                {...field}
                label={item.label}
                fullWidth
                error={!!errors[item.key]}
                helperText={errors[item.key]?.message ? String(errors[item.key]?.message) : ''}
                type={item.type === 'number' ? 'number' : undefined}
                select={item.type === 'select'}
                multiline={item.type === 'textarea'}
                minRows={item.type === 'textarea' ? 3 : undefined}
              >
                {item.type === 'select' &&
                  item.options?.map((opt) => (
                    <MenuItem key={String(opt)} value={String(opt)}>
                      {opt}
                    </MenuItem>
                  ))}
              </TextField>
            </Box>
          )}
        />
      ))}

      <div className="flex gap-4 justify-between">
        <Button
          onClick={() => {
            setCurrentStep('select-specialty', true);
            localStorage.setItem('booking_step', 'select-specialty');
            onSelect({} as ISpecialtyItem);
          }}
          type="button"
          variant="outlined"
          color="primary"
        >
          Trở Về
        </Button>
        <Button type="submit" variant="contained" color="primary">
          Tiếp Tục
        </Button>
      </div>
    </Box>
  );
}
