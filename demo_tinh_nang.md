# Demo tính năng (flow phát triển)

Mục tiêu: Xây dựng **demo tối giản** cho hệ thống quản lý tiền thưởng, tập trung vào **log giao dịch** và **trực quan hóa (graph)**. Phần graph sẽ **dùng mock data thuần frontend**, không cần seed dữ liệu DB cho graph ở giai đoạn demo này.

---

## 0. Tiền đề (Routing / UI)

- Màn hình đăng nhập dùng chung cho **Admin / Teacher / Student**.
- Sau khi đăng nhập, hệ thống điều hướng theo role:
  - `/admin`
  - `/teacher`
  - `/student`
- Ưu tiên UI:
  - **Student: giao diện mobile (ưu tiên cao nhất)**
  - Teacher / Admin: giao diện desktop, tối giản là đủ

---

## 1. Role & quyền (RBAC)

- **Admin**: tạo tài khoản, phân role (Admin/Teacher/Student).
- **Teacher**: phát tiền cho học sinh.
- **Student**: xem số dư, đại diện team đóng tiền hằng tuần, chuyển tiền cho học sinh khác.

---

## 2. Data model tối thiểu (demo)

- **User**
  - `user_id`, `role`, `student_code`, `name`, `team_id`, `mail`, `password`

- **Wallet (ví cá nhân - chỉ Student)**
  - `user_id`, `balance`

- **Transaction (giao dịch)**
  - `tx_id`, `type`, `amount`, `created_at`
  - `from_user_id` (Teacher / Student)
  - `to_user_id` (Student)
  - `category` (bắt buộc với phát tiền)
  - `reason` (bắt buộc với phát tiền)
  - `message` (chỉ có với chuyển tiền giữa học sinh)
  - `is_public` (public trong trường hợp là phát tiền)

### Loại giao dịch (type)

- `ISSUE`: Teacher → Student (phát tiền, **công khai**)
- `TRANSFER`: Student → Student (chuyển tiền, **không công khai**)

> Lưu ý: Teacher được coi như **bank vô hạn**, không cần lưu số dư, nhưng cần lưu log phát tiền và hiển thị xem mùa này đã phát bao nhiêu tiền ở màn hình giáo viên.

---

## 3. Ghi chú về graph (frontend mock)

- Graph demo **không lấy dữ liệu từ DB**.
- Dữ liệu graph sẽ được mock ở frontend (JSON), và sẽ tính toán số lượng mock sau.

---

## 4. Log công khai (toàn bộ học sinh đều xem được)

### Giao dịch công khai

- `ISSUE` (Teacher phát tiền)

### Giao dịch không công khai

- `TRANSFER` (chuyển tiền giữa học sinh)
- Chỉ người gửi / người nhận xem được

---

# 5. Màn hình & chức năng (phần demo chính)

## 5.1 Đăng nhập (chung)

- Input: ID (student_code) + password
- Sau khi đăng nhập:
  - Admin → `/admin`
  - Teacher → `/teacher`
  - Student → `/student`

---

## 5.2 Teacher (`/teacher`) – Phát tiền cho học sinh

### UI

- Tìm kiếm học sinh bằng:
  - Tên
  - Mã số học sinh (`student_code`)
  - Lọc theo team (dropdown)
  - tự filter khi gõ tên / mã số
- Khi chọn học sinh: tự động hiển thị tên để xác nhận

- Form phát tiền:
  - `amount` – số tiền (bắt buộc)
  - `reason` – lý do (bắt buộc)
  - `category` – danh mục (bắt buộc, dropdown, có thể là  企画、デザイン、プログラミング、その他)

### Xử lý

- Lưu giao dịch `ISSUE` vào DB (`is_public = true`)
- Cộng tiền vào `Wallet.balance` của học sinh
- Hiển thị 1 dòng thống kê ở màn hình giáo viên: tổng tiền đã phát trong mùa này

