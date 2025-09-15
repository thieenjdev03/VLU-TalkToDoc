# Cách xử lý an toàn cho các field con của data.nextAppointment

## Vấn đề
Khi các field con của `data.nextAppointment` bị thiếu hoặc undefined, có thể gây ra lỗi runtime.

## Các giải pháp

### 1. Optional Chaining và Nullish Coalescing (Đơn giản nhất)

```tsx
// Thay vì:
{data.nextAppointment.payment.doctorFee.toLocaleString('vi-VN')}

// Sử dụng:
{(data.nextAppointment.payment?.doctorFee || 0).toLocaleString('vi-VN')}
```

**Ưu điểm:**
- Đơn giản, dễ đọc
- Không cần thêm code phức tạp

**Nhược điểm:**
- Vẫn có thể gặp lỗi nếu cấu trúc data thay đổi
- Khó debug khi có lỗi

### 2. Helper Functions với Try-Catch

```tsx
const safeGetPaymentInfo = (payment: any) => {
  try {
    return {
      doctorFee: payment?.doctorFee || 0,
      platformFee: payment?.platformFee || 0,
      discount: payment?.discount || 0,
      total: payment?.total || 0,
      status: payment?.status || 'UNKNOWN',
      paymentMethod: payment?.paymentMethod || ''
    }
  } catch (error) {
    console.warn('Error accessing payment info:', error)
    return {
      doctorFee: 0,
      platformFee: 0,
      discount: 0,
      total: 0,
      status: 'UNKNOWN',
      paymentMethod: ''
    }
  }
}

// Sử dụng:
const paymentInfo = safeGetPaymentInfo(data.nextAppointment.payment)
{paymentInfo.doctorFee.toLocaleString('vi-VN')}
```

**Ưu điểm:**
- Xử lý lỗi tập trung
- Dễ debug và maintain
- Có fallback values

### 3. Custom Hooks (React way)

```tsx
// use-safe-data.ts
export const useSafePaymentData = (payment: any) => {
  return useMemo(() => {
    try {
      return {
        doctorFee: payment?.doctorFee || 0,
        platformFee: payment?.platformFee || 0,
        discount: payment?.discount || 0,
        total: payment?.total || 0,
        status: payment?.status || 'UNKNOWN',
        paymentMethod: payment?.paymentMethod || ''
      }
    } catch (error) {
      console.warn('Error accessing payment data:', error)
      return {
        doctorFee: 0,
        platformFee: 0,
        discount: 0,
        total: 0,
        status: 'UNKNOWN',
        paymentMethod: ''
      }
    }
  }, [payment])
}

// Trong component:
const paymentInfo = useSafePaymentData(data.nextAppointment.payment)
```

**Ưu điểm:**
- Tái sử dụng được
- Performance tốt với useMemo
- React pattern chuẩn

### 4. Error Boundary Component

```tsx
// safe-render.tsx
export class SafeRender extends Component<Props, State> {
  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.warn('SafeRender caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert severity="warning">
          Có lỗi xảy ra khi hiển thị dữ liệu
        </Alert>
      )
    }
    return this.props.children
  }
}

// Sử dụng:
<SafeRender errorMessage="Không thể hiển thị thông tin lịch hẹn">
  <AppointmentInfoCard data={data} />
</SafeRender>
```

**Ưu điểm:**
- Catch được mọi lỗi trong component tree
- UI fallback đẹp
- Không crash toàn bộ app

### 5. Utility Functions

```tsx
// safe-render.tsx
export const safeGet = <T,>(
  obj: any,
  path: string,
  defaultValue: T
): T => {
  try {
    const keys = path.split('.')
    let result = obj
    
    for (const key of keys) {
      if (result == null || typeof result !== 'object') {
        return defaultValue
      }
      result = result[key]
    }
    
    return result !== undefined ? result : defaultValue
  } catch (error) {
    console.warn('Error accessing nested property:', error)
    return defaultValue
  }
}

// Sử dụng:
const doctorFee = safeGet(data, 'nextAppointment.payment.doctorFee', 0)
const doctorName = safeGet(data, 'doctorInfo.name', 'Chưa xác định')
```

**Ưu điểm:**
- Rất linh hoạt
- Có thể access nested properties sâu
- Type safe với TypeScript

## Kết hợp các phương pháp

### Ví dụ hoàn chỉnh:

```tsx
export const AppointmentInfoCard: React.FC<{ data: AppointmentInfo }> = ({ data }) => {
  // Sử dụng custom hook
  const paymentInfo = useSafePaymentData(data.nextAppointment?.payment)
  const doctorInfo = useSafeDoctorInfo(data.doctorInfo)
  
  return (
    <SafeRender errorMessage="Không thể hiển thị thông tin lịch hẹn">
      <Card>
        <CardContent>
          {/* Sử dụng safeGet cho nested properties */}
          <Typography>
            Bác sĩ: {safeGet(data, 'doctorInfo.name', 'Chưa xác định')}
          </Typography>
          
          {/* Sử dụng helper function */}
          <Typography>
            Phí bác sĩ: {safeFormatCurrency(paymentInfo.doctorFee)} VNĐ
          </Typography>
          
          {/* Conditional rendering với optional chaining */}
          {data.nextAppointment?.doctorNote && (
            <Box>
              <Typography>Ghi chú: {data.nextAppointment.doctorNote}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </SafeRender>
  )
}
```

## Khuyến nghị

1. **Sử dụng kết hợp**: Error Boundary + Helper Functions + Optional Chaining
2. **Luôn có fallback values**: Đảm bảo UI không bị crash
3. **Log errors**: Để debug và monitor
4. **Type safety**: Sử dụng TypeScript để catch errors compile time
5. **Test edge cases**: Test với data thiếu hoặc malformed

## Lưu ý

- Không nên chỉ dựa vào optional chaining
- Luôn có error handling và fallback UI
- Monitor console warnings để phát hiện data issues
- Có thể sử dụng validation library như Yup hoặc Zod
