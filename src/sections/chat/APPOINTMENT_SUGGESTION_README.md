# 📅 Chat Appointment Suggestion Feature

## Tổng quan

Tính năng gợi ý lịch hẹn trong chat cho phép AI chatbot đề xuất lịch hẹn với bác sĩ dựa trên tình trạng sức khỏe của bệnh nhân. Bệnh nhân có thể chấp nhận hoặc từ chối gợi ý này trực tiếp trong chat.

## Cấu trúc Files

```
src/sections/chat/
├── chat-appointment-suggestion.tsx    # Component chính hiển thị gợi ý lịch hẹn
├── chat-appointment-demo.tsx          # Component demo để test
├── chat-message-item.tsx              # Đã cập nhật để hiển thị appointment suggestion
├── chat-message-list.tsx              # Đã cập nhật để truyền callbacks
└── view/chat-view.tsx                 # Đã cập nhật để xử lý logic

src/types/
└── chat.ts                            # Đã cập nhật types để hỗ trợ appointmentSuggestion

src/pages/demo/
└── chat-appointment-demo.tsx          # Trang demo để test
```

## Cách sử dụng

### 1. Backend API Response

Backend cần trả về response với cấu trúc:

```json
{
  "reply": "Dựa trên triệu chứng của bạn, tôi khuyên bạn nên đặt lịch hẹn...",
  "messages": [...],
  "appointmentSuggestion": {
    "doctorId": "doctor_123",
    "doctorName": "BS. Nguyễn Văn An",
    "doctorAvatar": "https://example.com/avatar.jpg",
    "doctorSpecialty": "Tim mạch",
    "suggestedDate": "2024-01-20",
    "suggestedTime": "14:30",
    "reason": "Khám định kỳ và theo dõi huyết áp",
    "estimatedDuration": 30,
    "location": "Phòng khám Tim mạch - Tầng 3",
    "price": 500000
  }
}
```

### 2. Frontend Integration

Component sẽ tự động hiển thị khi message có `appointmentSuggestion`:

```tsx
// Trong ChatMessageItem
{!isCurrentUser && message.appointmentSuggestion && (
  <Box sx={{ mt: 1.5 }}>
    <ChatAppointmentSuggestion
      suggestion={message.appointmentSuggestion}
      onAccept={onAppointmentAccept}
      onReject={onAppointmentReject}
    />
  </Box>
)}
```

### 3. Callback Functions

```tsx
const handleAppointmentAccept = (appointmentId: string) => {
  console.log('Appointment accepted:', appointmentId)
  // Logic xử lý khi chấp nhận
}

const handleAppointmentReject = () => {
  console.log('Appointment rejected')
  // Logic xử lý khi từ chối
}
```

## Tính năng

### ✅ Đã hoàn thành

- [x] Component hiển thị gợi ý lịch hẹn với đầy đủ thông tin
- [x] Nút chấp nhận/từ chối với loading state
- [x] Hiển thị trạng thái đã chấp nhận/từ chối
- [x] Tích hợp vào chat message system
- [x] Xử lý lỗi khi tạo lịch hẹn
- [x] Responsive design
- [x] Demo component để test

### 🎨 UI/UX Features

- **Thiết kế đẹp**: Card với border màu primary, background nhẹ
- **Thông tin đầy đủ**: Bác sĩ, chuyên khoa, ngày giờ, lý do, giá
- **Trạng thái rõ ràng**: Loading, success, error states
- **Responsive**: Tự động điều chỉnh trên mobile
- **Accessibility**: Hỗ trợ keyboard navigation

### 🔧 Technical Features

- **Type Safety**: Full TypeScript support
- **Error Handling**: Xử lý lỗi API gracefully
- **State Management**: Local state cho UI interactions
- **API Integration**: Tích hợp với appointment API
- **Reusable**: Component có thể tái sử dụng

## Demo

Để test tính năng, truy cập: `/demo/chat-appointment-demo`

Demo bao gồm:
- Hiển thị gợi ý lịch hẹn mẫu
- Test các trạng thái khác nhau
- Thống kê số lịch hẹn đã chấp nhận/từ chối
- Reset demo

## API Dependencies

Component sử dụng các API sau:

```typescript
// Tạo lịch hẹn mới
import { createAppointment } from 'src/api/appointment'

// Cấu trúc data
const appointmentData = {
  doctorId: string,
  date: string,
  time: string,
  reason: string,
  estimatedDuration: number,
  location?: string,
  price?: number,
  status: 'PENDING'
}
```

## Customization

### Styling

Component sử dụng Material-UI theme, có thể customize qua:

```tsx
// Trong theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#your-color',
      lighter: '#your-lighter-color'
    }
  }
})
```

### Props

```tsx
interface Props {
  suggestion: AppointmentSuggestionData
  onAccept?: (appointmentId: string) => void
  onReject?: () => void
  disabled?: boolean
}
```

## Lưu ý

1. **Backend Integration**: Cần đảm bảo backend trả về `appointmentSuggestion` trong response
2. **Error Handling**: Component xử lý lỗi API và hiển thị thông báo cho user
3. **State Management**: Component tự quản lý state, không cần external state
4. **Performance**: Component được optimize với React.memo nếu cần

## Roadmap

- [ ] Thêm animation khi chuyển trạng thái
- [ ] Hỗ trợ multiple appointment suggestions
- [ ] Thêm calendar picker để chọn ngày khác
- [ ] Integration với notification system
- [ ] Analytics tracking cho appointment conversions
