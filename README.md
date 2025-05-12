# TalkToDoc Dashboard

TalkToDoc Dashboard là một ứng dụng web quản lý cho hệ thống tư vấn y tế trực tuyến, tích hợp AI để hỗ trợ tư vấn và quản lý lịch hẹn.

## Tính năng chính

### 1. Chat với AI

- Tích hợp chatbot AI để tư vấn y tế
- Lưu trữ lịch sử chat tạm thời trong localStorage
- Giao diện chat thân thiện với người dùng
- Hỗ trợ hiển thị avatar cho cả người dùng và AI

### 2. Quản lý lịch hẹn

- Xem danh sách lịch hẹn
- Lọc lịch hẹn theo trạng thái
- Tìm kiếm lịch hẹn
- Xem chi tiết lịch hẹn
- Cập nhật trạng thái lịch hẹn

### 3. Gọi video trực tuyến

- Tích hợp Stringee cho cuộc gọi video
- Hỗ trợ gọi video giữa bác sĩ và bệnh nhân
- Điều khiển âm thanh và video
- Hiển thị thông tin cuộc gọi

### 4. Quản lý người dùng

- Phân quyền người dùng (Admin, Doctor, Patient)
- Quản lý thông tin người dùng
- Xác thực và phân quyền

## Công nghệ sử dụng

- Frontend: React, Next.js, TypeScript
- UI: Material-UI, Tailwind CSS, Stylus
- State Management: Zustand
- API: RESTful API
- Video Call: Stringee
- AI Integration: Custom AI Model

## Cấu trúc thư mục

```
src/
├── api/           # API calls
├── components/    # Shared components
├── hooks/         # Custom hooks
├── pages/         # Page components
├── sections/      # Feature sections
├── types/         # TypeScript types
└── utils/         # Utility functions
```

## Hướng dẫn cài đặt

1. Clone repository
2. Cài đặt dependencies:

```bash
npm install
```

3. Chạy development server:

```bash
npm run dev
```

## Môi trường

- Node.js >= 14
- npm >= 6
- React >= 18
- Next.js >= 13
