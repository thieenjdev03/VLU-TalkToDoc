# 🚀 Chat JSON API - Updated Integration

## 📋 Cập nhật mới

Hệ thống đã được cập nhật để hỗ trợ data structure mới từ backend với thông tin chi tiết hơn cho appointment suggestions.

## 🆕 Tính năng mới

### 1. Enhanced Appointment Suggestion
Backend giờ trả về thông tin chi tiết hơn:

```json
{
  "type": "appointment_suggestion",
  "data": {
    "suggested": true,
    "reason": "Dựa trên triệu chứng và lịch sử khám bệnh",
    "urgency": "normal",
    "recommendedSpecialty": "nội khoa",
    "estimatedWaitTime": "2-3 ngày",
    "availableDoctors": [
      {
        "id": "66f0d2b1b8c8a13a5d0c1e22",
        "doctorId": "DR123456",
        "name": "BS. Nguyễn Văn A",
        "specialty": ["66f0d2b1b8c8a13a5d0c1e33"],
        "experienceYears": 5,
        "rating": 4.8,
        "position": "Bác sĩ chuyên khoa",
        "hospital": "66f0d2b1b8c8a13a5d0c1e44",
        "nextAvailableSlot": "2024-01-21 09:00-10:00"
      }
    ],
    "suggestedTimeSlots": [
      {
        "date": "2024-01-21",
        "dayOfWeek": "Chủ nhật",
        "slots": [
          {
            "time": "09:00-10:00",
            "timeStart": "09:00",
            "timeEnd": "10:00",
            "available": true,
            "price": 250000
          }
        ]
      }
    ],
    "pricing": {
      "platformFee": 50000,
      "doctorFee": 250000,
      "discount": 0,
      "total": 300000,
      "currency": "VND"
    },
    "bookingInfo": {
      "minAdvanceBooking": "2 giờ",
      "maxAdvanceBooking": "30 ngày",
      "cancellationPolicy": "Hủy miễn phí trước 2 giờ",
      "reschedulePolicy": "Đổi lịch miễn phí trước 4 giờ"
    }
  }
}
```

### 2. Rich UI Components

#### AppointmentSuggestionCard
- **Doctor Selection**: Hiển thị danh sách bác sĩ với rating, kinh nghiệm
- **Time Slots**: Lịch trống theo ngày với giá cả
- **Pricing**: Chi phí chi tiết (phí bác sĩ, phí nền tảng, giảm giá)
- **Booking Info**: Thông tin chính sách đặt lịch

#### AppointmentBookingModal
- **Interactive Doctor Selection**: Radio buttons để chọn bác sĩ
- **Time Slot Picker**: Grid layout cho việc chọn giờ khám
- **Pricing Summary**: Tóm tắt chi phí trước khi xác nhận
- **Booking Confirmation**: Xác nhận đặt lịch với thông tin đầy đủ

### 3. Enhanced Demo Component

Demo component đã được cập nhật với:
- **Better Examples**: Các ví dụ phù hợp với data structure mới
- **Detailed Descriptions**: Mô tả chi tiết cho từng loại request
- **API Info**: Hiển thị endpoint và IDs đang sử dụng
- **Rich UI**: Giao diện đẹp hơn với thông tin chi tiết

## 🔧 Cách sử dụng

### 1. Test với Demo Component

Truy cập: `http://localhost:3000/demo/chat-json-demo`

**Demo Messages mới:**
- **Đặt lịch khám (Chi tiết)**: "Tôi muốn đặt lịch khám bệnh, có triệu chứng đau đầu và mệt mỏi"
- **Đặt lịch khám (Đơn giản)**: "Tôi muốn đặt lịch khám bệnh"
- **Kiểm tra lịch hẹn**: "Tôi muốn kiểm tra lịch hẹn của mình"
- **Phân tích triệu chứng**: "Tôi bị đau đầu và mệt mỏi nhiều ngày, có kèm theo sốt nhẹ"

### 2. API Testing

```bash
# Test appointment suggestion với data chi tiết
curl -X POST "http://localhost:3000/chat/68b882af883e5e17894e8b3c/json" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tôi muốn đặt lịch khám bệnh, có triệu chứng đau đầu và mệt mỏi",
    "user_id": "683707a1b8a41423473bac15",
    "requireJsonResponse": true,
    "jsonResponseType": "appointment_suggestion"
  }'
```

### 3. Frontend Integration

