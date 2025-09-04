# 🔄 Frontend Backend Integration Update - Complete Guide

## 📋 Tổng quan

Đã cập nhật frontend để tích hợp với backend đã được update, bao gồm follow-up appointment logic, confirmation dialog, và enhanced keyword detection.

---

## ✅ Cập nhật đã hoàn thành

### 1. Enhanced Keyword Detection ✅

#### **Mở rộng Keywords**
```typescript
const appointmentKeywords = [
  'test',           // Test keyword
  'khám',           // Khám bệnh
  'lịch hẹn',       // Đặt lịch hẹn
  'đặt lịch',       // Đặt lịch
  'bác sĩ',         // Tìm bác sĩ
  'tư vấn',         // Tư vấn y tế
  'triệu chứng',    // Có triệu chứng
  'đau',            // Đau đớn
  'sốt',            // Sốt
  'ho',             // Ho
  'mệt mỏi',        // Mệt mỏi
  'tái khám',       // Tái khám
  'khám lại',       // Khám lại
  'hẹn lại',        // Hẹn lại
  'lịch tái khám',  // Lịch tái khám
  'khi nào khám',   // Hỏi lịch khám
  'bao giờ khám',   // Hỏi thời gian khám
  'có cần khám',    // Hỏi có cần khám không
  'có nên khám'     // Hỏi có nên khám không
]
```

#### **Follow-up Detection**
```typescript
const shouldTriggerFollowUpSuggestion = (message: string): boolean => {
  const followUpKeywords = [
    'tái khám', 'khám lại', 'hẹn lại', 'lịch tái khám',
    'khi nào khám', 'bao giờ khám', 'có cần khám', 'có nên khám'
  ]
  const lowerMessage = message.toLowerCase()
  return followUpKeywords.some(keyword => lowerMessage.includes(keyword))
}
```

#### **Urgency Detection**
```typescript
const detectUrgency = (message: string): 'normal' | 'urgent' | 'emergency' => {
  const urgentKeywords = ['khẩn cấp', 'gấp', 'ngay', 'cấp cứu']
  const emergencyKeywords = ['cấp cứu', 'nguy hiểm', 'tình trạng xấu']
  
  const lowerMessage = message.toLowerCase()
  
  if (emergencyKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'emergency'
  }
  
  if (urgentKeywords.some(keyword => lowerMessage.includes(keyword))) {
    return 'urgent'
  }
  
  return 'normal'
}
```

### 2. Enhanced API Integration ✅

#### **Updated sendMessageToAI Function**
```typescript
export async function sendMessageToAI(
  chatId: string,
  message: string,
  userId: string,
  imageUrls?: string[],
  options?: {
    suggestAppointment?: boolean
    isFollowUpAppointment?: boolean
    userSymptoms?: string[]
    urgency?: 'normal' | 'urgent' | 'emergency'
    preferredSpecialty?: string
    lastAppointmentId?: string
    preferredDate?: string
    preferredTime?: string
    location?: string
    budget?: number
  }
): Promise<IChatResponse>
```

#### **Enhanced Request Payload**
```typescript
const response = await sendMessageToAI(
  selectedConversationId,
  message,
  user?._id || '',
  imageUrls,
  {
    suggestAppointment: shouldSuggest,
    isFollowUpAppointment: isFollowUp,
    userSymptoms: symptoms,
    urgency: urgency
  }
)
```

### 3. Enhanced Data Types ✅

#### **Updated IChatMessage & IChatResponse**
```typescript
appointmentSuggestion?: {
  type?: 'new_appointment' | 'follow_up' | 'emergency'
  doctorId: string
  doctorName: string
  doctorAvatar?: string
  doctorSpecialty: string
  suggestedDate: string
  suggestedTime: string
  reason: string
  estimatedDuration: number
  isFollowUp?: boolean
  lastAppointmentId?: string
  followUpReason?: string
  location?: string
  price?: number
  confirmationRequired?: boolean
  confirmationMessage?: string
}
```

### 4. Enhanced UI Components ✅

#### **ChatAppointmentSuggestion Updates**
- ✅ **Follow-up Detection**: Hiển thị "Gợi ý tái khám" cho follow-up appointments
- ✅ **Follow-up Information**: Hiển thị `followUpReason` và `lastAppointmentId`
- ✅ **Dynamic Button Text**: "Đặt tái khám" / "Không tái khám" cho follow-up
- ✅ **Enhanced Reason Display**: Phân biệt "Lý do khám" vs "Lý do tái khám"

