# API Endpoints Documentation

## Base URL

```
http://localhost:3000
```

## Authentication

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": string,
  "password": string
}
```

### Register

```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "fullName": string,
  "email": string,
  "password": string,
  "role": "PATIENT" | "DOCTOR" | "ADMIN",
  "phoneNumber": string,
  "address": string,
  "specialty"?: string // Cho bác sĩ
}
```

## Chat

### Create Chat

```http
POST /api/v1/chat
Content-Type: application/json

{
  "user_id": string
}
```

### Send Message

```http
POST /api/v1/chat/:chatId
Content-Type: application/json

{
  "message": string,
  "user_id": string
}
```

### Get Chat History

```http
GET /api/v1/chat/:chatId
```

## Appointments

### Get All Appointments

```http
GET /api/v1/appointments
Query Parameters:
- status: string
- startDate: string
- endDate: string
- patient: string
- name: string
```

### Create Appointment

```http
POST /api/v1/appointments
Content-Type: application/json

{
  "patientId": string,
  "doctorId": string,
  "date": string,
  "slot": string,
  "totalFee": number
}
```

### Update Appointment Status

```http
PATCH /api/v1/appointments/:id
Content-Type: application/json

{
  "status": "PENDING" | "CONFIRMED" | "REJECTED"
}
```

## Users

### Get Users

```http
GET /api/v1/users
Query Parameters:
- typeUser: string
- query: string
- page: number
- limit: number
- sortField: string
- sortOrder: string
```

### Get User Profile

```http
GET /api/v1/users/:id
```

### Update User

```http
PATCH /api/v1/users/:id
Content-Type: application/json

{
  "fullName"?: string,
  "email"?: string,
  "phoneNumber"?: string,
  "address"?: string,
  "specialty"?: string
}
```

## Video Call

### Get Stringee Token

```http
GET /api/v1/video/token
```

### Create Room

```http
POST /api/v1/video/room
Content-Type: application/json

{
  "appointmentId": string,
  "userId": string
}
```

## Response Formats

### Success Response

```json
{
  "success": true,
  "data": any,
  "message": string
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": string,
    "message": string
  }
}
```

## Authentication Headers

```http
Authorization: Bearer <token>
```

## Rate Limiting

- 100 requests per minute per IP
- 1000 requests per hour per user

## Error Codes

- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## WebSocket Events

### Chat Events

```typescript
// Client -> Server
{
  type: 'chat_message',
  data: {
    chatId: string,
    message: string,
    userId: string
  }
}

// Server -> Client
{
  type: 'chat_message',
  data: {
    chatId: string,
    message: IChatMessage
  }
}
```

### Video Call Events

```typescript
// Client -> Server
{
  type: 'call_request',
  data: {
    appointmentId: string,
    userId: string
  }
}

// Server -> Client
{
  type: 'call_response',
  data: {
    status: 'accepted' | 'rejected',
    roomId: string
  }
}
```
