# 📚 Chat Bot Service API Documentation

## 1. Tổng quan

Dịch vụ Chat Bot hỗ trợ hội thoại giữa người dùng và AI, nhận diện và trả lời thông minh dựa trên text và hình ảnh (qua URL). API hỗ trợ:

- Tạo cuộc hội thoại và chọn model AI ngay từ frontend
- Gửi tin nhắn (text/ảnh) và có thể đổi model ngay khi đang chat
- Đổi model cho một cuộc hội thoại qua endpoint riêng

---

## 2. Endpoint

- Tạo cuộc hội thoại: `POST /chat`
- Lấy chi tiết cuộc hội thoại: `GET /chat/:conversationId`
- Gửi tin nhắn: `POST /chat/:conversationId`
- Đổi model: `PATCH /chat/:conversationId/model`

Tất cả sử dụng `Content-Type: application/json`.

---

## 3. Tạo cuộc hội thoại (chọn model từ frontend)

### Request
```json
{
  "user_id": "user_123",
  "model_used": "gpt-4o-mini", // Optional - nếu thiếu sẽ dùng mặc định "gpt-3.5-turbo"
  "context": { "locale": "vi-VN" } // Optional
}
```

### Response (rút gọn)
```json
{
  "_id": "<conversationId>",
  "user_id": "user_123",
  "model_used": "gpt-4o-mini",
  "messages": [],
  "context": { "locale": "vi-VN" }
}
```

---

## 4. Gửi tin nhắn (có thể đổi model ngay trong request)

### 4.1. Gửi text + ảnh qua URL trong message

- Gửi ảnh bằng cách chèn URL ảnh vào chuỗi `message`.

Ví dụ:
```json
{
  "message": "Tôi bị nổi mẩn đỏ, đây là ảnh:\nhttps://example.com/image1.jpg https://example.com/image2.png",
  "user_id": "user_123",
  "model": "gpt-4o" // Optional - nếu truyền sẽ đổi model của cuộc hội thoại trước khi trả lời
}
```

### 4.2. Gửi text + ảnh qua trường `imageUrls` (Khuyến nghị)

```json
{
  "message": "Tôi bị đau bụng nhiều ngày",
  "user_id": "user_123",
  "imageUrls": ["https://example.com/image1.jpg", "https://example.com/image2.png"],
  "model": "gpt-4o-mini" // Optional
}
```

Lưu ý:
- Có thể gửi đồng thời URL ảnh trong `message` và trong `imageUrls`, backend sẽ gộp lại.
- Trường `message` có thể để trống nếu chỉ gửi ảnh.
- Nếu request có ảnh và không chỉ định `model`, backend sẽ dùng model vision mặc định `gpt-4o`.

### 4.3. Response mẫu
```json
{
  "reply": "AI trả lời phân tích cả text và ảnh...",
  "messages": [
    { "role": "user", "content": "Tôi bị đau bụng nhiều ngày https://example.com/image1.jpg" },
    { "role": "assistant", "content": "AI trả lời phân tích cả text và ảnh..." }
  ]
}
```

---

## 5. Đổi model cho cuộc hội thoại (endpoint riêng)

### Request
`PATCH /chat/:conversationId/model`
```json
{ "model": "gpt-3.5-turbo" }
```

### Response (rút gọn)
```json
{
  "_id": "<conversationId>",
  "model_used": "gpt-3.5-turbo"
}
```

---

## 6. Hướng dẫn frontend

- Khi tạo hội thoại, truyền `model_used` nếu muốn chọn model ngay từ đầu.
- Trong khi chat, có 2 cách đổi model:
  - Truyền `model` trong body của `POST /chat/:conversationId`
  - Hoặc gọi `PATCH /chat/:conversationId/model` để đổi trước, rồi gửi tin nhắn
- Với ảnh: nếu không truyền `model`, backend mặc định dùng `gpt-4o` (vision-capable).
- Hãy đảm bảo URL ảnh là public.

---

## 7. Lưu ý

- Có thể gửi nhiều ảnh cùng lúc, AI sẽ phân tích tổng thể.
- Nếu chỉ có text, AI trả lời như bình thường với `model_used` hiện tại.
- Nếu chỉ có ảnh, AI sẽ phân tích ảnh (ưu tiên model vision).
- Đảm bảo URL ảnh truy cập được từ internet.

---

## 8. Xử lý lỗi

- Ảnh không hợp lệ/không truy cập được: trả về thông báo lỗi thân thiện.
- API AI lỗi: trả về thông báo lỗi cho người dùng.

---

## 9. Ví dụ curl

Tạo hội thoại với model:
```bash
curl -X POST 'http://localhost:3000/chat' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "user_id": "user_123",
    "model_used": "gpt-4o-mini",
    "context": {"locale": "vi-VN"}
  }'
```