```typescript
// Sử dụng trong component
import { AppointmentSuggestionCard } from 'src/sections/chat/components/chat-json-components'

// Component sẽ tự động hiển thị:
// - Danh sách bác sĩ có sẵn
// - Lịch trống theo ngày
// - Chi phí chi tiết
// - Thông tin chính sách đặt lịch
// - Modal đặt lịch tương tác
```

## 🎨 UI Features

### Doctor Cards
- Avatar với icon
- Tên và chức vụ bác sĩ
- Số năm kinh nghiệm
- Rating với icon sao
- Slot tiếp theo có sẵn

### Time Slot Selection
- Hiển thị theo ngày và thứ
- Grid layout cho các slot
- Màu sắc phân biệt available/unavailable
- Hiển thị giá cả cho từng slot
- Hover effects và selection states

### Pricing Display
- Chi phí chi tiết (phí bác sĩ, phí nền tảng)
- Giảm giá (nếu có)
- Tổng cộng với highlight
- Format tiền tệ VNĐ

### Booking Modal
- Multi-step process (chọn bác sĩ → chọn giờ → xác nhận)
- Responsive design
- Form validation
- Confirmation summary

## 🔄 Workflow mới

1. **User gửi tin nhắn** → `handleSendMessage()`
2. **Auto-detect JSON type** → `shouldUseJsonResponse()`
3. **Call JSON API** → `sendJsonMessageToAI()`
4. **Receive rich data** → Backend trả về data chi tiết
5. **Display enhanced UI** → `AppointmentSuggestionCard` với modal
6. **User interaction** → Chọn bác sĩ, giờ khám, xác nhận
7. **Booking confirmation** → Xử lý đặt lịch

## 📊 Data Structure

### Doctor Interface
```typescript
interface Doctor {
  id: string
  doctorId: string
  name: string
  specialty: string[]
  experienceYears: number
  rating: number
  position: string
  hospital: string
  nextAvailableSlot: string
}
```

### TimeSlot Interface
```typescript
interface TimeSlot {
  time: string
  timeStart: string
  timeEnd: string
  available: boolean
  price: number
}
```

### Pricing Interface
```typescript
interface Pricing {
  platformFee: number
  doctorFee: number
  discount: number
  total: number
  currency: string
}
```

## 🧪 Testing Scenarios

### 1. Basic Appointment Suggestion
- Message: "Tôi muốn đặt lịch khám bệnh"
- Expected: Gợi ý cơ bản với thông tin tối thiểu

### 2. Detailed Appointment Suggestion
- Message: "Tôi muốn đặt lịch khám bệnh, có triệu chứng đau đầu và mệt mỏi"
- Expected: Gợi ý chi tiết với bác sĩ, lịch trống, giá cả

### 3. Emergency Appointment
- Message: "Tôi cần khám khẩn cấp, đau bụng dữ dội"
- Expected: Urgency level "emergency" với ưu tiên cao

### 4. Follow-up Appointment
- Message: "Tôi muốn tái khám theo lịch hẹn cũ"
- Expected: Gợi ý dựa trên lịch sử khám bệnh

## 🚀 Performance

- **Response Time**: 2-5 giây (tùy thuộc vào độ phức tạp)
- **Data Size**: 1-5KB per response
- **UI Rendering**: < 100ms cho components
- **Modal Loading**: < 50ms

## 🔧 Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:3000
```

### Demo Configuration
```typescript
// Trong chat-json-demo.tsx
const [conversationId] = useState('68b882af883e5e17894e8b3c')
const [userId] = useState('683707a1b8a41423473bac15')
```

## 🎯 Future Enhancements

1. **Real-time Availability**: WebSocket updates cho time slots
2. **Payment Integration**: Thanh toán trực tiếp trong modal
3. **Calendar Sync**: Đồng bộ với Google Calendar
4. **SMS Notifications**: Gửi SMS xác nhận đặt lịch
5. **Video Consultation**: Tích hợp video call
6. **Prescription Management**: Quản lý đơn thuốc
7. **Multi-language**: Hỗ trợ tiếng Anh
8. **Accessibility**: WCAG compliance

## 📞 Support

Nếu có vấn đề:
1. Kiểm tra console logs
2. Test với demo component
3. Verify API endpoint hoạt động
4. Check data structure từ backend
5. Review network requests trong DevTools

---

> **Lưu ý**: Đảm bảo backend đã implement đầy đủ data structure mới trước khi sử dụng tính năng này.
