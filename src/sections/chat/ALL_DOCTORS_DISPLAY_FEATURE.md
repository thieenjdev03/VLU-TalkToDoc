# 👨‍⚕️ All Doctors Display Feature - Hiển thị danh sách bác sĩ từ API

## 📋 Tổng quan

Tính năng mới cho phép hiển thị danh sách tất cả bác sĩ từ API khi không có recommended doctors từ backend.

---

## 🎯 Vấn đề giải quyết

**Trước đây**: Khi backend không trả về recommended doctors, UI sẽ không hiển thị danh sách bác sĩ nào.

**Bây giờ**: Tự động fetch danh sách tất cả bác sĩ từ API và hiển thị cho user lựa chọn.

---

## ✅ Tính năng đã implement

### 1. **API Functions**

```typescript
// Get all doctors API
export async function getAllDoctors(): Promise<Doctor[]> {
  try {
    const response = await axiosInstance.get(`${API_URL}/api/v1/doctors`)
    return response.data.doctors || response.data || []
  } catch (error) {
    console.error('Error fetching doctors:', error)
    throw error
  }
}

// Search doctors API
export async function searchDoctors(query: string, specialty?: string): Promise<Doctor[]> {
  try {
    const params = new URLSearchParams()
    params.append('q', query)
    if (specialty) params.append('specialty', specialty)
    
    const response = await axiosInstance.get(
      `${API_URL}/api/v1/doctors/search?${params.toString()}`
    )
    return response.data.doctors || response.data || []
  } catch (error) {
    console.error('Error searching doctors:', error)
    throw error
  }
}
```

### 2. **Enhanced AppointmentSuggestionCard**

#### **State Management**
```typescript
const [allDoctors, setAllDoctors] = useState<Doctor[]>([]);
const [doctorsLoading, setDoctorsLoading] = useState(false);
const [doctorsError, setDoctorsError] = useState<string | null>(null);
```

#### **Auto-fetch Logic**
```typescript
useEffect(() => {
  const hasRecommendedDoctors = (data.availableDoctors && data.availableDoctors.length > 0) || 
                               (data.recommendedDoctors && data.recommendedDoctors.length > 0);
  
  if (!hasRecommendedDoctors && allDoctors.length === 0 && !doctorsLoading) {
    setDoctorsLoading(true);
    setDoctorsError(null);
    
    getAllDoctors()
      .then(doctors => {
        setAllDoctors(doctors);
        setDoctorsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching doctors:', error);
        setDoctorsError('Không thể tải danh sách bác sĩ');
        setDoctorsLoading(false);
      });
  }
}, [data.availableDoctors, data.recommendedDoctors, allDoctors.length, doctorsLoading]);
```

#### **Smart Doctor Selection**
```typescript
// Get doctors to display (recommended or all doctors)
const doctorsToDisplay = useMemo(() => {
  const hasRecommendedDoctors = (data.availableDoctors && data.availableDoctors.length > 0) || 
                               (data.recommendedDoctors && data.recommendedDoctors.length > 0);
  
  if (hasRecommendedDoctors) {
    return data.availableDoctors || data.recommendedDoctors || [];
  }
  
  return allDoctors;
}, [data.availableDoctors, data.recommendedDoctors, allDoctors]);
```

### 3. **Enhanced UI States**

#### **Loading State**
```typescript
{doctorsLoading && (
  <Alert severity="info" sx={{ mb: 2 }}>
    <Typography variant="body2">
      Đang tải danh sách bác sĩ...
    </Typography>
  </Alert>
)}
```

#### **Error State**
```typescript
{doctorsError && (
  <Alert severity="error" sx={{ mb: 2 }}>
    <Typography variant="body2">
      {doctorsError}
    </Typography>
  </Alert>
)}
```

#### **Empty State**
```typescript
{filteredDoctors.length === 0 && selectedSpecialty === 'all' && !doctorsLoading && !doctorsError && (
  <Alert severity="warning" sx={{ mt: 2 }}>
    Không có bác sĩ nào có sẵn tại thời điểm này.
  </Alert>
)}
```

#### **Dynamic Title**
```typescript
<Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 'bold' }}>
  {doctorsToDisplay.length > 0 ? 
    `Bác sĩ ${(data.availableDoctors && data.availableDoctors.length > 0) || (data.recommendedDoctors && data.recommendedDoctors.length > 0) ? 'được gợi ý' : 'có sẵn'} (${filteredDoctors.length})` :
    'Bác sĩ có sẵn'
  }
</Typography>
```

---

## 🔄 Logic Flow