Gửi tin nhắn và đổi model ngay trong request:
```bash
curl -X POST 'http://localhost:3000/chat/<conversationId>' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "message": "Tôi bị đau bụng nhiều ngày",
    "user_id": "user_123",
    "model": "gpt-4o-mini"
  }'
```

Đổi model qua endpoint riêng:
```bash
curl -X PATCH 'http://localhost:3000/chat/<conversationId>/model' \
  -H 'Content-Type: application/json' \
  --data-raw '{"model": "gpt-3.5-turbo"}'
```

Gửi tin nhắn kèm ảnh (không chỉ định model → mặc định vision `gpt-4o`):
```bash
curl -X POST 'http://localhost:3000/chat/<conversationId>' \
  -H 'Content-Type: application/json' \
  --data-raw '{
    "message": "Tôi bị đau bụng nhiều ngày",
    "user_id": "user_123",
    "imageUrls": ["https://example.com/image1.jpg", "https://example.com/image2.png"]
  }'
```

---

**Nếu cần hỗ trợ thêm (upload ảnh, danh sách model hỗ trợ, giới hạn token...), vui lòng liên hệ backend để mở rộng API.**


---

## 10. UI chọn model (giống dropdown góc phải của ChatGPT)

### 10.1. Mục tiêu UX

- **Hiển thị model đang dùng** cho cuộc hội thoại (ví dụ: `gpt-4o`, `gpt-4o-mini`, `gpt-3.5-turbo`).
- **Cho phép đổi model nhanh** bằng dropdown ở góc phải thanh tiêu đề khung chat.
- **Lưu theo từng cuộc hội thoại**: khi đổi, model mới gắn với `conversationId` hiện tại.
- **Có thể override theo từng tin nhắn**: trong input gửi tin nhắn có thể đính kèm `model` để đổi tạm thời cho lần gửi đó.

### 10.2. Danh sách model khuyến nghị (frontend)

```ts
// src/constants/chat-models.ts
export const SUPPORTED_CHAT_MODELS = [
  { id: 'gpt-4o', label: 'GPT‑4o (Vision)' },
  { id: 'gpt-4o-mini', label: 'GPT‑4o mini' },
  { id: 'gpt-3.5-turbo', label: 'GPT‑3.5 Turbo' }
]
```

### 10.3. Dropdown chọn model trên thanh tiêu đề chat

```tsx
// Ví dụ đơn giản: đặt ở Header của khung chat
import { useState } from 'react'
import axios from 'axios'

type ModelOption = { id: string; label: string }

function ModelPicker({
  conversationId,
  currentModel,
  models,
  onChanged
}: {
  conversationId: string
  currentModel: string
  models: ModelOption[]
  onChanged?: (modelId: string) => void
}) {
  const [value, setValue] = useState(currentModel)

  const handleChange = async (modelId: string) => {
    setValue(modelId)
    // Gọi endpoint đổi model của cuộc hội thoại
    await axios.patch(`${import.meta.env.VITE_API_URL}/chat/${conversationId}/model`, {
      model: modelId
    })
    onChanged?.(modelId)
  }

  return (
    <select value={value} onChange={(e) => handleChange(e.target.value)}>
      {models.map((m) => (
        <option key={m.id} value={m.id}>
          {m.label}
        </option>
      ))}
    </select>
  )
}
```

Gợi ý UI: đặt ở góc phải header, kèm tooltip “Change model”. Khi đang xử lý request, có thể disabled dropdown.

### 10.4. Gửi tin nhắn với override theo từng lần gửi (tùy chọn)

```ts
// Nếu muốn override model cho 1 lần gửi
await axios.post(`${API_URL}/chat/${conversationId}`, {
  message: input,
  user_id: userId,
  model: 'gpt-4o-mini' // chỉ áp dụng cho request này
})
```

### 10.5. Tích hợp nhanh với layer API hiện có

- Đổi model toàn cục cho cuộc hội thoại: gọi `PATCH /chat/:conversationId/model` với `{ model }`.
- Gửi tin nhắn bình thường: `POST /chat/:conversationId` với `{ message, user_id }`.
- Gửi tin nhắn kèm ảnh: thêm `imageUrls: string[]`.
- Override model tạm thời: thêm trường `model` trong body của `POST`.

### 10.6. Lưu ý triển khai

- Persist model đã chọn vào state cuộc hội thoại để hiển thị lại khi reload.
- Nếu request chỉ có ảnh và không truyền `model`, backend tự dùng vision mặc định `gpt-4o`.
- Nên validate model trong danh sách hỗ trợ trước khi gửi request.

