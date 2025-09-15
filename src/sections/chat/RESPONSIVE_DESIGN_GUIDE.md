# Chat View Responsive Design Guide

## Tổng quan

Hướng dẫn responsive design cho Chat View, đảm bảo trải nghiệm người dùng tốt trên mọi thiết bị.

## Breakpoints

### Material-UI Breakpoints
- `xs`: 0px - 599px (Mobile)
- `sm`: 600px - 899px (Tablet)
- `md`: 900px - 1199px (Desktop)
- `lg`: 1200px - 1535px (Large Desktop)
- `xl`: 1536px+ (Extra Large)

### Chat-specific Breakpoints
- **Mobile**: < 600px - Layout dọc, sidebar ẩn khi có conversation
- **Tablet**: 600px - 899px - Layout dọc, sidebar compact
- **Desktop**: 900px - 1199px - Layout ngang, sidebar đầy đủ
- **Large Desktop**: 1200px+ - Layout ngang, sidebar rộng

## Layout Structure

### Mobile (< 600px)
```
┌─────────────────────────┐
│        Header           │
├─────────────────────────┤
│      Sidebar            │ (40vh, chỉ khi chưa chọn conversation)
├─────────────────────────┤
│     Chat Area           │ (60vh)
│  ┌─────────────────────┐│
│  │     Messages        ││
│  ├─────────────────────┤│
│  │   Mini Options      ││
│  ├─────────────────────┤│
│  │  Message Input      ││
│  └─────────────────────┘│
└─────────────────────────┘
```

### Tablet (600px - 899px)
```
┌─────────────────────────┐
│        Header           │
├─────────────────────────┤
│ Sidebar │  Chat Area    │
│ (280px) │               │
│         │  ┌───────────┐│
│         │  │ Messages  ││
│         │  ├───────────┤│
│         │  │Mini Opts  ││
│         │  ├───────────┤│
│         │  │Input      ││
│         │  └───────────┘│
└─────────────────────────┘
```

### Desktop (900px+)
```
┌─────────────────────────┐
│        Header           │
├─────────────────────────┤
│ Sidebar │  Chat Area    │
│ (320px) │               │
│         │  ┌───────────┐│
│         │  │ Messages  ││
│         │  ├───────────┤│
│         │  │Mini Opts  ││
│         │  ├───────────┤│
│         │  │Input      ││
│         │  └───────────┘│
└─────────────────────────┘
```

## Component Responsive Behavior

### 1. ChatView Container
```tsx
<Container 
  maxWidth={settings.themeStretch ? false : 'xl'}
  sx={{
    px: { xs: 0.5, sm: 1, md: 2 },
    py: { xs: 0.5, sm: 1 }
  }}
>
```

### 2. Main Card
```tsx
<Stack
  component={Card}
  sx={{ 
    height: { 
      xs: 'calc(100vh - 60px)', 
      sm: 'calc(100vh - 80px)', 
      md: 'calc(100vh - 100px)',
      lg: '85vh'
    },
    borderRadius: { xs: 0, sm: 1, md: 2 },
    boxShadow: { xs: 'none', sm: 1 }
  }}
>
```

### 3. Layout Direction
```tsx
<Stack 
  direction={{ xs: 'column', lg: 'row' }} 
  sx={{ height: 1 }}
>
```

### 4. Sidebar
```tsx
<Box
  sx={{
    width: { xs: '100%', lg: 320 },
    height: { xs: 'auto', lg: '100%' },
    maxHeight: { xs: '40vh', lg: 'none' },
    display: { xs: selectedConversationId ? 'none' : 'block', lg: 'block' }
  }}
>
```

## Spacing System

### Container Padding
- Mobile: `px: 0.5, py: 0.5`
- Tablet: `px: 1, py: 1`
- Desktop: `px: 2, py: 1`

### Component Spacing
- Mobile: `spacing: 1.5`
- Tablet: `spacing: 2`
- Desktop: `spacing: 2`

