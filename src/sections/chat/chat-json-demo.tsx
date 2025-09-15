import React, { useState } from 'react'

import { Box, Button, Container, Stack, Typography } from '@mui/material'

import { ChatJsonData, AppointmentInfo, FollowUpAppointment } from 'src/types/chat'

import { ChatJsonRenderer } from './components/chat-json-components'

// Demo data
const sampleAppointmentInfo: AppointmentInfo = {
  hasAppointment: true,
  totalAppointments: 2,
  nextAppointment: {
    appointmentId: 'APT-20240901-0001',
    patient: '66f0d2b1b8c8a13a5d0c1e11',
    doctor: {
      id: '66f0d2b1b8c8a13a5d0c1e22',
      _id: '66f0d2b1b8c8a13a5d0c1e22',
      username: 'bsnguyenvana',
      email: 'vana@example.com',
      fullName: 'BS. Nguyễn Văn A',
      phoneNumber: '0901234567',
      isActive: true,
      avatarUrl: '',
      city: null,
      role: 'doctor',
      specialty: [
        {
          id: '66f0d2b1b8c8a13a5d0c1e33',
          name: 'Chuyên khoa A',
          description: 'Mô tả chuyên khoa A'
        }
      ],
      hospital: 'Bệnh viện Đa khoa A',
      experienceYears: 10,
      licenseNo: 'LIC123456',
      rank: 'Bác sĩ',
      position: 'Trưởng khoa',
      availability: [],
      createdAt: '2020-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
      bank: null,
      performanceScore: 95,
      avgScore: 4.8,
      lastLoggedIn: '2024-06-01T10:00:00.000Z',
      wallet: {
        balance: 1000000,
        transactionHistory: [],
        lastUpdated: '2024-06-01T10:00:00.000Z',
        _id: 'wallet-1'
      },
      __v: 0,
      registrationStatus: 'approved',
      ratingDetails: [],
      performanceScoreLogs: []
    },
    specialty: '66f0d2b1b8c8a13a5d0c1e33',
    date: '2024-01-20',
    slot: '14:00',
    timezone: 'Asia/Ho_Chi_Minh',
    status: 'CONFIRMED',
    reason: 'Tái khám kiểm tra đường huyết',
    doctorNote: 'Theo dõi đường huyết sau 2 tuần',
    payment: {
      platformFee: 50000,
      doctorFee: 250000,
      discount: 0,
      total: 300000,
      status: 'UNPAID',
      paymentMethod: ''
    },
    createdAt: '2025-09-01T03:00:00.000Z',
    confirmedAt: '2025-09-01T04:00:00.000Z',
    completedAt: undefined,
    cancelledAt: undefined
  },
  recentAppointments: [
    {
      appointmentId: 'APT-20240815-0002',
      patient: '66f0d2b1b8c8a13a5d0c1e11',
      doctor: {
        id: '66f0d2b1b8c8a13a5d0c1e22',
        _id: '66f0d2b1b8c8a13a5d0c1e22',
        username: 'bsnguyenvana',
        email: 'vana@example.com',
        fullName: 'BS. Nguyễn Văn A',
        phoneNumber: '0901234567',
        isActive: true,
        avatarUrl: '',
        city: null,
        role: 'doctor',
        specialty: [
          {
            id: '66f0d2b1b8c8a13a5d0c1e33',
            name: 'Chuyên khoa A',
            description: 'Mô tả chuyên khoa A'
          }
        ],
        hospital: 'Bệnh viện Đa khoa A',
        experienceYears: 10,
        licenseNo: 'LIC123456',
        rank: 'Bác sĩ',
        position: 'Trưởng khoa',
        availability: [],
        createdAt: '2020-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        bank: null,
        performanceScore: 95,
        avgScore: 4.8,
        lastLoggedIn: '2024-06-01T10:00:00.000Z',
        wallet: {
          balance: 1000000,
          transactionHistory: [],
          lastUpdated: '2024-06-01T10:00:00.000Z',
          _id: 'wallet-1'
        },
        __v: 0,
        registrationStatus: 'approved',
        ratingDetails: [],
        performanceScoreLogs: []
      },
      specialty: '66f0d2b1b8c8a13a5d0c1e33',
      date: '2024-01-15',
      slot: '10:00',
      timezone: 'Asia/Ho_Chi_Minh',
      status: 'COMPLETED',
      reason: 'Khám tổng quát',
      doctorNote: 'Sức khỏe tốt',
      payment: {
        platformFee: 50000,
        doctorFee: 250000,
        discount: 0,
        total: 300000,
        status: 'PAID',
        paymentMethod: 'BANK_TRANSFER'
      },
      createdAt: '2025-08-15T02:00:00.000Z',
      confirmedAt: '2025-08-15T03:00:00.000Z',
      completedAt: '2025-08-15T11:00:00.000Z',
      cancelledAt: undefined
    }
  ],
  doctorInfo: {
    id: 'DR123456',
    _id: '66f0d2b1b8c8a13a5d0c1e22',
    name: 'BS. Nguyễn Văn A',
    specialty: ['66f0d2b1b8c8a13a5d0c1e33'],
    hospital: '66f0d2b1b8c8a13a5d0c1e44'
  },
  patientInfo: {
    _id: '66f0d2b1b8c8a13a5d0c1e11',
    name: 'Nguyễn Văn B'
  }
}

