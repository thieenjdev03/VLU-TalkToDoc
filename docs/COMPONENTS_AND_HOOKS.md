# Components và Hooks Documentation

## Components

### 1. Chat Components

#### ChatView

```typescript
// Container component cho tính năng chat
interface ChatViewProps {
  selectedConversationId: string;
  user: IUser;
}

// Chức năng:
- Quản lý state của chat
- Xử lý gửi tin nhắn
- Tạo cuộc trò chuyện mới
- Hiển thị lỗi
```

#### ChatMessageList

```typescript
interface ChatMessageListProps {
  messages: IChatMessage[];
  userProfile: IUser;
}

// Chức năng:
- Hiển thị danh sách tin nhắn
- Scroll tự động
- Phân biệt tin nhắn người dùng và AI
```

#### ChatMessageItem

```typescript
interface ChatMessageItemProps {
  message: IChatMessage;
  isCurrentUser: boolean;
  userProfile: IUser;
}

// Chức năng:
- Hiển thị từng tin nhắn
- Hiển thị avatar
- Format nội dung tin nhắn
```

#### ChatMessageInput

```typescript
interface ChatMessageInputProps {
  onSendMessage: (message: string) => void;
  disabled?: boolean;
}

// Chức năng:
- Input để nhập tin nhắn
- Nút gửi tin nhắn
- Xử lý Enter để gửi
```

### 2. Appointment Components

#### AppointmentListView

```typescript
interface AppointmentListViewProps {
  userRole: 'ADMIN' | 'DOCTOR' | 'PATIENT';
}

// Chức năng:
- Hiển thị danh sách lịch hẹn
- Quản lý filters
- Xử lý các actions
```

#### AppointmentTableToolbar

```typescript
interface AppointmentTableToolbarProps {
  filters: IAppointmentTableFilters;
  onFilters: (name: string, value: any) => void;
  dateError: boolean;
}

// Chức năng:
- Hiển thị các bộ lọc
- Tìm kiếm
- Lọc theo ngày
```

#### AppointmentTableRow

```typescript
interface AppointmentTableRowProps {
  row: IAppointmentItem;
  selected: boolean;
  onSelectRow: () => void;
  onDeleteRow: () => void;
  onViewRow: () => void;
}

// Chức năng:
- Hiển thị thông tin lịch hẹn
- Xử lý các actions
- Hiển thị trạng thái
```

### 3. Video Call Components

#### CallCenter

```typescript
interface CallCenterProps {
  stringeeAccessToken: string;
  fromUserId: string;
  userInfor: IUser;
  currentAppointment: IAppointmentItem;
}

// Chức năng:
- Quản lý kết nối Stringee
- Hiển thị video
- Điều khiển cuộc gọi
```

#### VideoDisplay

```typescript
interface VideoDisplayProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  isVideoEnabled: boolean;
}

// Chức năng:
- Hiển thị video local và remote
- Xử lý video stream
```

#### CallControls

```typescript
interface CallControlsProps {
  isMuted: boolean;
  isVideoEnabled: boolean;
  onMute: () => void;
  onToggleVideo: () => void;
  onEndCall: () => void;
}

// Chức năng:
- Điều khiển âm thanh
- Điều khiển video
- Kết thúc cuộc gọi
```

## Custom Hooks

### 1. Chat Hooks

#### useChatHistory

```typescript
function useChatHistory(chatId: string) {
  // Returns:
  // - messages: IChatMessage[]
  // - addMessage: (message: IChatMessage) => void
  // - addMessages: (messages: IChatMessage[]) => void
  // - clearHistory: () => void
}

// Chức năng:
- Lưu trữ lịch sử chat trong localStorage
- Quản lý state của messages
- Thêm/xóa tin nhắn
```

#### useGetMessage

```typescript
function useGetMessage({
  message,
  participants,
  currentUserId,
}: {
  message: IChatMessage;
  participants: IChatParticipant[];
  currentUserId: string;
}) {
  // Returns:
  // - hasImage: boolean
  // - me: boolean
  // - sender: IChatParticipant
}

// Chức năng:
- Xử lý thông tin tin nhắn
- Xác định người gửi
- Kiểm tra loại tin nhắn
```

### 2. Appointment Hooks

#### useAppointmentFilters

```typescript
function useAppointmentFilters() {
  // Returns:
  // - filters: IAppointmentTableFilters
  // - setFilters: (filters: IAppointmentTableFilters) => void
  // - resetFilters: () => void
}

// Chức năng:
- Quản lý state của filters
- Reset filters
- Validate filters
```

### 3. Video Call Hooks

#### useCallState

```typescript
function useCallState() {
  // Returns:
  // - callState: CallState
  // - updateCallState: (state: Partial<CallState>) => void
  // - resetCallState: () => void
}

// Chức năng:
- Quản lý state của cuộc gọi
- Cập nhật trạng thái
- Reset trạng thái
```

### 4. Auth Hooks

#### useAuth

```typescript
function useAuth() {
  // Returns:
  // - user: IUser | null
  // - isAuthenticated: boolean
  // - login: (email: string, password: string) => Promise<void>
  // - logout: () => Promise<void>
  // - register: (userData: Partial<IUser>) => Promise<void>
}

// Chức năng:
- Quản lý authentication state
- Xử lý login/logout
- Kiểm tra quyền truy cập
```

## Best Practices cho Components

1. **Component Structure**

- Tách biệt logic và UI
- Sử dụng custom hooks cho logic phức tạp
- Props validation với TypeScript
- Memoization khi cần thiết

2. **State Management**

- Local state cho UI state
- Global state cho shared state
- Context cho theme/auth
- Zustand cho complex state

3. **Performance**

- React.memo cho pure components
- useCallback cho event handlers
- useMemo cho expensive computations
- Lazy loading cho large components

4. **Error Handling**

- Error boundaries
- Fallback UI
- Loading states
- Error states

5. **Accessibility**

- Semantic HTML
- ARIA attributes
- Keyboard navigation
- Screen reader support

## Best Practices cho Hooks

1. **Hook Structure**

- Single responsibility
- Pure functions
- Proper cleanup
- Error handling

2. **State Management**

- Immutable updates
- Batched updates
- Proper dependencies
- Memoization

3. **Side Effects**

- Cleanup functions
- Proper dependencies
- Error handling
- Loading states

4. **Performance**

- Memoization
- Debouncing
- Throttling
- Lazy initialization