#### **UI Changes**
```typescript
// Header
<Typography variant="subtitle2" color="primary.darker">
  {suggestion.isFollowUp ? 'Gợi ý tái khám' : 'Gợi ý lịch hẹn'}
</Typography>

// Reason
<Typography variant="caption" color="text.secondary">
  {suggestion.isFollowUp ? 'Lý do tái khám:' : 'Lý do khám:'}
</Typography>

// Buttons
{suggestion.isFollowUp ? 'Đặt tái khám' : 'Chấp nhận'}
{suggestion.isFollowUp ? 'Không tái khám' : 'Từ chối'}
```

### 5. Enhanced Demo Components ✅

#### **ChatKeywordDemo Updates**
- ✅ **Follow-up Keywords**: Thêm test messages cho follow-up
- ✅ **Follow-up Detection**: Hiển thị "Follow-up" chip
- ✅ **Enhanced Test Cases**: Bao gồm follow-up scenarios

#### **New Test Messages**
```typescript
const quickTestMessages = [
  'test',
  'Tôi muốn khám bệnh',
  'Đặt lịch hẹn với bác sĩ',
  'Tôi bị đau đầu và sốt',
  'Tôi muốn tái khám',           // NEW
  'Khi nào tôi nên khám lại?',   // NEW
  'Xin chào',
  'Tư vấn sức khỏe',
  'Tôi mệt mỏi và ho',
  'Có triệu chứng đau bụng',
  'Hẹn lại lịch khám',           // NEW
  'Có cần khám không?'           // NEW
]
```

---

## 🔧 Technical Implementation

### 1. ChatView Integration

#### **Enhanced handleSendMessage**
```typescript
const handleSendMessage = async (message: string, imageUrls?: string[]) => {
  // Detect if should suggest appointment
  const shouldSuggest = shouldTriggerAppointmentSuggestion(message)
  const isFollowUp = shouldTriggerFollowUpSuggestion(message)
  const symptoms = extractSymptoms(message)
  const urgency = detectUrgency(message)

  // Send with enhanced options
  const response = await sendMessageToAI(
    selectedConversationId,
    message,
    user?._id || '',
    imageUrls,
    {
      suggestAppointment: shouldSuggest,
      isFollowUpAppointment: isFollowUp,
      userSymptoms: symptoms,
      urgency: urgency
    }
  )
}
```

### 2. API Function Updates

#### **Enhanced Options Support**
```typescript
if (options) {
  payload.options = {
    suggestAppointment: options.suggestAppointment,
    isFollowUpAppointment: options.isFollowUpAppointment,
    userSymptoms: options.userSymptoms,
    urgency: options.urgency,
    preferredSpecialty: options.preferredSpecialty,
    lastAppointmentId: options.lastAppointmentId,
    preferredDate: options.preferredDate,
    preferredTime: options.preferredTime,
    location: options.location,
    budget: options.budget
  }
}
```

### 3. Type Safety

#### **Enhanced Interfaces**
- ✅ **AppointmentSuggestionData**: Updated với follow-up fields
- ✅ **IChatMessage**: Updated với enhanced appointmentSuggestion
- ✅ **IChatResponse**: Updated với enhanced appointmentSuggestion
- ✅ **ChatOptions**: Updated với follow-up và urgency options

---

## 🧪 Testing & Demo

### 1. Enhanced Demo Pages

| Demo Page | URL | New Features |
|-----------|-----|--------------|
| **Keyword Detection** | `/demo/chat-keyword-demo` | Follow-up detection, urgency detection |
| **Appointment Suggestion** | `/demo/chat-appointment-demo` | Follow-up UI, enhanced buttons |
| **Chat Sidebar** | `/demo/chat-sidebar-demo` | Real-time updates, cache management |

### 2. Test Scenarios

#### **Follow-up Appointment Tests**
```
Input: "Tôi muốn tái khám"
Expected: 
- shouldSuggest: true
- isFollowUp: true
- UI shows "Gợi ý tái khám"
- Buttons show "Đặt tái khám" / "Không tái khám"
```

#### **Urgency Detection Tests**
```
Input: "Tôi cần khám khẩn cấp"
Expected:
- urgency: "urgent"
- Backend receives urgency flag
```

#### **Enhanced Keyword Tests**
```
Input: "Khi nào tôi nên khám lại?"
Expected:
- shouldSuggest: true
- isFollowUp: true
- Detected as follow-up question
```

### 3. Demo Features

#### **Keyword Demo Enhancements**
- ✅ **Follow-up Detection**: Visual indicator for follow-up keywords
- ✅ **Enhanced Test Cases**: More comprehensive test scenarios
- ✅ **Better UI**: Improved result display with follow-up chips

