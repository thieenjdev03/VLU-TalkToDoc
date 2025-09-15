# 📱 Appointment Booking Modal - Responsive Design Guide

## 📋 Tổng quan

Hướng dẫn responsive design cho Appointment Booking Modal, đảm bảo trải nghiệm tốt trên mọi thiết bị từ mobile đến desktop.

---

## 🎯 Breakpoints

### **Mobile First Approach**
- **xs (0-600px)**: Mobile phones
- **sm (600-900px)**: Tablets
- **md (900-1200px)**: Small desktops
- **lg (1200px+)**: Large desktops

---

## 📱 Mobile Design (xs)

### **Dialog Layout**
```typescript
<Dialog 
  fullScreen={{ xs: true, sm: false }}
  PaperProps={{
    sx: { 
      minHeight: { xs: '100vh', sm: '80vh' },
      m: { xs: 0, sm: 2 }
    }
  }}
>
```

**Features:**
- ✅ Full screen trên mobile
- ✅ No margin để tận dụng toàn bộ màn hình
- ✅ 100vh height cho trải nghiệm immersive

### **Doctor Cards Layout**
```typescript
<Grid container spacing={{ xs: 1, sm: 2 }}>
  <Grid item xs={12} sm={6} md={4}>
```

**Mobile Layout:**
- ✅ 1 doctor per row (xs={12})
- ✅ Compact spacing (spacing={1})
- ✅ Vertical layout cho doctor info

### **Doctor Card Content**
```typescript
<Stack 
  direction={{ xs: 'column', sm: 'row' }} 
  alignItems={{ xs: 'flex-start', sm: 'center' }} 
  spacing={{ xs: 1.5, sm: 2 }}
>
```

**Mobile Features:**
- ✅ Vertical stack layout
- ✅ Smaller avatar (48px vs 56px)
- ✅ Smaller font sizes
- ✅ Compact padding
- ✅ Full width pricing section

### **Time Slots Layout**
```typescript
<Grid item xs={6} sm={4} md={3}>
```

**Mobile Layout:**
- ✅ 2 slots per row (xs={6})
- ✅ Compact spacing
- ✅ Smaller cards với minHeight

---

## 💻 Tablet Design (sm)

### **Dialog Layout**
```typescript
fullScreen={{ xs: true, sm: false }}
PaperProps={{
  sx: { 
    minHeight: { xs: '100vh', sm: '80vh' },
    m: { xs: 0, sm: 2 }
  }
}}
```

**Features:**
- ✅ Modal dialog thay vì full screen
- ✅ 2px margin xung quanh
- ✅ 80vh height

### **Doctor Cards Layout**
```typescript
<Grid item xs={12} sm={6} md={4}>
```

**Tablet Layout:**
- ✅ 2 doctors per row (sm={6})
- ✅ Medium spacing (spacing={2})
- ✅ Mixed horizontal/vertical layout

### **Time Slots Layout**
```typescript
<Grid item xs={6} sm={4} md={3}>
```

**Tablet Layout:**
- ✅ 3 slots per row (sm={4})
- ✅ Medium spacing
- ✅ Balanced card sizes

---

## 🖥️ Desktop Design (md+)

### **Doctor Cards Layout**
```typescript
<Grid item xs={12} sm={6} md={4}>
```

**Desktop Layout:**
- ✅ 3 doctors per row (md={4})
- ✅ Full horizontal layout
- ✅ Larger spacing và padding

### **Time Slots Layout**
```typescript
<Grid item xs={6} sm={4} md={3}>
```

**Desktop Layout:**
- ✅ 4 slots per row (md={3})
- ✅ Optimal spacing
- ✅ Larger cards

---

## 🎨 Typography Responsive

### **Font Sizes**
```typescript
// Doctor names
fontSize: { xs: '0.875rem', sm: '1rem' }

// Chips
fontSize: { xs: '0.7rem', sm: '0.75rem' }

// Captions
fontSize: { xs: '0.7rem', sm: '0.75rem' }

// Dialog title
fontSize: { xs: '1.1rem', sm: '1.25rem' }
```

### **Spacing**
```typescript
// Card padding
p: { xs: 1.5, sm: 2 }

// Dialog padding
p: { xs: 2, sm: 3 }

// Stack spacing
spacing: { xs: 1.5, sm: 2 }
```

---

## 📐 Component Sizes

### **Avatars**
```typescript
<Avatar sx={{ 
  width: { xs: 48, sm: 56 }, 
  height: { xs: 48, sm: 56 }
}}>
```

