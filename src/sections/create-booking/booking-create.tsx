import { useState, useEffect } from 'react';

import { useGetUsers } from 'src/api/user';

import { ISpecialtyItem } from 'src/types/specialties';

// ----------------------------------------------------------------------
import DynamicFormMUI from './DynamicFormMUI';
import formConfig from './common/formJson.json';
import SelectSpecialty from './select-specialty';
import BookingPayment from './BookingPaymentStep';
import BookingSelectTime from './BookingSelectTime';

type Props = {
  currentRanking?: any;
};

type FormValuesProps = {
  patientId: string;
  doctorId: string;
  specialtyId: string;
  booking: {
    date: string;
    slot: string;
    timezone: string;
  };
  medicalForm: {
    symptoms: string;
    pain_level: string;
  };
  payment: {
    platformFee: number;
    doctorFee: number;
    discount: number;
    total: number;
    paymentMethod: string;
  };
};

export default function RankingNewEditForm({ currentRanking }: Props) {
  const [selected, setSelected] = useState<ISpecialtyItem | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('select-specialty');
  const { users: doctors } = useGetUsers({
    typeUser: 'doctor',
    query: '',
    page: 1,
    limit: 99,
    sortField: 'createdAt',
    sortOrder: 'desc',
  });

  const [formData, setFormData] = useState<FormValuesProps>({
    patientId: '',
    doctorId: '',
    specialtyId: '',
    booking: { date: '', slot: '', timezone: '' },
    medicalForm: { symptoms: '', pain_level: '' },
    payment: { platformFee: 0, doctorFee: 0, discount: 0, total: 0, paymentMethod: '' },
  });

  useEffect(() => {
    console.log('formData', formData);
  }, [formData]);

  const handleSelect = (key: ISpecialtyItem) => {
    setSelected(key);
  };

  const handleSelectCurrentStep = (step: string) => {
    setCurrentStep(step);
  };

  const handleSubmit = (formData: FormValuesProps) => {
    // Submit the formData to the API
    setFormData(formData);
  };

  return (
    <>
      {currentStep === 'select-specialty' &&
        (!selected ? (
          <SelectSpecialty
            handleSelectCurrentStep={handleSelectCurrentStep}
            onSelect={handleSelect}
            formData={formData}
          />
        ) : (
          <DynamicFormMUI
            setCurrentStep={setCurrentStep}
            onSelect={handleSelect}
            specialty={selected as ISpecialtyItem}
            config={
              formConfig
                .find((item) => item?.specialty_id === selected?.id)
                ?.fields?.map((field) => ({
                  ...field,
                  type: field.type as 'text' | 'select' | 'textarea' | 'number',
                })) || []
            }
            formData={formData}
          />
        ))}
      {currentStep === 'select-time-booking' && (
        <BookingSelectTime
          doctors={doctors}
          setCurrentStep={(step) => setCurrentStep('payment-step')}
        />
      )}
      {currentStep === 'payment-step' && (
        <BookingPayment setCurrentStep={setCurrentStep} specialty={selected} formData={formData} />
      )}
      {currentStep === 'payment-completed' && (
        <BookingPaymentCompleted setCurrentStep={setCurrentStep} formData={formData} />
      )}
    </>
  );
}

function BookingPaymentCompleted({ setCurrentStep }: { setCurrentStep: any }) {
  return <div>BookingPaymentCompleted</div>;
}
