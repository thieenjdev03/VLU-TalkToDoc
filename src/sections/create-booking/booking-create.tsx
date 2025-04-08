import { useState } from 'react';

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
  name: string;
  description?: string;
  isActive: boolean;
  base_price?: number;
};

export default function RankingNewEditForm({ currentRanking }: Props) {
  const [selected, setSelected] = useState<ISpecialtyItem | null>(null);
  const [currentStep, setCurrentStep] = useState<String>('select-specialty');
  const { users: doctors } = useGetUsers({
    typeUser: 'doctor',
    query: '',
    page: 1,
    limit: 99,
    sortField: 'createdAt',
    sortOrder: 'desc',
  });
  const handleSelect = (key: any) => {
    setSelected(key);
  };
  console.log('doctors', doctors);
  const handleSelectCurrentStep = (step: string) => {
    setCurrentStep(step);
  };
  return (
    <>
      {currentStep === 'select-specialty' &&
        (!selected ? (
          <SelectSpecialty
            handleSelectCurrentStep={handleSelectCurrentStep}
            onSelect={handleSelect}
          />
        ) : (
          <DynamicFormMUI
            setCurrentStep={setCurrentStep}
            onSelect={handleSelect}
            specialty={selected}
            config={
              formConfig
                .find((item) => item?.specialty_id === selected?.id)
                ?.fields?.map((field) => ({
                  ...field,
                  type: field.type as 'text' | 'select' | 'textarea' | 'number',
                })) || []
            }
          />
        ))}
      {currentStep === 'select-time-booking' && (
        <BookingSelectTime
          doctors={doctors}
          setCurrentStep={(step) => setCurrentStep('payment-step')}
        />
      )}
      {currentStep === 'payment-step' && (
        <BookingPayment setCurrentStep={setCurrentStep} specialty={selected} />
      )}
      {currentStep === 'payment-completed ' && (
        <BookingPaymentCompleted setCurrentStep={setCurrentStep} />
      )}
    </>
  );
}

function BookingPaymentCompleted({ setCurrentStep }: { setCurrentStep: any }) {
  return <div>BookingPaymentCompleted</div>;
}
