# 🤖 Chat JSON API Integration

## 📋 Tổng quan

Hệ thống chat đã được cập nhật để hỗ trợ JSON response từ AI, cho phép hiển thị thông tin có cấu trúc như lịch hẹn, gợi ý khám bệnh, phân tích triệu chứng, v.v.

## 🚀 Tính năng mới

### 1. JSON Response Types
- **appointment_info**: Thông tin lịch hẹn của bệnh nhân
- **appointment_suggestion**: Gợi ý đặt lịch khám
- **symptom_analysis**: Phân tích triệu chứng
- **patient_info**: Thông tin bệnh nhân
- **general_info**: Thông tin chung

### 2. Auto-detection
Hệ thống tự động phát hiện khi nào cần sử dụng JSON response dựa trên từ khóa trong tin nhắn:

```typescript
// Ví dụ từ khóa
const appointmentInfoKeywords = [
  'lịch hẹn của tôi', 'kiểm tra lịch hẹn', 'lịch hẹn khi nào'
]

const appointmentSuggestionKeywords = [
  'đặt lịch', 'đặt lịch khám', 'muốn khám', 'cần khám'
]
```

### 3. Rich UI Components
Mỗi loại JSON response có component UI riêng để hiển thị thông tin một cách trực quan:

- **AppointmentInfoCard**: Hiển thị lịch hẹn với status, thời gian
- **AppointmentSuggestionCard**: Gợi ý đặt lịch với nút chấp nhận/từ chối
- **SymptomAnalysisCard**: Phân tích triệu chứng với mức độ nghiêm trọng
- **PatientInfoCard**: Thông tin bệnh nhân với tiền sử bệnh
- **GeneralInfoCard**: Thông tin chung với gợi ý và quick actions

## 🔧 Cách sử dụng

### 1. Trong Chat Interface

Khi user gửi tin nhắn, hệ thống sẽ:

1. **Phân tích tin nhắn** để xác định có cần JSON response không
2. **Gọi API phù hợp**:
   - `sendJsonMessageToAI()` nếu cần JSON response
   - `sendMessageToAI()` cho chat thông thường
3. **Hiển thị kết quả** với component UI tương ứng

### 2. Sử dụng Hook

```typescript
import { useChatJson } from 'src/hooks/use-chat-json'

const { sendJsonMessage, loading, error } = useChatJson({
  onSuccess: (response) => {
    console.log('JSON response:', response.jsonData)
  },
  onError: (error) => {
    console.error('Error:', error)
  }
})

// Gửi tin nhắn với JSON response
const response = await sendJsonMessage(
  'conv_123',
  'Tôi muốn kiểm tra lịch hẹn',
  'user_123',
  {
    jsonResponseType: 'appointment_info'
  }
)
```

### 3. Demo Component

Sử dụng `ChatJsonDemo` component để test các loại JSON response:

```typescript
import ChatJsonDemo from 'src/sections/chat/chat-json-demo'

// Trong component
<ChatJsonDemo />
```

## 📁 Cấu trúc Files

```
src/
├── types/
│   └── chat.ts                    # Type definitions cho JSON response
├── hooks/
│   └── use-chat-json.ts          # Custom hook cho JSON API
├── sections/chat/
│   ├── components/
│   │   └── chat-json-components.tsx  # UI components cho JSON data
│   ├── chat-json-demo.tsx        # Demo component
│   ├── chat-message-item.tsx     # Updated để hiển thị JSON data
│   └── view/
│       └── chat-view.tsx         # Updated để tích hợp JSON API
└── api/
    └── chat.ts                   # Updated với sendJsonMessageToAI
```

## 🎯 API Endpoints

### POST /chat/:conversationId/json

**Request:**
```json
{
  "message": "Tôi muốn kiểm tra lịch hẹn của mình",
  "user_id": "user_123",
  "requireJsonResponse": true,
  "jsonResponseType": "appointment_info"
}
```

