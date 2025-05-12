# Agent AI Knowledge Base

## 1. Domain Knowledge

### Chat System

- Cấu trúc tin nhắn và cuộc trò chuyện
- Luồng xử lý tin nhắn
- Cách lưu trữ lịch sử chat
- Xử lý lỗi và edge cases

### Appointment System

- Các trạng thái lịch hẹn
- Quy trình tạo/cập nhật lịch hẹn
- Phân quyền theo role
- Validation rules

### Video Call System

- Stringee integration
- Call states và transitions
- Media handling
- Error recovery

### User Management

- User roles và permissions
- Authentication flow
- Profile management
- Security rules

## 2. Code Patterns

### Component Patterns

```typescript
// Container Pattern
function ContainerComponent() {
  // State management
  // Data fetching
  // Event handlers
  return <PresentationalComponent {...props} />
}

// Presentational Pattern
function PresentationalComponent({ data, handlers }) {
  // Pure rendering
  return <div>{/* UI */}</div>
}
```

### State Management Patterns

```typescript
// Zustand Store Pattern
interface Store {
  state: State;
  actions: Actions;
}

const useStore = create<Store>((set) => ({
  state: initialState,
  actions: {
    updateState: (newState) => set({ state: newState }),
  },
}));
```

### Error Handling Patterns

```typescript
// Error Boundary Pattern
class ErrorBoundary extends React.Component {
  state = { hasError: false }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />
    }
    return this.props.children
  }
}
```

## 3. Common Tasks

### Code Generation

- Tạo components mới
- Tạo custom hooks
- Tạo API endpoints
- Tạo test cases

### Code Modification

- Update existing components
- Add new features
- Fix bugs
- Optimize performance

### Code Review

- Check best practices
- Validate types
- Check security
- Check performance

## 4. Context Understanding

### Project Structure

```
src/
  components/
  hooks/
  api/
  types/
  utils/
  store/
```

### Key Files

- `src/types/*.ts`: Type definitions
- `src/api/*.ts`: API integration
- `src/store/*.ts`: State management
- `src/hooks/*.ts`: Custom hooks

### Dependencies

- React/Next.js
- TypeScript
- Zustand
- Stringee
- Tailwind/Stylus

## 5. Response Templates

### Code Generation

```typescript
// Component Template
function ComponentName({ prop1, prop2 }: ComponentProps) {
  // State
  const [state, setState] = useState(initialState)

  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies])

  // Handlers
  const handleEvent = useCallback(() => {
    // Handler logic
  }, [dependencies])

  return (
    <div>
      {/* Component JSX */}
    </div>
  )
}
```

### Error Response

```typescript
// Error Template
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: any
  }
}
```

## 6. Best Practices

### Code Style

- Use TypeScript
- Follow Standard.js
- Use functional components
- Use hooks properly

### Performance

- Memoize expensive computations
- Use proper dependencies
- Implement lazy loading
- Optimize renders

### Security

- Validate inputs
- Sanitize data
- Handle errors
- Protect sensitive data

### Testing

- Write unit tests
- Test edge cases
- Mock external dependencies
- Test error scenarios
