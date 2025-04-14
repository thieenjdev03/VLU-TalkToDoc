'use client';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';
import Select, { components as selectComponents } from 'react-select';

import { Avatar, Button, Typography } from '@mui/material';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar, LocalizationProvider } from '@mui/x-date-pickers';

import { IUserItem } from 'src/types/user';

import DoctorModal from '../user/detail-doctor';

type Props = {
  doctors: IUserItem[];
  setCurrentStep: (step: string) => void;
};

const workingHoursByDay: Record<number, { start: string; end: string }> = {
  1: { start: '08:00', end: '17:00' },
  2: { start: '08:00', end: '17:00' },
  3: { start: '08:00', end: '17:00' },
  4: { start: '08:00', end: '17:00' },
  5: { start: '08:00', end: '17:00' },
  6: { start: '09:00', end: '17:00' },
  0: { start: '00:00', end: '00:00' },
};

const generateTimeSlots = (start: string, end: string, step = 30): string[] => {
  const slots: string[] = [];
  let current = dayjs(`2025-04-08T${start}`);
  const endTime = dayjs(`2025-04-08T${end}`);

  const excludeBreakTime = ['12:00', '12:30', '13:00', '13:30'];
  while (current.isBefore(endTime)) {
    if (!excludeBreakTime.includes(current.format('HH:mm'))) {
      slots.push(current.format('HH:mm'));
    }
    current = current.add(step, 'minute');
  }

  return slots;
};

export default function BookingSelectTime({ doctors, setCurrentStep }: Props) {
  const [selectedDoctor, setSelectedDoctor] = useState<IUserItem | null>(doctors[0] || null);
  const [selectedDate, setSelectedDate] = useState<dayjs.Dayjs | null>(dayjs());
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [parsedData, setParsedData] = useState<any>(null);
  const [openModal, setOpenModal] = useState<boolean>(false);

  useEffect(() => {
    const savedData = localStorage.getItem('booking_form_data_1');
    if (savedData) {
      setParsedData(JSON.parse(savedData));
    }
  }, []);

  useEffect(() => {
    const rawJson = {
      doctor: selectedDoctor,
      date: selectedDate?.format('YYYY-MM-DD'),
      slot: selectedSlot,
    };
    localStorage.setItem('booking_form_data_2', JSON.stringify(rawJson));
  }, [selectedDoctor, selectedDate, selectedSlot]);

  const selectedDayOfWeek = selectedDate?.day() ?? 0;
  const workingHours = workingHoursByDay[selectedDayOfWeek];
  const availableSlots = workingHours
    ? generateTimeSlots(workingHours.start, workingHours.end)
    : [];

  const doctorOptions = doctors.map((doc) => ({
    value: doc.id,
    label: doc.fullName,
    avatarUrl: doc.avatarUrl,
    rank: doc.rank?.name,
    base_price: doc.rank?.base_price,
  }));

  const CustomOption = (props: any) => {
    const { data, innerRef, innerProps } = props;
    return (
      <div ref={innerRef} {...innerProps} className="p-2 hover:bg-gray-100 flex items-center gap-3">
        <Avatar src={data.avatarUrl} sx={{ width: 36, height: 36 }} />
        <div>
          <Typography variant="body1" fontWeight="bold">
            {data.label}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.rank}
          </Typography>
        </div>
      </div>
    );
  };

  const CustomSingleValue = (props: any) => {
    const { data } = props;
    return (
      <selectComponents.SingleValue {...props}>
        <div className="flex items-center gap-2">
          <Avatar src={data.avatarUrl} sx={{ width: 24, height: 24 }} />
          <span>{data.label}</span>
        </div>
      </selectComponents.SingleValue>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <div className="bg-white p-6 rounded-xl shadow max-w-screen-lg mx-auto space-y-8">
        {parsedData && (
          <Typography variant="h6" gutterBottom>
            Chuyên khoa đã chọn:
            <span className="font-normal"> {parsedData?.specialty?.name}</span>
          </Typography>
        )}
        <div>
          <Typography variant="h6" gutterBottom>
            Chọn bác sĩ:
          </Typography>
          <Select
            className="w-full"
            options={doctorOptions}
            value={doctorOptions.find((opt) => opt.value === selectedDoctor?.id)}
            onChange={(option) => {
              const doc = doctors.find((d) => d.id === option?.value);
              if (doc) setSelectedDoctor(doc);
            }}
            components={{ Option: CustomOption, SingleValue: CustomSingleValue }}
            styles={{
              control: (base) => ({
                ...base,
                borderRadius: '8px',
                padding: '4px',
                borderColor: '#ccc',
                boxShadow: 'none',
                ':hover': { borderColor: '#888' },
              }),
            }}
            placeholder="Chọn bác sĩ..."
          />
          {selectedDoctor && (
            <div className="mt-4 p-4 border rounded-xl bg-gray-50 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-4">
                <Avatar src={selectedDoctor.avatarUrl} sx={{ width: 56, height: 56 }} />
                <div className="flex flex-col">
                  <Typography variant="h6" className="font-semibold">
                    {selectedDoctor.fullName}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {selectedDoctor.rank?.name}
                  </Typography>
                  <Typography variant="body2" className="font-medium">
                    {selectedDoctor.rank?.base_price.toLocaleString()}đ
                  </Typography>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col gap-2 justify-center items-center">
            <Typography variant="h6" gutterBottom>
              Chọn ngày khám:
            </Typography>
            <DateCalendar
              value={selectedDate}
              onChange={(newDate) => {
                setSelectedDate(newDate);
                setSelectedSlot(null);
              }}
              disablePast
              className="w-full max-w-md border border-gray-300 rounded-md"
            />
          </div>

          <div className="flex flex-col gap-2 items-center w-full justify-between">
            <div className="flex flex-col gap-2 items-center w-full">
              <Typography variant="h6" gutterBottom>
                Chọn giờ khám:
              </Typography>
              {availableSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2 w-full">
                  {availableSlots.map((slot) => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`px-4 py-2 rounded-md border text-sm transition duration-150 ${
                        selectedSlot === slot
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:border-blue-500 hover:bg-blue-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <Typography variant="body2" color="text.secondary" className="mt-2">
                  Không có khung giờ khả dụng cho ngày này.
                </Typography>
              )}
            </div>
            <Button
              variant="contained"
              onClick={() => setCurrentStep('payment-step')}
              disabled={!selectedSlot || !selectedDate}
              color="primary"
              className="w-full primary-bg text-white"
            >
              Tiếp tục
            </Button>
          </div>
        </div>

        {openModal && (
          <DoctorModal
            open={openModal}
            onClose={() => setOpenModal(false)}
            doctor={selectedDoctor}
            setCurrentStep={setCurrentStep}
            setOpenModal={setOpenModal}
          />
        )}
      </div>
    </LocalizationProvider>
  );
}
