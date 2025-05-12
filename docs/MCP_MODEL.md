# MCP Model Documentation

## 1. Chat với AI

### Model

```typescript
interface IChatMessage {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface IChatConversation {
  _id: string;
  messages: IChatMessage[];
  user_id: string;
}

interface IChatResponse {
  reply: string;
  messages: IChatMessage[];
}
```

### Controller

```typescript
// API Endpoints
const API_URL = 'http://localhost:3000';

// Tạo cuộc trò chuyện mới
async function createChat(userId: string): Promise<IChatConversation>;

// Gửi tin nhắn đến AI
async function sendMessageToAI(
  chatId: string,
  message: string,
  userId: string
): Promise<IChatResponse>;

// Lưu trữ lịch sử chat
function useChatHistory(chatId: string) {
  // Load messages from localStorage
  // Save messages to localStorage
  // Add new messages
  // Clear history
}
```

### Presenter

```typescript
// Components
- ChatView: Container component
- ChatMessageList: Hiển thị danh sách tin nhắn
- ChatMessageItem: Hiển thị từng tin nhắn
- ChatMessageInput: Input để gửi tin nhắn
- ChatHeaderDetail: Header của chat
```

## 2. Quản lý lịch hẹn

### Model

```typescript
interface IAppointmentItem {
  _id: string;
  patient: {
    _id: string;
    fullName: string;
    email: string;
  };
  doctor: {
    _id: string;
    fullName: string;
    specialty: string;
  };
  date: string;
  slot: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED';
  totalFee: number;
  paid: boolean;
}

interface IAppointmentTableFilters {
  patient: string;
  status: string;
  startDate: Date | null;
  endDate: Date | null;
  name: string;
}
```

### Controller

```typescript
// API Endpoints
async function getAllAppointment(): Promise<IAppointmentItem[]>;

// Filters
function applyFilter({
  inputData,
  comparator,
  filters,
  dateError,
}: {
  inputData: IAppointmentItem[];
  comparator: (a: any, b: any) => number;
  filters: IAppointmentTableFilters;
  dateError: boolean;
});

// Actions
function handleFilters(name: string, value: any);
function handleDeleteRow(id: string);
function handleViewRow(id: string);
```

### Presenter

```typescript
// Components
- AppointmentListView: Container component
- AppointmentTableToolbar: Toolbar với các bộ lọc
- AppointmentTableRow: Hiển thị từng dòng lịch hẹn
- AppointmentTableHead: Header của bảng
```

## 3. Gọi video trực tuyến

### Model

```typescript
interface CallComponentProps {
  stringeeAccessToken: string;
  fromUserId: string;
  userInfor: any;
  currentAppointment: any;
}

interface CallState {
  clientConnected: boolean;
  calling: boolean;
  incomingCall: any;
  isMuted: boolean;
  isVideoEnabled: boolean;
  callStatus: string;
  isVideoCall: boolean;
}
```

### Controller

```typescript
// Stringee Integration
function initializeStringeeClient(token: string);
function makeCall(video: boolean);
function endCall();
function answerIncomingCall();
function rejectIncomingCall();
function mute();
function enableVideo();

// Call State Management
function useCallState() {
  // Manage call state
  // Handle call events
  // Update UI based on call status
}
```

### Presenter

```typescript
// Components
- CallCenter: Container component
- VideoDisplay: Hiển thị video
- CallControls: Điều khiển cuộc gọi
- CallInfo: Hiển thị thông tin cuộc gọi
```

## 4. Quản lý người dùng

### Model

```typescript
interface IUser {
  _id: string;
  fullName: string;
  email: string;
  role: 'ADMIN' | 'DOCTOR' | 'PATIENT';
  avatarUrl: string;
  phoneNumber: string;
  address: string;
  specialty?: string; // Cho bác sĩ
}

interface IAuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
```

### Controller

```typescript
// Authentication
async function login(email: string, password: string);
async function logout();
async function register(userData: Partial<IUser>);

// User Management
async function getUsers(params: {
  typeUser: string;
  query: string;
  page: number;
  limit: number;
  sortField: string;
  sortOrder: string;
});

// Authorization
function useAuth() {
  // Check authentication
  // Handle permissions
  // Manage user session
}
```

### Presenter

```typescript
// Components
- AuthLayout: Layout cho các trang xác thực
- LoginForm: Form đăng nhập
- RegisterForm: Form đăng ký
- UserProfile: Hiển thị thông tin người dùng
- UserList: Danh sách người dùng
```

## Luồng dữ liệu

1. **Chat với AI**

```
User Input -> ChatMessageInput -> sendMessageToAI -> API -> IChatResponse -> ChatMessageList
```

2. **Quản lý lịch hẹn**

```
User Action -> AppointmentListView -> API -> IAppointmentItem[] -> AppointmentTableRow
```

3. **Gọi video trực tuyến**

```
User Action -> CallCenter -> Stringee Client -> Video Stream -> VideoDisplay
```

4. **Quản lý người dùng**

```
User Action -> Auth Components -> API -> IUser -> User Components
```

## Best Practices

1. **State Management**

- Sử dụng Zustand cho global state
- Local state cho component-specific data
- Caching với localStorage khi cần thiết

2. **Error Handling**

- Xử lý lỗi ở mọi API call
- Hiển thị thông báo lỗi thân thiện
- Log lỗi để debug

3. **Performance**

- Lazy loading cho components lớn
- Memoization cho expensive computations
- Optimistic updates cho UX tốt hơn

4. **Security**

- Validate input ở cả client và server
- Sanitize data trước khi render
- Xử lý authentication/authorization đúng cách
