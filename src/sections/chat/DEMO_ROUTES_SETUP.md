# 🚀 Demo Routes Setup - Complete Guide

## 📋 Tổng quan

Đã setup hoàn chỉnh demo routes để test các tính năng chat sidebar và appointment suggestion. Bây giờ có thể truy cập demo pages qua URL.

---

## ✅ Demo Routes đã tạo

### 1. Route Configuration

#### **src/routes/sections/demo.tsx**
```typescript
export const demoRoutes = [
  {
    element: (
      <MainLayout>
        <Suspense fallback={<SplashScreen />}>
          <Outlet />
        </Suspense>
      </MainLayout>
    ),
    children: [
      {
        path: 'demo',
        children: [
          { path: 'chat-sidebar-demo', element: <ChatSidebarDemoPage /> },
          { path: 'chat-appointment-demo', element: <ChatAppointmentDemoPage /> },
        ],
      },
    ],
  },
];
```

#### **src/routes/paths.ts**
```typescript
// DEMO
demo: {
  root: ROOTS.DEMO,
  chatSidebar: `${ROOTS.DEMO}/chat-sidebar-demo`,
  chatAppointment: `${ROOTS.DEMO}/chat-appointment-demo`
}
```

### 2. Available Demo URLs

| Demo Page | URL | Description |
|-----------|-----|-------------|
| **Chat Sidebar Demo** | `/demo/chat-sidebar-demo` | Test conversation sidebar với real-time updates |
| **Chat Appointment Demo** | `/demo/chat-appointment-demo` | Test appointment suggestion UI |

---

## 🎯 Demo Features

### 1. Chat Sidebar Demo (`/demo/chat-sidebar-demo`)

#### **Features**
- ✅ **Real-time Updates**: Test cache management
- ✅ **API Integration**: Toggle between mock và real API
- ✅ **Pagination**: Load more conversations
- ✅ **Search**: Backend-driven search
- ✅ **Interactive Controls**: Add/Update conversations

#### **Test Buttons**
- **Add Mock Conversation**: Thêm conversation mới vào sidebar
- **Update Selected**: Cập nhật conversation đã chọn
- **Real API Toggle**: Switch giữa mock data và real backend
- **Load More**: Test pagination
- **Search**: Test search functionality

#### **Real-time Testing**
```typescript
// Test thêm conversation mới
const handleAddMockConversation = () => {
  const newConversation = {
    id: `conv_mock_${Date.now()}`,
    title: 'AI - gpt-4o (Mock)',
    lastMessage: 'Đây là tin nhắn mới được thêm vào sidebar!',
    // ... other fields
  }
  
  if (useRealAPI) {
    addConversationToCache('test_user', newConversation)
  }
}
```

### 2. Chat Appointment Demo (`/demo/chat-appointment-demo`)

#### **Features**
- ✅ **Appointment Suggestion UI**: Test suggestion component
- ✅ **Multiple States**: Pending, Accepted, Rejected, Loading
- ✅ **Interactive Actions**: Accept/Reject buttons
- ✅ **Real API Integration**: Test với actual appointment API

#### **Test Scenarios**
- **Pending State**: Hiển thị suggestion với buttons
- **Loading State**: Test loading khi accept/reject
- **Success State**: Test accepted appointment
- **Error State**: Test error handling

---

## 🔧 Technical Implementation

### 1. Route Structure

```
/demo/
├── chat-sidebar-demo     → ChatSidebarDemoPage
└── chat-appointment-demo → ChatAppointmentDemoPage
```

### 2. Layout Integration

- **MainLayout**: Sử dụng layout chính với navigation
- **Suspense**: Loading fallback cho lazy loading
- **Helmet**: SEO meta tags cho mỗi demo page

### 3. Component Structure

```
src/pages/demo/
├── chat-sidebar-demo.tsx     → Page wrapper
└── chat-appointment-demo.tsx → Page wrapper

src/sections/chat/
├── chat-sidebar-demo.tsx     → Demo component
└── chat-appointment-demo.tsx → Demo component
```