### **Time Slot Cards**
```typescript
<CardContent sx={{ 
  p: { xs: 1, sm: 1.5, md: 2 }, 
  minHeight: { xs: 80, sm: 90 }
}}>
```

### **Buttons**
```typescript
<Button
  fullWidth={{ xs: true, sm: false }}
  size={{ xs: 'large', sm: 'medium' }}
>
```

---

## 🔄 Layout Transitions

### **Doctor Cards**
- **Mobile**: Vertical stack, compact spacing
- **Tablet**: Mixed layout, medium spacing
- **Desktop**: Full horizontal, large spacing

### **Time Slots**
- **Mobile**: 2 per row, compact cards
- **Tablet**: 3 per row, medium cards
- **Desktop**: 4 per row, large cards

### **Dialog Actions**
- **Mobile**: Vertical stack, full width buttons
- **Tablet+**: Horizontal layout, auto width buttons

---

## 📱 Mobile-Specific Features

### **Full Screen Experience**
```typescript
fullScreen={{ xs: true, sm: false }}
```

### **Touch-Friendly Sizing**
```typescript
// Larger touch targets
size={{ xs: 'large', sm: 'medium' }}

// Full width buttons
fullWidth={{ xs: true, sm: false }}
```

### **Optimized Spacing**
```typescript
// Compact spacing for mobile
spacing={{ xs: 1, sm: 2 }}

// Reduced padding
p: { xs: 1.5, sm: 2 }
```

---

## 🎯 Performance Optimizations

### **Conditional Rendering**
```typescript
{doctor.nextAvailableSlot && (
  <Chip 
    icon={<AccessTime />} 
    label={`Slot: ${doctor.nextAvailableSlot}`} 
  />
)}
```

### **Responsive Images**
```typescript
<Avatar sx={{ 
  width: { xs: 48, sm: 56 }, 
  height: { xs: 48, sm: 56 }
}}>
```

---

## 📊 Responsive Grid System

### **Doctor Cards Grid**
```typescript
<Grid container spacing={{ xs: 1, sm: 2 }}>
  <Grid item xs={12} sm={6} md={4}>
    {/* Doctor Card */}
  </Grid>
</Grid>
```

**Breakdown:**
- **xs**: 1 column (100% width)
- **sm**: 2 columns (50% width each)
- **md+**: 3 columns (33.33% width each)

### **Time Slots Grid**
```typescript
<Grid container spacing={{ xs: 0.5, sm: 1 }}>
  <Grid item xs={6} sm={4} md={3}>
    {/* Time Slot Card */}
  </Grid>
</Grid>
```

**Breakdown:**
- **xs**: 2 columns (50% width each)
- **sm**: 3 columns (33.33% width each)
- **md+**: 4 columns (25% width each)

---

## 🎨 Visual Hierarchy

### **Mobile Priority**
1. **Doctor Selection** - Full width cards
2. **Time Selection** - 2 per row for easy selection
3. **Pricing** - Prominent display
4. **Actions** - Full width buttons

### **Desktop Priority**
1. **Doctor Selection** - 3 per row for comparison
2. **Time Selection** - 4 per row for overview
3. **Pricing** - Side-by-side layout
4. **Actions** - Compact horizontal layout

---

## 🚀 Usage Examples

### **Mobile Usage**
```typescript
// User opens modal on mobile
<AppointmentBookingModal 
  open={true}
  data={appointmentData}
  suppressTexts={false} // Show all text on mobile
/>
// Result: Full screen modal with vertical layout
```

### **Desktop Usage**
```typescript
// User opens modal on desktop
<AppointmentBookingModal 
  open={true}
  data={appointmentData}
  suppressTexts={true} // Hide verbose text on desktop
/>
// Result: Modal dialog with horizontal layout
```

---

## 📁 Files Updated

### **Enhanced Components**
- ✅ `src/sections/chat/components/appointment-booking-modal.tsx` - Full responsive design

### **Key Features Added**
- ✅ Mobile-first responsive design
- ✅ Breakpoint-specific layouts
- ✅ Touch-friendly sizing
- ✅ Optimized typography
- ✅ Responsive grid system
- ✅ Adaptive spacing và padding
- ✅ Full screen mobile experience
- ✅ Desktop modal experience

---

## 🎉 Kết quả

✅ **Hoàn thành**:
- Responsive design cho tất cả breakpoints
- Mobile-first approach với full screen experience
- Touch-friendly sizing và spacing
- Optimized typography cho từng device
- Adaptive grid system
- Performance optimizations
- Consistent user experience across devices

🚀 **Sẵn sàng sử dụng** cho mọi thiết bị từ mobile đến desktop!