```
Tổng tiền đã phát trong mùa này = SUM(ISSUE.amount)
```

---

## 5.3 Student (`/student`) – Ví cá nhân (UI mobile)

### Hiển thị
- Số dư hiện tại (`balance`)
- QR code + barcode
  - Nội dung: `student_code`

### Điều hướng

- Chuyển tiền cho học sinh khác
- Analytics
  - Lịch sử thu (công khai toàn hệ thống)

---

## 5.4 Student – Chuyển tiền (Student → Student)

### UI

- Tìm người nhận (tên / mã số)
- Nhập số tiền
- Nhập lời nhắn
- Xác nhận → thực hiện

### Xử lý

- Lưu giao dịch `TRANSFER` (`is_public = false`)
- Trừ tiền người gửi, cộng tiền người nhận

### Lịch sử

- Chỉ hiển thị cho chính học sinh đó

---

## 5.5 Student - Đóng chi phí tuần (không ưu tiên trong demo)

- Tạm **không làm** luồng này ở giai đoạn demo.
- Chỉ làm form demo UI, không cần xử lý backend.

---

# 6. Analytics (dùng chung cho Admin / Teacher / Student)

Mục tiêu: phần lớn là **xem biểu đồ** bằng **mock data frontend**. Danh sách ISSUE lấy từ DB, graph dùng mock JSON.

## 6.1 Luồng xem data

- Mỗi role đều có nút **Analytics** (Student / Teacher / Admin).
- Vào Analytics → **Xem data**.
- Có 2 lựa chọn:
  - **Xem data mùa này**
  - **Xem data mùa trước**

## 6.2 Mùa này (mùa này có thể sử dụng data từ db)

- **全体収入履歴** (Toàn bộ lịch sử thu - ISSUE)
  - List: giáo viên phát cho ai / ngày nào / bao nhiêu / lý do / category
  - Có nút **Xem dạng graph**
  - Graph: trục X = tuần, trục Y = số tiền
  - Có 2 chế độ:
    - **Theo nhóm**: line chart so sánh các nhóm, có filter chọn nhóm
    - **Theo category**: line chart so sánh các category

- **全体支払履歴** (Toàn bộ lịch sử chi - PAY)
  - Nút **xám/disable** (không ưu tiên trong demo)

## 6.3 Mùa trước

- **Bước chọn năm (mock data)**
  - Hiển thị danh sách **nút theo năm** từ mock data
  - Chọn 1 năm → mới vào phần xem data của mùa đó

- **全体収入履歴** (Toàn bộ lịch sử thu - ISSUE)
  - List: giáo viên phát cho ai / ngày nào / bao nhiêu / lý do / category
  - Có nút **Xem dạng graph**
  - Graph: trục X = tuần, trục Y = số tiền
  - Có 2 chế độ:
    - **Theo nhóm**: line chart so sánh các nhóm, có filter chọn nhóm
    - **Theo category**: line chart so sánh các category

- **全体支払履歴** (Toàn bộ lịch sử chi - PAY)
  - Xem team nào trả tuần nào, bao nhiêu tiền
  - Có nút **Xem dạng graph**
  - Graph: trục X = tuần, trục Y = số tiền
  - **Chỉ theo nhóm** (mặc định), không có nút theo category

---

## 7. Seed data (phục vụ demo)

- Chỉ cần **1 tài khoản Admin** ban đầu.
- Teacher/Student tạo từ trang Admin trong lúc demo.
- Không cần seed data cho graph (dùng mock frontend).

---

## 8. Tiêu chí demo (Acceptance criteria)

- Admin tạo tài khoản và phân role phân chia team cho học sinh trong trường hợp lore học sinh.
- Teacher phát tiền → log công khai cập nhật ngay.
- Student xem số dư + QR/barcode.
- Student chuyển tiền cho student khác (có lời nhắn).
- Analytics hiển thị list từ DB + graph từ mock data frontend.
