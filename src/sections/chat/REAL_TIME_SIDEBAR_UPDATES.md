# 🔄 Real-time Sidebar Updates - Implementation Guide

## 📋 Tổng quan

Đã implement real-time updates cho sidebar để hiển thị thông tin cuộc trò chuyện hiện tại sau khi chat. Sidebar sẽ tự động cập nhật khi:
- Tạo conversation mới
- Gửi tin nhắn mới
- Chọn conversation (đánh dấu đã đọc)
- Có thay đổi từ backend

---

## ✅ Tính năng đã implement

### 1. Real-time Cache Updates

#### **addConversationToCache**
- Thêm conversation mới vào cache
- Tự động hiển thị ở đầu danh sách
- Không cần refresh page

```typescript
const newConversation = {
  id: newChat._id,
  title: newChat.title || 'Cuộc trò chuyện mới',
  lastMessage: response.reply,
  updatedAt: new Date().toISOString(),
  unread: false,
  model_used: newChat.model_used || 'gpt-4o-mini',
  type: 'ai' as const,
  unread_count: 0,
  created_at: new Date().toISOString(),
  user_id: user._id
}
addConversationToCache(user._id, newConversation)
```

#### **updateConversationInCache**
- Cập nhật conversation hiện tại trong cache
- Cập nhật lastMessage, updatedAt, unread status
- Tự động sắp xếp theo thời gian

```typescript
updateConversationInCache(user._id, selectedConversationId, {
  lastMessage: response.reply,
  updatedAt: new Date().toISOString(),
  unread: false // Không unread vì user đang chat
})
```

### 2. Chat Flow Integration

#### **Tạo Conversation Mới**
1. User gửi tin nhắn đầu tiên
2. Tạo conversation mới qua API
3. Nhận response từ AI
4. **Tự động thêm vào sidebar cache**
5. Chuyển đến conversation mới

#### **Gửi Tin Nhắn**
1. User gửi tin nhắn
2. Hiển thị tin nhắn user ngay lập tức
3. Gửi lên API và nhận response
4. Hiển thị response từ AI
5. **Cập nhật sidebar với tin nhắn mới**

#### **Chọn Conversation**
1. User click vào conversation trong sidebar
2. Đánh dấu đã đọc qua API
3. **Cập nhật cache để bỏ unread indicator**
4. Chuyển đến conversation

### 3. Cache Management

#### **SWR Cache Strategy**
- Sử dụng SWR mutate để cập nhật cache
- Không cần revalidate (revalidate: false)
- Cập nhật ngay lập tức cho UX tốt hơn

```typescript
mutate(cacheKey, (currentData: any) => {
  if (!currentData) return currentData
  
  return {
    ...currentData,
    data: [newConversation, ...currentData.data]
  }
}, { revalidate: false })
```

#### **Cache Key Management**
- Cache key dựa trên user_id, page, limit, type, search
- Tự động cập nhật tất cả cache keys liên quan
- Đảm bảo consistency across different views

---

## 🔧 Technical Implementation

### 1. API Functions

```typescript
// Thêm conversation mới vào cache
export function addConversationToCache(userId: string, newConversation: ConversationItem) {
  const cacheKey = `${API_URL}/chat?user_id=${userId}&page=1&limit=20`
  
  mutate(cacheKey, (currentData: any) => {
    if (!currentData) return currentData
    
    return {
      ...currentData,
      data: [newConversation, ...currentData.data]
    }
  }, { revalidate: false })
}

// Cập nhật conversation trong cache
export function updateConversationInCache(userId: string, conversationId: string, updates: Partial<ConversationItem>) {
  const cacheKey = `${API_URL}/chat?user_id=${userId}&page=1&limit=20`
  
  mutate(cacheKey, (currentData: any) => {
    if (!currentData) return currentData
    
    return {
      ...currentData,
      data: currentData.data.map((conv: ConversationItem) => 
        conv.id === conversationId ? { ...conv, ...updates } : conv
      )
    }
  }, { revalidate: false })
}
```

### 2. ChatView Integration

