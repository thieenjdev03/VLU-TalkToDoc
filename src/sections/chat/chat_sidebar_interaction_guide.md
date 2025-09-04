# 🧩 Chat Conversation Sidebar - FE/BE Interaction Guide

## 1. Mục tiêu
- Tạo sidebar hiển thị lịch sử hội thoại (conversation history) giữa user và AI/bác sĩ
- Cho phép user chuyển đổi, tìm kiếm, chọn và xem chi tiết hội thoại
- FE và BE giao tiếp với nhau theo chuẩn RESTful, data đồng nhất, realtime nếu cần

---

## 2. Kiến trúc tổng quan

- FE (React/Next.js): Hiển thị sidebar, fetch & render list hội thoại, select để xem detail
- BE (NestJS/Express): Trả về danh sách conversations theo user, chi tiết hội thoại, cập nhật trạng thái đọc, hỗ trợ search/filter
- FE dùng API BE để lấy data và cập nhật trạng thái, có thể dùng socket cho realtime

---

## 3. API Backend (chuẩn REST)

- `GET /chat?user_id=xxx` - Lấy list conversations cho user
- `GET /chat/:conversationId` - Lấy chi tiết hội thoại (messages, participants...)
- `PATCH /chat/:conversationId/read` - Đánh dấu đã đọc
- (Optional) `POST /chat` - Tạo mới hội thoại

### Example response for list conversations
```json
[
  {
    "id": "conv_001",
    "title": "AI - gpt-4o-mini",
    "lastMessage": "Bạn nhớ uống nhiều nước nhé...",
    "updatedAt": "2025-09-04T18:00:00Z",
    "unread": true,
    "model_used": "gpt-4o-mini",
    "type": "ai"
  },
  {
    "id": "conv_002",
    "title": "Bác sĩ Lan",
    "lastMessage": "Lần sau khám lại sau 1 tháng.",
    "updatedAt": "2025-09-01T11:02:00Z",
    "unread": false,
    "model_used": "doctor",
    "type": "doctor"
  }
]
```

---

## 4. Flow interaction FE <-> BE

1. **FE gọi API lấy list hội thoại:**
   - `GET /chat?user_id=xxx` → render vào sidebar
2. **FE render sidebar, hiển thị title, lastMessage, updatedAt, unread**
3. **User click vào 1 hội thoại:**
   - FE gọi `GET /chat/:conversationId` → render toàn bộ nội dung chat
   - FE có thể gọi `PATCH /chat/:conversationId/read` để đánh dấu đã đọc
4. **Search/filter:**
   - FE filter tại chỗ hoặc gọi lại API kèm query search nếu nhiều data
5. **Realtime (nếu có):**
   - FE nhận sự kiện socket khi có message mới → cập nhật lại list

---

## 5. FE - Sample component skeleton (React)
```jsx
import React, { useState } from "react";

export default function ConversationSidebar({ conversations, onSelect, selectedId }) {
  const [search, setSearch] = useState("");
  const filtered = conversations.filter(
    c =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <aside className="w-80 h-screen bg-white dark:bg-neutral-900 border-r flex flex-col">
      <div className="p-4 border-b">
        <input
          type="text"
          placeholder="Tìm kiếm cuộc trò chuyện..."
          className="w-full rounded-lg p-2 bg-neutral-100 dark:bg-neutral-800"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>
      <div className="flex-1 overflow-y-auto">
        <ul>
          {filtered.map(c => (
            <li
              key={c.id}
              className={`px-4 py-3 border-b cursor-pointer transition
                ${selectedId === c.id ? "bg-blue-50 dark:bg-neutral-800 font-semibold" : ""}
                ${c.unread ? "border-l-4 border-blue-500" : ""}`}
              onClick={() => onSelect(c.id)}
            >
              <div className="flex items-center justify-between">
                <span>{c.title}</span>
                {c.unread && <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>}
              </div>
              <div className="text-xs text-neutral-500 truncate">{c.lastMessage}</div>
              <div className="text-[11px] text-neutral-400">
                {new Date(c.updatedAt).toLocaleString("vi-VN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  day: "2-digit",
                  month: "2-digit",
                  year: "2-digit"
                })}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
```
---

## 6. Lưu ý triển khai
- Đảm bảo API trả về đúng cấu trúc FE cần (id, title, lastMessage, updatedAt, unread...)
- FE cần quản lý state conversation list, selectedId, update lại khi có message mới
- Đánh dấu đã đọc bằng cách gọi PATCH khi user mở hội thoại
- Có thể kết hợp socket.io hoặc Firebase realtime nếu muốn live update

---

## 7. Extension & Best Practice
- Pin/Archive: Cho phép FE gửi request pin/archive
- Thêm avatar, badge model_used (gpt-4o, doctor...)
- Pagination/Infinite scroll nếu nhiều hội thoại
- Search/filter hỗ trợ BE nếu cần
- Responsive cho mobile/tablet

---

> Ghi chú: File này có thể dùng trực tiếp cho onboarding dev, làm guideline tự động cho Cursor, hoặc tài liệu review task giữa BE và FE!