### Padding
- Mobile: `p: 1.5`
- Tablet: `p: 2`
- Desktop: `p: 2`

## Typography Scale

### Font Sizes
- **Title**: `xs: '1rem', sm: '1.25rem'`
- **Subtitle**: `xs: '0.875rem', sm: '1rem'`
- **Body**: `xs: '0.8rem', sm: '0.875rem'`
- **Caption**: `xs: '0.7rem', sm: '0.75rem'`

### Line Heights
- **Title**: `1.2`
- **Subtitle**: `1.3`
- **Body**: `1.4`
- **Caption**: `1.2`

## Component Sizes

### Avatars
- Mobile: `32px`
- Tablet: `40px`
- Desktop: `48px`

### Buttons
- Mobile: `32px`
- Tablet: `36px`
- Desktop: `40px`

### Icons
- Mobile: `16px`
- Tablet: `18px`
- Desktop: `20px`

### Border Radius
- Mobile: `16px`
- Tablet: `20px`
- Desktop: `24px`

## Interactive Elements

### Touch Targets
- Minimum size: `44px` (iOS guidelines)
- Recommended size: `48px`
- Spacing between: `8px`

### Hover States
- Desktop only: `&:hover` effects
- Mobile: Touch feedback with `active` states

## Performance Considerations

### 1. Conditional Rendering
```tsx
{isMobile ? (
  <MobileComponent />
) : (
  <DesktopComponent />
)}
```

### 2. Lazy Loading
```tsx
const LazyComponent = lazy(() => import('./Component'))
```

### 3. Image Optimization
```tsx
<Box
  component="img"
  src={imageUrl}
  sx={{
    width: { xs: '100%', sm: 'auto' },
    maxWidth: { xs: '100%', sm: 300 },
    height: { xs: 'auto', sm: 200 }
  }}
/>
```

## Testing Checklist

### Mobile (< 600px)
- [ ] Sidebar ẩn khi có conversation
- [ ] Touch targets đủ lớn (44px+)
- [ ] Text readable không cần zoom
- [ ] Input không bị keyboard che
- [ ] Scroll smooth

### Tablet (600px - 899px)
- [ ] Sidebar compact hiển thị
- [ ] Layout cân bằng
- [ ] Touch và mouse interaction
- [ ] Orientation change

### Desktop (900px+)
- [ ] Sidebar đầy đủ hiển thị
- [ ] Hover states hoạt động
- [ ] Keyboard navigation
- [ ] Window resize

## Common Issues & Solutions

### 1. Sidebar Overlap
**Problem**: Sidebar che khuất content
**Solution**: Sử dụng `z-index` và `position: relative`

### 2. Text Overflow
**Problem**: Text dài bị tràn
**Solution**: Sử dụng `textOverflow: 'ellipsis'` và `whiteSpace: 'nowrap'`

### 3. Touch Target Too Small
**Problem**: Buttons quá nhỏ trên mobile
**Solution**: Minimum size 44px, padding đủ lớn

### 4. Keyboard Overlap
**Problem**: Keyboard che input trên mobile
**Solution**: Sử dụng `viewport-fit=cover` và `safe-area-inset`

## Best Practices

### 1. Mobile First
- Bắt đầu với mobile design
- Thêm features cho desktop
- Progressive enhancement

### 2. Consistent Spacing
- Sử dụng theme spacing scale
- Consistent padding/margin
- Visual rhythm

### 3. Performance
- Lazy load heavy components
- Optimize images
- Minimize re-renders

### 4. Accessibility
- Sufficient color contrast
- Keyboard navigation
- Screen reader support
- Focus indicators

## Tools & Resources

### 1. Development Tools
- Chrome DevTools Device Mode
- React DevTools Profiler
- Lighthouse Performance

### 2. Testing Tools
- BrowserStack
- Responsive Design Mode
- Touch device testing

### 3. Design Tools
- Figma responsive frames
- Material-UI breakpoints
- Custom responsive utilities