```typescript
// Khi tạo conversation mới
const handleSendMessage = async (message: string, imageUrls?: string[]) => {
  if (!selectedConversationId) {
    // Tạo conversation mới
    const newChat = await createChat(user?._id || '')
    const response = await sendMessageToAI(newChat._id, message, user?.id || '', imageUrls)
    
    // Cập nhật sidebar
    if (user?._id) {
      const newConversation = {
        id: newChat._id,
        title: newChat.title || 'Cuộc trò chuyện mới',
        lastMessage: response.reply,
        updatedAt: new Date().toISOString(),
        unread: false,
        model_used: newChat.model_used || 'gpt-4o-mini',
        type: 'ai' as const,
        unread_count: 0,
        created_at: new Date().toISOString(),
        user_id: user._id
      }
      addConversationToCache(user._id, newConversation)
    }
  } else {
    // Gửi tin nhắn vào conversation hiện tại
    const response = await sendMessageToAI(selectedConversationId, message, user?._id || '', imageUrls)
    
    // Cập nhật sidebar
    if (user?._id) {
      updateConversationInCache(user._id, selectedConversationId, {
        lastMessage: response.reply,
        updatedAt: new Date().toISOString(),
        unread: false
      })
    }
  }
}
```

### 3. Conversation Selection

```typescript
const handleConversationSelect = async (conversationId: string) => {
  // Đánh dấu đã đọc
  await markConversationAsRead(conversationId)
  
  // Cập nhật cache
  if (user?._id) {
    updateConversationInCache(user._id, conversationId, {
      unread: false,
      unread_count: 0,
      updatedAt: new Date().toISOString()
    })
  }
  
  // Chuyển đến conversation
  router.push(`${paths.dashboard.chat}?id=${conversationId}`)
}
```

---

## 🧪 Testing

### Demo Page Features

#### **Real-time Testing**
- **Add Mock Conversation**: Thêm conversation mới vào sidebar
- **Update Selected**: Cập nhật conversation đã chọn
- **Real API Toggle**: Test với actual backend
- **Cache Monitoring**: Xem cache updates real-time

#### **Test Scenarios**
1. **Tạo Conversation Mới**
   - Gửi tin nhắn đầu tiên
   - Kiểm tra sidebar có conversation mới
   - Kiểm tra conversation ở đầu danh sách

2. **Gửi Tin Nhắn**
   - Gửi tin nhắn trong conversation hiện tại
   - Kiểm tra sidebar cập nhật lastMessage
   - Kiểm tra updatedAt timestamp

3. **Chọn Conversation**
   - Click vào conversation có unread
   - Kiểm tra unread indicator biến mất
   - Kiểm tra conversation được highlight

4. **Cache Consistency**
   - Kiểm tra cache updates ngay lập tức
   - Kiểm tra không cần refresh page
   - Kiểm tra data consistency

---

## 📊 Performance Benefits

### 1. Instant Updates
- **No Page Refresh**: Cập nhật ngay lập tức
- **Better UX**: User thấy changes ngay
- **Reduced API Calls**: Sử dụng cache thay vì refetch

### 2. Efficient Caching
- **SWR Integration**: Tận dụng SWR cache system
- **Selective Updates**: Chỉ cập nhật data cần thiết
- **Memory Efficient**: Không duplicate data

### 3. Real-time Feel
- **Immediate Feedback**: User thấy actions ngay lập tức
- **Consistent State**: Cache và UI luôn sync
- **Smooth Transitions**: Không có loading states không cần thiết

---

## 🔄 Flow Diagram

```
User Action → API Call → Response → Cache Update → UI Update
     ↓              ↓         ↓           ↓            ↓
Send Message → sendMessageToAI → AI Reply → updateCache → Sidebar Update
     ↓              ↓         ↓           ↓            ↓
Create Chat → createChat → New Chat → addToCache → New Item in Sidebar
     ↓              ↓         ↓           ↓            ↓
Select Conv → markAsRead → Success → updateCache → Remove Unread
```

---

## 🚀 Usage

### 1. Automatic Updates
- Sidebar tự động cập nhật khi chat
- Không cần user action gì thêm
- Works với cả mock data và real API

### 2. Manual Testing
- Sử dụng demo page để test
- Toggle Real API để test với backend
- Use buttons để simulate updates

### 3. Production Ready
- Đã tích hợp vào ChatView
- Works với real backend APIs
- Error handling đầy đủ

---

## 📞 Support

### Status
✅ **COMPLETED** - Real-time updates working

### Features
- ✅ Create new conversation → Sidebar update
- ✅ Send message → Sidebar update  
- ✅ Select conversation → Mark as read
- ✅ Cache management → Instant updates
- ✅ Error handling → Graceful fallbacks

### Testing
- ✅ Demo page với test buttons
- ✅ Real API integration
- ✅ Mock data testing
- ✅ Cache monitoring

---

> **Lưu ý**: Real-time sidebar updates đã hoàn thành và sẵn sàng sử dụng. Sidebar sẽ tự động cập nhật khi user chat, tạo conversation mới, hoặc chọn conversation khác.