---

## 📊 Backend Integration

### 1. Request Format

#### **Enhanced Request**
```json
{
  "conversationId": "conv_123",
  "message": "Tôi muốn tái khám",
  "userId": "user_456",
  "imageUrls": [],
  "options": {
    "suggestAppointment": true,
    "isFollowUpAppointment": true,
    "userSymptoms": ["đau đầu"],
    "urgency": "normal",
    "lastAppointmentId": "appt_789"
  }
}
```

### 2. Response Format

#### **Follow-up Response**
```json
{
  "success": true,
  "data": {
    "reply": "Dựa trên lịch sử khám bệnh của bạn, tôi gợi ý bạn nên tái khám sau 2 tuần để theo dõi tình trạng sức khỏe.",
    "appointmentSuggestion": {
      "type": "follow_up",
      "doctorId": "doc_789",
      "doctorName": "BS. Nguyễn Văn A",
      "isFollowUp": true,
      "lastAppointmentId": "appt_789",
      "followUpReason": "Tái khám theo dõi tình trạng sức khỏe",
      "suggestedDate": "2024-02-03",
      "suggestedTime": "10:00",
      "confirmationRequired": true,
      "confirmationMessage": "Bạn có muốn đặt lịch tái khám này không?"
    }
  }
}
```

---

## 🚀 Usage Instructions

### 1. For Users

#### **Follow-up Appointments**
1. Gửi tin nhắn chứa từ khóa tái khám: "tái khám", "khám lại", "hẹn lại"
2. AI sẽ tự động detect và gợi ý tái khám
3. UI sẽ hiển thị "Gợi ý tái khám" với thông tin follow-up
4. Buttons sẽ hiển thị "Đặt tái khám" / "Không tái khám"

#### **Urgency Detection**
1. Gửi tin nhắn chứa từ khóa khẩn cấp: "khẩn cấp", "gấp", "cấp cứu"
2. AI sẽ detect urgency level và ưu tiên xử lý
3. Backend sẽ nhận urgency flag để xử lý phù hợp

### 2. For Developers

#### **Testing**
```bash
# Start development server
npm run dev

# Test follow-up keywords
# http://localhost:3000/demo/chat-keyword-demo
# Try: "Tôi muốn tái khám", "Khi nào khám lại?"

# Test appointment UI
# http://localhost:3000/demo/chat-appointment-demo
# Check follow-up UI states

# Test real chat
# http://localhost:3000/dashboard/chat
# Send: "test", "tái khám", "khám lại"
```

---

## 📁 File Structure

```
src/
├── sections/chat/
│   ├── chat-appointment-suggestion.tsx    ← Enhanced with follow-up UI
│   ├── chat-keyword-demo.tsx             ← Enhanced with follow-up detection
│   ├── view/chat-view.tsx                 ← Enhanced with follow-up logic
│   └── FRONTEND_BACKEND_INTEGRATION_UPDATE.md ← This file
├── api/chat.ts                            ← Enhanced with follow-up options
├── types/chat.ts                          ← Enhanced with follow-up types
└── routes/
    ├── sections/demo.tsx                  ← Updated with keyword demo
    └── paths.ts                           ← Updated with keyword demo path
```

---

## 🔄 Integration Status

### Frontend Status
✅ **COMPLETED** - Enhanced frontend ready

### Features
- ✅ Enhanced keyword detection with follow-up support
- ✅ Urgency detection (normal, urgent, emergency)
- ✅ Follow-up appointment UI
- ✅ Enhanced API integration
- ✅ Updated data types
- ✅ Enhanced demo components
- ✅ Real-time sidebar updates
- ✅ Error handling and loading states

### Backend Requirements
- ✅ API specification updated
- ✅ Request/Response format defined
- ✅ Follow-up logic specified
- ✅ Urgency handling specified

---

## 🎯 Quick Test

### Test Follow-up Keywords
1. Truy cập `/demo/chat-keyword-demo`
2. Test messages: "tái khám", "khám lại", "hẹn lại"
3. Xem follow-up detection

### Test Real Chat
1. Truy cập `/dashboard/chat`
2. Gửi: "Tôi muốn tái khám"
3. Xem follow-up appointment suggestion

### Test Urgency
1. Gửi: "Tôi cần khám khẩn cấp"
2. Xem urgency detection

---

> **Lưu ý**: Frontend đã được cập nhật hoàn chỉnh để tích hợp với backend enhanced APIs. Tất cả follow-up appointment logic, urgency detection, và enhanced UI đã sẵn sàng sử dụng.