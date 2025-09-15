# Chat JSON UI Update - Cập nhật UI cho logic backend mới

## Tổng quan

Đã cập nhật UI frontend để phù hợp với logic mới của backend, hỗ trợ tách biệt giữa `reply` text và `jsonData` trong response.

## Các thay đổi chính

### 1. Cập nhật Types (src/types/chat.ts)

#### AppointmentInfo Interface
- Thêm các field mới từ backend schema:
  - `patient`, `doctor`, `specialty`, `timezone`
  - `doctorNote`, `payment` object
  - `createdAt`, `confirmedAt`, `completedAt`, `cancelledAt`
  - `doctorInfo` và `patientInfo` objects

#### FollowUpAppointment Interface
- Interface mới cho lịch hẹn tái khám
- Cấu trúc tương tự AppointmentInfo nhưng có `follow_up` boolean
- Hỗ trợ hiển thị nhiều lịch hẹn tái khám

#### JsonResponseType
- Thêm `follow_up_appointment` type

### 2. Cập nhật UI Components (src/sections/chat/components/chat-json-components.tsx)

#### AppointmentInfoCard
- Hiển thị thông tin bác sĩ từ `doctorInfo`
- Thêm section hiển thị ghi chú bác sĩ (`doctorNote`)
- Thêm section thông tin thanh toán chi tiết:
  - Phí bác sĩ, phí nền tảng
  - Giảm giá (nếu có)
  - Tổng cộng
  - Trạng thái thanh toán

#### FollowUpAppointmentCard (Mới)
- Component mới cho hiển thị lịch hẹn tái khám
- UI tương tự AppointmentInfoCard nhưng với theme khác
- Hỗ trợ hiển thị nhiều lịch hẹn tái khám
- Hiển thị thông tin chi tiết cho từng lịch hẹn

#### ChatJsonRenderer
- Thêm case `follow_up_appointment`
- Render FollowUpAppointmentCard cho type mới

### 3. Demo Component (src/sections/chat/chat-json-demo.tsx)

- Component demo để test các UI mới
- Sample data theo cấu trúc backend mới
- Toggle giữa các loại JSON data khác nhau

## Cấu trúc Response mới

### Backend Response Format
```json
{
  "success": true,
  "reply": "Text response từ AI",
  "jsonData": {
    "type": "appointment_info",
    "data": {
      // Chi tiết data theo schema mới
    }
  },
  "timestamp": "2024-01-20T18:00:00Z",
  "model": "gpt-4o-mini"
}
```

### Frontend Handling
- Hiển thị `reply` như text message bình thường
- Render `jsonData` bằng ChatJsonRenderer
- Tách biệt rõ ràng giữa text và structured data

## Lợi ích

1. **Tách biệt rõ ràng**: Message text và JSON data được xử lý riêng biệt
2. **Thông tin chi tiết**: Hiển thị đầy đủ thông tin từ backend schema
3. **Linh hoạt**: Dễ dàng thêm các loại JSON response mới
4. **Backward compatible**: Vẫn hỗ trợ cấu trúc cũ
5. **User Experience**: UI đẹp và thông tin rõ ràng

## Cách sử dụng

### 1. Trong Chat Component
```tsx
// Xử lý response từ API
const handleChatResponse = (response: ChatJsonResponse) => {
  // Hiển thị text reply
  addMessage({
    role: 'assistant',
    content: response.reply
  })
  
  // Hiển thị JSON data nếu có
  if (response.jsonData) {
    addJsonMessage(response.jsonData)
  }
}
```

### 2. Render JSON Data
```tsx
<ChatJsonRenderer 
  jsonData={jsonData}
  onAppointmentAccept={handleAccept}
  onAppointmentDecline={handleDecline}
/>
```

### 3. Demo Component
```tsx
import { ChatJsonDemo } from './chat-json-demo'

// Sử dụng trong route hoặc page
<ChatJsonDemo />
```

## Testing

1. Chạy demo component để xem UI
2. Test với các loại JSON data khác nhau
3. Kiểm tra responsive design
4. Verify data binding với backend schema

## Lưu ý

- Cần cập nhật API calls để sử dụng endpoint mới `/chat/:conversationId/json`
- Đảm bảo backend trả về đúng format response mới
- Test với các trường hợp edge cases (empty data, missing fields)