---

## 🧪 Testing Guide

### 1. Access Demo Pages

#### **Development Server**
```bash
npm run dev
# Server starts at http://localhost:3000
```

#### **Demo URLs**
- **Sidebar Demo**: http://localhost:3000/demo/chat-sidebar-demo
- **Appointment Demo**: http://localhost:3000/demo/chat-appointment-demo

### 2. Test Scenarios

#### **Chat Sidebar Demo**
1. **Mock Data Testing**
   - Toggle "Use Real API" OFF
   - Test các buttons: Add Mock, Update Selected
   - Kiểm tra sidebar updates

2. **Real API Testing**
   - Toggle "Use Real API" ON
   - Test với actual backend
   - Kiểm tra pagination và search

3. **Real-time Updates**
   - Add conversation mới
   - Update conversation hiện tại
   - Kiểm tra cache updates

#### **Chat Appointment Demo**
1. **UI States**
   - Test các states: Pending, Loading, Success, Error
   - Kiểm tra button interactions
   - Test responsive design

2. **API Integration**
   - Test accept appointment
   - Test reject appointment
   - Kiểm tra error handling

---

## 📊 Demo Data

### 1. Mock Conversations

```typescript
const mockConversations: ConversationItem[] = [
  {
    id: 'conv_001',
    title: 'AI - gpt-4o',
    lastMessage: 'Tôi có thể giúp gì cho bạn?',
    updatedAt: '2024-01-15T10:30:00Z',
    unread: false,
    model_used: 'gpt-4o',
    type: 'ai',
    unread_count: 0,
    created_at: '2024-01-15T10:00:00Z',
    user_id: 'test_user'
  },
  // ... more mock data
]
```

### 2. Mock Appointment Suggestions

```typescript
const mockSuggestion = {
  doctorId: 'doc_001',
  doctorName: 'Dr. Nguyễn Văn A',
  doctorAvatar: '/assets/images/avatar/avatar_1.jpg',
  doctorSpecialty: 'Tim mạch',
  suggestedDate: '2024-01-20',
  suggestedTime: '14:00',
  reason: 'Khám định kỳ',
  estimatedDuration: 30,
  location: 'Phòng khám 101',
  price: 500000
}
```

---

## 🚀 Usage Instructions

### 1. Development

```bash
# Start development server
npm run dev

# Access demo pages
# http://localhost:3000/demo/chat-sidebar-demo
# http://localhost:3000/demo/chat-appointment-demo
```

### 2. Production

```bash
# Build for production
npm run build

# Demo pages sẽ available tại:
# /demo/chat-sidebar-demo
# /demo/chat-appointment-demo
```

### 3. Navigation

- **From Dashboard**: Có thể thêm links trong navigation
- **Direct Access**: Truy cập trực tiếp qua URL
- **Bookmark**: Bookmark demo pages để test nhanh

---

## 📞 Support

### Status
✅ **COMPLETED** - Demo routes working

### Features
- ✅ Chat Sidebar Demo với real-time updates
- ✅ Chat Appointment Demo với multiple states
- ✅ Real API integration
- ✅ Mock data testing
- ✅ Interactive controls
- ✅ Responsive design

### Testing
- ✅ Route configuration
- ✅ Component integration
- ✅ Layout setup
- ✅ SEO meta tags

---

## 🔗 Quick Links

- **Chat Sidebar Demo**: `/demo/chat-sidebar-demo`
- **Chat Appointment Demo**: `/demo/chat-appointment-demo`
- **Main Chat**: `/dashboard/chat`
- **Documentation**: `src/sections/chat/REAL_TIME_SIDEBAR_UPDATES.md`

---

> **Lưu ý**: Demo routes đã hoàn thành và sẵn sàng sử dụng. Có thể truy cập demo pages để test các tính năng chat sidebar và appointment suggestion.