### **1. Check for Recommended Doctors**
```typescript
const hasRecommendedDoctors = (data.availableDoctors && data.availableDoctors.length > 0) || 
                             (data.recommendedDoctors && data.recommendedDoctors.length > 0);
```

### **2. Auto-fetch All Doctors**
- Nếu không có recommended doctors
- Và chưa có allDoctors
- Và không đang loading
- → Gọi API getAllDoctors()

### **3. Display Logic**
- **Có recommended doctors**: Hiển thị recommended doctors
- **Không có recommended doctors**: Hiển thị all doctors từ API
- **Loading**: Hiển thị loading state
- **Error**: Hiển thị error state
- **Empty**: Hiển thị empty state

---

## 📊 User Experience

### **Scenario 1: Có Recommended Doctors**
```
Backend Response: { recommendedDoctors: [...] }
UI Display: "Bác sĩ được gợi ý (3)"
Action: Không fetch API, hiển thị recommended doctors
```

### **Scenario 2: Không có Recommended Doctors**
```
Backend Response: { recommendedDoctors: [] }
UI Display: "Đang tải danh sách bác sĩ..."
Action: Fetch API getAllDoctors()
Result: "Bác sĩ có sẵn (15)"
```

### **Scenario 3: API Error**
```
Backend Response: { recommendedDoctors: [] }
UI Display: "Đang tải danh sách bác sĩ..."
API Error: Network error
Result: "Không thể tải danh sách bác sĩ"
```

### **Scenario 4: Empty Doctors**
```
Backend Response: { recommendedDoctors: [] }
API Response: []
UI Display: "Không có bác sĩ nào có sẵn tại thời điểm này."
```

---

## 🎯 Tính năng nâng cao

### **1. Specialty Filtering**
- Tự động extract specialties từ doctors
- Filter theo chuyên khoa
- Support cả recommended và all doctors

### **2. Performance Optimization**
- Chỉ fetch API khi cần thiết
- useMemo cho expensive calculations
- Loading states để tránh multiple requests

### **3. Error Handling**
- Graceful error handling
- User-friendly error messages
- Retry mechanism (có thể thêm sau)

### **4. Responsive Design**
- Filter chỉ hiển thị khi có > 1 specialty
- Loading states responsive
- Error states responsive

---

## 📁 Files Updated

### **New API Functions**
- ✅ `src/api/chat.ts` - Added getAllDoctors() and searchDoctors()

### **Enhanced Components**
- ✅ `src/sections/chat/components/chat-json-components.tsx` - Updated AppointmentSuggestionCard

### **Key Features Added**
- ✅ Auto-fetch all doctors when no recommended doctors
- ✅ Loading states và error handling
- ✅ Smart doctor selection logic
- ✅ Dynamic UI titles và messages
- ✅ Specialty filtering cho all doctors
- ✅ Empty states và user feedback

---

## 🚀 Usage Examples

### **Basic Usage**
```typescript
// Backend response without recommended doctors
const response = {
  "jsonData": {
    "type": "appointment_suggestion",
    "data": {
      "suggested": true,
      "reason": "Dựa trên triệu chứng của bạn",
      "recommendedDoctors": [], // Empty array
      "availableDoctors": [] // Empty array
    }
  }
}

// Frontend automatically:
// 1. Detects no recommended doctors
// 2. Shows loading state
// 3. Fetches all doctors from API
// 4. Displays "Bác sĩ có sẵn (15)"
// 5. Shows specialty filter
// 6. Allows user to select any doctor
```

### **With Recommended Doctors**
```typescript
// Backend response with recommended doctors
const response = {
  "jsonData": {
    "type": "appointment_suggestion",
    "data": {
      "suggested": true,
      "reason": "Dựa trên triệu chứng của bạn",
      "recommendedDoctors": [
        { "id": "1", "name": "BS. A", "specialty": [...] }
      ]
    }
  }
}

// Frontend:
// 1. Detects recommended doctors
// 2. Shows "Bác sĩ được gợi ý (1)"
// 3. No API call needed
// 4. Displays recommended doctors only
```

---

## 🎉 Kết quả

✅ **Hoàn thành**:
- Tự động hiển thị danh sách bác sĩ khi không có recommended doctors
- Loading states và error handling hoàn chỉnh
- Smart logic để chọn doctors phù hợp
- Specialty filtering cho tất cả doctors
- Responsive design và user experience tốt
- Performance optimization với useMemo
- Backward compatibility với recommended doctors

🚀 **Sẵn sàng sử dụng** để cung cấp trải nghiệm đặt lịch khám hoàn chỉnh cho user!
