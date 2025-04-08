'use client';

import dayjs from 'dayjs';
import { useState, useEffect } from 'react';

import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { Box, Avatar, Button, MenuItem, TextField, Typography } from '@mui/material';

import { IUserItem } from 'src/types/user';

import DoctorModal from '../user/detail-doctor';

type Props = {
  doctors: IUserItem[];
  setCurrentStep: (step: string) => void;
};

const workingHoursByDay: Record<number, { start: string; end: string }> = {
  1: { start: '08:00', end: '11:00' }, // Thứ 2
  2: { start: '08:00', end: '11:00' }, // Thứ 3
  3: { start: '08:00', end: '11:00' }, // Thứ 4
  4: { start: '08:00', end: '11:00' }, // Thứ 5
  5: { start: '08:00', end: '11:00' }, // Thứ 6
  6: { start: '09:00', end: '11:00' }, // Thứ 7
  0: { start: '00:00', end: '00:00' }, // Chủ nhật: nghỉ
};

const generateTimeSlots = (start: string, end: string, step = 30): string[] => {
  const slots: string[] = [];
  let current = dayjs(`2025-04-08T${start}`);
  const endTime = dayjs(`2025-04-08T${end}`);

  while (current.isBefore(endTime)) {
    slots.push(current.format('HH:mm'));
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
    console.log(rawJson);
    localStorage.setItem('booking_form_data_2', JSON.stringify(rawJson));
  }, [selectedDoctor, selectedDate, selectedSlot]);

  const selectedDayOfWeek = selectedDate?.day() ?? 0;
  const workingHours = workingHoursByDay[selectedDayOfWeek];
  const availableSlots = workingHours
    ? generateTimeSlots(workingHours.start, workingHours.end)
    : [];

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
            Chọn bác sĩ
          </Typography>
          <TextField
            select
            fullWidth
            value={selectedDoctor?.id || ''}
            onChange={(e) => {
              const doctor = doctors.find((d) => d.id === e.target.value);
              if (doctor) setSelectedDoctor(doctor);
            }}
          >
            {doctors.map((doc) => (
              <MenuItem key={doc.id} value={doc.id}>
                {doc.fullName}
              </MenuItem>
            ))}
          </TextField>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Typography variant="h6" gutterBottom>
              Chọn ngày khám
            </Typography>
            <DatePicker
              label="Chọn ngày"
              value={selectedDate}
              onChange={(newDate) => {
                setSelectedDate(newDate);
                setSelectedSlot(null);
              }}
              disablePast
              slotProps={{
                textField: { fullWidth: true },
              }}
            />
          </div>

          <div>
            <Typography variant="h6" gutterBottom>
              Chọn giờ khám
            </Typography>
            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {availableSlots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setSelectedSlot(slot)}
                    className={`px-4 py-2 rounded-md border text-sm ${
                      selectedSlot === slot
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'border-gray-300 hover:border-blue-500'
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
        </div>

        {selectedDoctor && (
          <div className="flex items-center justify-between border-t pt-4 mt-4">
            <Box className="flex items-center gap-4">
              <Avatar src={selectedDoctor.avatarUrl} onClick={() => setOpenModal(true)} />
              <div>
                <Typography variant="subtitle1" fontWeight="bold">
                  {selectedDoctor.fullName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedDoctor?.rank?.name}
                </Typography>
                <Typography variant="body2">
                  Chi phí: {selectedDoctor?.rank?.base_price.toLocaleString()}đ
                </Typography>
              </div>
            </Box>

            <Button
              variant="contained"
              onClick={() => setCurrentStep('payment-step')}
              disabled={!selectedSlot || !selectedDate}
            >
              Tiếp tục
            </Button>
          </div>
        )}
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
