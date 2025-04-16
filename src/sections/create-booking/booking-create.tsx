import moment from 'moment';
import { useState, useEffect } from 'react';

import { Button, Avatar, TextField, Typography } from '@mui/material';

import { useGetUsers } from 'src/api/user';

import { ISpecialtyItem } from 'src/types/specialties';

// ----------------------------------------------------------------------
import DynamicFormMUI from './DynamicFormMUI';
import formConfig from './common/formJson.json';
import SelectSpecialty from './select-specialty';
import BookingPayment from './BookingPaymentStep';
import BookingSelectTime from './BookingSelectTime';
import { createAppointment, updateAppointment } from './api';

type Props = {
  currentRanking?: any;
};

type FormValuesProps = {
  patientObject: any;
  doctorObject: any;
  specialtyObject: any;
  appointment: {
    date: string;
    slot: string;
    timezone: string;
    appointmentId: string;
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
export default function BookingCreate() {
  const [selected, setSelected] = useState<ISpecialtyItem | null>(null);
  const [currentStep, setCurrentStepState] = useState<string>(
    () => localStorage.getItem('booking_step') || 'select-specialty'
  );

  const { users: doctors } = useGetUsers({
    typeUser: 'doctor',
    query: '',
    page: 1,
    limit: 99,
    sortField: 'createdAt',
    sortOrder: 'desc',
  });

  const [formData, setFormData] = useState<FormValuesProps>({
    patientObject: null,
    doctorObject: null,
    specialtyObject: null,
    appointment: { date: '', slot: '', timezone: '' },
    medicalForm: { symptoms: '', pain_level: '' },
    payment: { platformFee: 0, doctorFee: 0, discount: 0, total: 0, paymentMethod: '' },
  });

  const setCurrentStep = (step: string, back?: boolean) => {
    if (back) {
      setCurrentStepState(step);
    } else {
      setCurrentStepState(step);
      localStorage.setItem('booking_step', step);
    }
  };
  useEffect(() => {
    localStorage.setItem('booking_form_data', JSON.stringify(formData));
    console.log('formData', formData);
  }, [formData]);

  useEffect(() => {
    console.log('current step', currentStep);
  }, [currentStep]);
  const handleSelect = (key: ISpecialtyItem) => {
    setSelected(key);
  };

  const handleSelectCurrentStep = (step: string) => {
    setCurrentStep(step);
  };
  const [currentAppointment, setCurrentAppointment] = useState<any>(null);
  const handleSubmit = async (data: FormValuesProps) => {
    const currentAppointmentStored = JSON.parse(
      localStorage.getItem('current_appointment') || '{}'
    );
    setFormData(data);
    if (data.specialtyObject && !currentAppointmentStored?._id) {
      const res = await createAppointment({
        specialty: data.specialtyObject._id,
        timezone: moment().format('Z'),
      });
      setCurrentAppointment(res);
      localStorage.setItem('current_appointment', JSON.stringify(res));
    } else {
      const formattedData = {
        medicalForm: data.medicalForm || currentAppointmentStored?.medicalForm || {},
        patient: data.patientObject?._id || currentAppointmentStored?.patient || '',
        doctor: data.doctorObject?._id || currentAppointmentStored?.doctor || '',
        specialty: data.specialtyObject?._id || currentAppointmentStored?.specialty || '',
        slot: data.appointment?.slot || '',
        date: data.appointment?.date || '',
        payment: data.payment || currentAppointmentStored?.payment || {},
      };
      const res = await updateAppointment({
        appointmentId: currentAppointmentStored?._id || '',
        data: formattedData,
      });
      localStorage.setItem('current_appointment', JSON.stringify(res));
      setCurrentAppointment(res);
    }
  };
  useEffect(() => {
    console.log('formData', formData);
  }, [formData]);
  return (
    <>
      {currentStep === 'select-specialty' && (
        <SelectSpecialty
          handleSelectCurrentStep={handleSelectCurrentStep}
          onSelect={handleSelect}
          formData={formData}
          setCurrentStep={setCurrentStep}
          handleSubmit={handleSubmit}
        />
      )}
      {currentStep === 'medical-form' && (
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
          handleSubmit={handleSubmit}
        />
      )}
      {currentStep === 'select-time-booking' && (
        <BookingSelectTime
          doctors={doctors}
          setCurrentStep={(step) => setCurrentStep('confirm-payment-step')}
          handleSubmit={handleSubmit}
          formData={formData}
        />
      )}
      {currentStep === 'confirm-payment-step' && (
        <BookingPayment
          setCurrentStep={setCurrentStep}
          specialty={selected as ISpecialtyItem}
          formData={formData}
          handleSubmit={handleSubmit}
        />
      )}
      {currentStep === 'payment-step' && (
        <BookingConfirmPayment
          setCurrentStep={setCurrentStep}
          specialty={selected as ISpecialtyItem}
          formData={formData}
          handleSubmit={handleSubmit}
        />
      )}
      {currentStep === 'payment-completed' && (
        <BookingPaymentCompleted
          setCurrentStep={setCurrentStep}
          formData={formData}
          handleSubmit={handleSubmit}
        />
      )}
    </>
  );
}
function BookingConfirmPayment({ setCurrentStep }: { setCurrentStep: any }) {
  const [method, setMethod] = useState('credit');

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT: Payment Gateway */}
      <div className="border rounded-xl p-6 shadow-sm space-y-6 bg-white">
        <h4 className="text-lg font-semibold text-gray-800">Thanh Toán Bằng: {method}</h4>

        {method === 'credit' && (
          <div className="space-y-4 text-sm flex flex-col gap-2">
            <TextField fullWidth label="Card Holder Name" />
            <TextField fullWidth label="Card Number" />
            <div className="flex gap-4">
              <TextField fullWidth label="Expire Date" />
              <TextField fullWidth label="CVV" />
            </div>
          </div>
        )}
      </div>
      <div className="border rounded-xl p-6 shadow-sm bg-white space-y-4">
        <div className="flex items-center gap-4">
          <Avatar
            src="https://randomuser.me/api/portraits/men/11.jpg"
            sx={{ width: 56, height: 56 }}
          />
          <div>
            <Typography fontWeight="bold">Dr. Michael Brown</Typography>
            <Typography variant="body2" color="primary">
              Psychologist
            </Typography>
            <Typography variant="body2" className="text-gray-600">
              📍 1011 W 5th St, Suite 120, Austin, TX
            </Typography>
          </div>
        </div>

        <div>
          <p className="font-semibold text-gray-700">Date & Time</p>
          <p className="text-sm text-gray-600">10:00 - 11:00 AM, 15 Oct 2025</p>
          <p className="font-semibold text-gray-700 mt-2">Appointment Type</p>
          <p className="text-sm text-gray-600">Clinic (Wellness Path)</p>
        </div>

        <div className="border-t pt-4 space-y-2 text-sm text-gray-700">
          <div className="flex justify-between">
            <span>Echocardiograms</span>
            <span>$200</span>
          </div>
          <div className="flex justify-between">
            <span>Booking Fees</span>
            <span>$20</span>
          </div>
          <div className="flex justify-between">
            <span>Tax</span>
            <span>$18</span>
          </div>
          <div className="flex justify-between text-red-500">
            <span>Discount</span>
            <span>-$15</span>
          </div>
          <div className="flex justify-between font-bold text-lg text-blue-600 border-t pt-2">
            <span>Total</span>
            <span>$223</span>
          </div>
        </div>
      </div>

      <div className="col-span-1 lg:col-span-2 flex justify-between mt-6">
        <Button variant="outlined" onClick={() => setCurrentStep('select-time-booking', true)}>
          Trở về
        </Button>
        <Button variant="contained" onClick={() => setCurrentStep('payment-completed')}>
          Thanh Toán
        </Button>
      </div>
    </div>
  );
}
function BookingPaymentCompleted({ setCurrentStep }: { setCurrentStep: any }) {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-white text-center p-6">
      <h2 className="text-2xl font-bold text-gray-800 mt-4">Thanh toán thành công!</h2>
      <p className="text-sm text-gray-600 mt-2 max-w-md">
        Cảm ơn bạn đã đặt lịch khám với TalkToDoc. Email xác nhận lịch hẹn và hướng dẫn chi tiết đã
        được gửi đến bạn. Vui lòng kiểm tra email để biết thêm thông tin.
      </p>

      <div className="flex gap-4 mt-8">
        <Button
          variant="outlined"
          color="primary"
          onClick={() => setCurrentStep('select-specialty')}
        >
          Đặt lịch mới
        </Button>
        <Button
          variant="contained"
          color="primary"
          href="/dashboard" // hoặc thay bằng route thật của bạn
        >
          Về trang chính
        </Button>
      </div>
    </div>
  );
}
