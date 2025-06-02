# TalkToDoc Dashboard

## Giới thiệu

TalkToDoc Dashboard là một hệ thống quản lý toa thuốc và chăm sóc sức khỏe được xây dựng với React, TypeScript, và Material-UI.

## Tính năng Export PDF Toa Thuốc

Hệ thống đã được tích hợp tính năng xuất file PDF cho toa thuốc với các đặc điểm:

### Tính năng chính:

- **Export đơn lẻ**: Xuất một toa thuốc cụ thể ra file PDF
- **Export tổng hợp**: Xuất tất cả toa thuốc ra một file PDF duy nhất với trang tổng hợp

### Thông tin trong PDF:

- Thông tin bệnh viện
- Mã đơn thuốc
- Thông tin bệnh nhân (địa chỉ, số điện thoại)
- Bảng thuốc chi tiết (tên thuốc, số lượng, liều lượng, cách dùng, thời gian, giá)
- Tổng tiền tạm tính
- Lời dặn từ bác sĩ
- Ngày kê đơn và chữ ký bác sĩ
- Thông tin nhà thuốc (nếu có)

### Cách sử dụng:

1. **Export toa thuốc đơn lẻ**:

   - Tại mỗi toa thuốc, click nút "Xuất PDF"
   - File sẽ được tải về với tên `toa-thuoc-{ID}.pdf`

2. **Export tất cả toa thuốc**:
   - Click nút "Xuất tất cả toa thuốc (PDF)" ở phần tổng hợp
   - File sẽ được tải về với tên `tong-hop-toa-thuoc-{timestamp}.pdf`

### Cấu trúc file PDF:

#### PDF đơn lẻ:

```
- Header: Tên bệnh viện + Mã đơn
- Title: ĐƠN THUỐC
- Thông tin bệnh nhân
- Bảng thuốc
- Tổng tiền
- Lời dặn
- Ngày kê và chữ ký
- Thông tin nhà thuốc
```

#### PDF tổng hợp:

```
- Trang 1: Tổng hợp (số lượng, tổng tiền, bác sĩ, ngày xuất)
- Trang 2+: Từng toa thuốc chi tiết
```

### Dependencies:

- `pdfmake`: Thư viện tạo PDF
- `@types/pdfmake`: Type definitions cho TypeScript

### Lưu ý kỹ thuật:

- Sử dụng dynamic import để tránh lỗi TypeScript
- Xử lý lỗi và hiển thị thông báo khi có sự cố
- Fonts được load tự động từ pdfmake
- Format tiền tệ theo chuẩn Việt Nam (VNĐ)

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
