# M$PAY Backend API Documentation

Base URL: `http://localhost:3000/api`

---

## Authentication

### POST `/auth/login`
Đăng nhập (dùng chung cho Admin/Teacher/Student)

**Request Body:**
```json
{
  "identifier": "admin@mpay.com",  // email hoặc student_code
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "ログイン成功",
  "user": {
    "user_id": 1,
    "role": "ADMIN",
    "student_code": null,
    "name": "Admin User",
    "team_id": null,
    "mail": "admin@mpay.com",
    "balance": 0
  }
}
```

**Roles:** `ADMIN`, `TEACHER`, `STUDENT`

---

## Users

### POST `/users`
**[ADMIN ONLY]** Tạo user mới

**Request Body:**
```json
{
  "role": "STUDENT",
  "name": "山田太郎",
  "mail": "yamada@student.mpay.com",
  "password": "student123",
  "studentCode": "S001",  // Bắt buộc với STUDENT
  "teamId": 1
}
```

**Response:**
```json
{
  "success": true,
  "message": "ユーザーを作成しました",
  "userId": 3
}
```

---

### GET `/users`
Lấy tất cả users (có thể filter theo role)

**Query Parameters:**
- `role` (optional): `ADMIN`, `TEACHER`, hoặc `STUDENT`

**Example:** `/api/users?role=STUDENT`

**Response:**
```json
{
  "success": true,
  "users": [
    {
      "user_id": 3,
      "role": "STUDENT",
      "student_code": "S001",
      "name": "山田太郎",
      "team_id": 1,
      "mail": "yamada@student.mpay.com",
      "balance": 100,
      "created_at": "2026-01-28T10:00:00.000Z"
    }
  ]
}
```

---

### GET `/users/:userId`
Lấy thông tin user theo ID

**Example:** `/api/users/3`

**Response:**
```json
{
  "success": true,
  "user": {
    "user_id": 3,
    "role": "STUDENT",
    "student_code": "S001",
    "name": "山田太郎",
    "team_id": 1,
    "mail": "yamada@student.mpay.com",
    "balance": 100,
    "created_at": "2026-01-28T10:00:00.000Z"
  }
}
```

---

### GET `/users/student/:studentCode`
Lấy thông tin student theo student_code

**Example:** `/api/users/student/S001`

---

### GET `/users/team/:teamId`
Lấy tất cả students theo team

**Example:** `/api/users/team/1`

---

### GET `/users/search?q=searchTerm&teamId=1`
Tìm kiếm students theo tên hoặc student_code

**Query Parameters:**
- `q` (required): Search keyword
- `teamId` (optional): Filter theo team

**Example:** `/api/users/search?q=山田&teamId=1`

---

## Transactions

### POST `/transactions/issue`
**[TEACHER ONLY]** Phát tiền cho student (ISSUE)

**Request Body:**
```json
{
  "teacherId": 2,
  "studentCode": "S001",
  "amount": 50,
  "category": "プログラミング",  // 企画, デザイン, プログラミング, その他
  "reason": "課題完成ボーナス"
}
```

**Response:**
```json
{
  "success": true,
  "message": "M$を発行しました",
  "transactionId": 1
}
```

---

### POST `/transactions/transfer`
**[STUDENT ONLY]** Chuyển tiền giữa students (TRANSFER)

**Request Body:**
```json
{
  "fromStudentCode": "S001",
  "toStudentCode": "S002",
  "amount": 20,
  "message": "ランチ代"  // Optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "送金が完了しました",
  "transactionId": 2
}
```

---

### GET `/transactions/public`
Lấy lịch sử giao dịch công khai (ISSUE only)

**Query Parameters:**
- `limit` (optional): Giới hạn số kết quả

**Example:** `/api/transactions/public?limit=50`

**Response:**
```json
{
  "success": true,
  "transactions": [
    {
      "tx_id": 1,
      "type": "ISSUE",
      "amount": 100,
      "created_at": "2026-01-28T10:00:00.000Z",
      "from_user_id": 2,
      "to_user_id": 3,
      "category": "プログラミング",
      "reason": "デモ初期ボーナス",
      "message": null,
      "is_public": true,
      "from_user_name": "田中先生",
      "from_student_code": null,
      "to_user_name": "山田太郎",
      "to_student_code": "S001"
    }
  ]
}
```

---

### GET `/transactions/history/:userId`
Lấy lịch sử giao dịch của user (cả ISSUE và TRANSFER)

**Query Parameters:**
- `limit` (optional): Giới hạn số kết quả

**Example:** `/api/transactions/history/3?limit=20`

**Response:** Tương tự `/transactions/public` nhưng bao gồm cả TRANSFER (private)

---

### GET `/transactions/teacher/:teacherId/total`
**[TEACHER]** Lấy tổng tiền đã phát trong mùa này

**Example:** `/api/transactions/teacher/2/total`

**Response:**
```json
{
  "success": true,
  "total": 600
}
```

---

## Error Response Format

```json
{
  "success": false,
  "message": "エラーメッセージ"
}
```

**Common HTTP Status Codes:**
- `200`: Success
- `201`: Created
- `400`: Bad Request (validation error)
- `401`: Unauthorized (login failed)
- `404`: Not Found
- `500`: Internal Server Error
