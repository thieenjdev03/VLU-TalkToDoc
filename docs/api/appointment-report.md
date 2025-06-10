# API: Thống kê lịch hẹn bác sĩ

**Endpoint:** `/api/statistics/doctors-appointments`

## Mô tả

Trả về danh sách thống kê số lượng lịch hẹn của từng bác sĩ trong khoảng thời gian, kèm số hoàn thành, số huỷ, tỉ lệ hoàn thành.

## Query Params

- `from_date`: (string, định dạng YYYY-MM-DD) - Ngày bắt đầu lọc
- `to_date`: (string, định dạng YYYY-MM-DD) - Ngày kết thúc lọc
- `doctor_ids[]`: (array, optional) - Danh sách mã bác sĩ (MBS) cần lọc
- `status`: (string, optional) - Trạng thái lịch hẹn: `all` | `completed` | `cancelled`
- `search`: (string, optional) - Tìm kiếm theo tên bác sĩ hoặc MBS
- `page`: (number, optional) - Trang
- `pageSize`: (number, optional) - Số dòng/trang

## Response

```json
{
  "message": "Thành công",
  "status": 200,
  "data": {
    "items": [
      {
        "doctor_id": "BS001",
        "doctor_name": "Nguyễn Văn A",
        "total_appointments": 20,
        "completed_appointments": 18,
        "cancelled_appointments": 2,
        "completion_rate": 90
      }
    ],
    "total": 1,
    "page": 1,
    "pageSize": 20
  }
}
```

### Giải thích từng field

- `doctor_id`: Mã bác sĩ (MBS)
- `doctor_name`: Tên bác sĩ
- `total_appointments`: Tổng số lịch hẹn trong khoảng thời gian lọc
- `completed_appointments`: Số lịch đã hoàn thành
- `cancelled_appointments`: Số lịch đã huỷ
- `completion_rate`: Tỉ lệ hoàn thành (%) = (completed_appointments / total_appointments) \* 100
- `total`: Tổng số bác sĩ thỏa mãn filter
- `page`: Trang hiện tại
- `pageSize`: Số dòng/trang

### Quy ước

- Nếu không truyền `doctor_ids` sẽ trả tất cả bác sĩ
- Nếu không truyền `from_date`, `to_date` sẽ lấy toàn bộ lịch
- Nếu không truyền `status` sẽ trả tất cả trạng thái
- Nếu không truyền `search` sẽ trả tất cả

### Ví dụ gọi API

```http
GET /api/statistics/doctors-appointments?from_date=2024-06-01&to_date=2024-06-30&doctor_ids[]=BS001&status=completed&page=1&pageSize=20
```