const sampleFollowUpAppointment: FollowUpAppointment = {
  follow_up: true,
  appointments: [
    {
      appointmentId: 'APT-20240901-0001',
      patient: '66f0d2b1b8c8a13a5d0c1e11',
      doctor: '66f0d2b1b8c8a13a5d0c1e22',
      specialty: '66f0d2b1b8c8a13a5d0c1e33',
      date: '2025-09-10',
      slot: '09:30',
      timezone: 'Asia/Ho_Chi_Minh',
      status: 'CONFIRMED',
      reason: 'Tái khám kiểm tra đường huyết',
      doctorNote: 'Theo dõi đường huyết sau 2 tuần',
      payment: {
        platformFee: 0,
        doctorFee: 500000,
        discount: 0,
        total: 500000,
        status: 'UNPAID',
        paymentMethod: ''
      },
      createdAt: '2025-09-01T03:00:00.000Z',
      confirmedAt: '2025-09-01T04:00:00.000Z',
      completedAt: undefined,
      cancelledAt: undefined
    }
  ],
  doctorInfo: {
    id: 'DR123456',
    _id: '66f0d2b1b8c8a13a5d0c1e22',
    name: 'BS. Nguyễn Văn A',
    specialty: ['66f0d2b1b8c8a13a5d0c1e33'],
    hospital: '66f0d2b1b8c8a13a5d0c1e44'
  },
  patientInfo: {
    _id: '66f0d2b1b8c8a13a5d0c1e11',
    name: 'Nguyễn Văn B'
  }
}

export const ChatJsonDemo: React.FC = () => {
  const [currentDemo, setCurrentDemo] = useState<'appointment_info' | 'follow_up_appointment'>('appointment_info')

  const getCurrentJsonData = (): ChatJsonData => {
    switch (currentDemo) {
      case 'appointment_info':
        return {
          type: 'appointment_info',
          data: sampleAppointmentInfo
        }
      case 'follow_up_appointment':
        return {
          type: 'follow_up_appointment',
          data: sampleFollowUpAppointment
        }
      default:
        return {
          type: 'appointment_info',
          data: sampleAppointmentInfo
        }
    }
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Chat JSON Components Demo
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Demo các component hiển thị JSON data từ Chat API với cấu trúc mới
      </Typography>

      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        <Button
          variant={currentDemo === 'appointment_info' ? 'contained' : 'outlined'}
          onClick={() => setCurrentDemo('appointment_info')}
        >
          Appointment Info
        </Button>
        <Button
          variant={currentDemo === 'follow_up_appointment' ? 'contained' : 'outlined'}
          onClick={() => setCurrentDemo('follow_up_appointment')}
        >
          Follow-up Appointment
        </Button>
      </Stack>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Current Demo: {currentDemo}
        </Typography>
        
        <ChatJsonRenderer 
          jsonData={getCurrentJsonData()}
          onAppointmentAccept={() => console.log('Appointment accepted')}
          onAppointmentDecline={() => console.log('Appointment declined')}
        />
      </Box>

      <Box sx={{ p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          JSON Data Structure:
        </Typography>
        <pre style={{ fontSize: '12px', overflow: 'auto' }}>
          {JSON.stringify(getCurrentJsonData(), null, 2)}
        </pre>
      </Box>
    </Container>
  )
}