**Response:**
```json
{
  "success": true,
  "reply": "Dựa trên lịch sử khám bệnh của bạn...",
  "jsonData": {
    "type": "appointment_info",
    "data": {
      "hasAppointment": true,
      "totalAppointments": 2,
      "nextAppointment": {
        "appointmentId": "APT-20240901-0001",
        "date": "2024-01-20",
        "slot": "14:00",
        "status": "CONFIRMED",
        "reason": "Tái khám kiểm tra đường huyết"
      }
    }
  },
  "timestamp": "2024-01-20T18:00:00Z",
  "model": "gpt-4o",
  "usage": {
    "inputTokens": 150,
    "outputTokens": 200,
    "totalTokens": 350
  }
}
```

## 🔄 Workflow

1. **User gửi tin nhắn** → `handleSendMessage()`
2. **Phân tích tin nhắn** → `shouldUseJsonResponse()`
3. **Gọi API phù hợp** → `sendJsonMessageToAI()` hoặc `sendMessageToAI()`
4. **Nhận response** → Có thể chứa `jsonData`
5. **Hiển thị UI** → `ChatJsonRenderer` render component phù hợp
6. **User tương tác** → Nút chấp nhận/từ chối, xem chi tiết, v.v.

## 🎨 UI Features

### Appointment Suggestion Card
- Hiển thị thông tin bác sĩ
- Mức độ khẩn cấp (normal/urgent/emergency)
- Nút chấp nhận/từ chối
- Thông tin chi phí và địa điểm

### Symptom Analysis Card
- Danh sách triệu chứng
- Mức độ nghiêm trọng
- Khuyến nghị điều trị
- Chuyên khoa đề xuất

### Patient Info Card
- Thông tin cá nhân
- Tiền sử bệnh
- Dị ứng
- Thông tin liên hệ

## 🧪 Testing

### 1. Sử dụng Demo Component
```bash
# Truy cập demo page
http://localhost:3000/demo/chat-json
```

### 2. Test với cURL
```bash
curl -X POST "http://localhost:3000/chat/conv_123/json" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Tôi muốn kiểm tra lịch hẹn của mình",
    "user_id": "user_123",
    "requireJsonResponse": true,
    "jsonResponseType": "appointment_info"
  }'
```

### 3. Test trong Chat Interface
Gửi các tin nhắn sau để trigger JSON response:
- "Tôi muốn kiểm tra lịch hẹn của mình"
- "Tôi muốn đặt lịch khám bệnh"
- "Tôi bị đau đầu và mệt mỏi"
- "Thông tin cá nhân của tôi như thế nào?"

## 🔧 Configuration

### Environment Variables
```env
VITE_API_URL=http://localhost:3000
```

### TypeScript Types
Tất cả types được định nghĩa trong `src/types/chat.ts`:
- `JsonResponseType`
- `AppointmentInfo`
- `AppointmentSuggestion`
- `SymptomAnalysis`
- `PatientInfo`
- `GeneralInfo`
- `ChatJsonResponse`
- `ChatJsonRequest`

## 🚀 Future Enhancements

1. **Real-time Updates**: WebSocket cho appointment status updates
2. **Calendar Integration**: Tích hợp với calendar để đặt lịch
3. **Payment Integration**: Thanh toán trực tiếp từ suggestion card
4. **Multi-language**: Hỗ trợ nhiều ngôn ngữ
5. **Voice Input**: Hỗ trợ voice-to-text cho symptoms
6. **Image Analysis**: Phân tích ảnh triệu chứng
7. **Prescription Management**: Quản lý đơn thuốc
8. **Follow-up Reminders**: Nhắc nhở tái khám

## 📞 Support

Nếu có vấn đề hoặc cần hỗ trợ, vui lòng:
1. Kiểm tra console logs
2. Xem network requests trong DevTools
3. Test với demo component
4. Kiểm tra API endpoint có hoạt động không

---

> **Lưu ý**: Đảm bảo backend API đã được cập nhật để hỗ trợ JSON response endpoint `/chat/:conversationId/json` trước khi sử dụng tính năng này.
