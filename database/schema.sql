-- Bảng users: Quản lý tài khoản học sinh/sinh viên
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    student_id VARCHAR(50) UNIQUE NOT NULL COMMENT 'Mã số sinh viên',
    username VARCHAR(50) UNIQUE NOT NULL COMMENT 'Tên đăng nhập',
    password VARCHAR(255) NOT NULL COMMENT 'Mật khẩu (hash)',
    name VARCHAR(100) NOT NULL COMMENT 'Họ tên',
    email VARCHAR(100) UNIQUE NOT NULL,
    balance INT DEFAULT 0 CHECK(balance >= 0) COMMENT 'Số dư (đơn vị: 枚 mai)',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Bảng transactions: Lưu lịch sử giao dịch chuyển tiền
CREATE TABLE IF NOT EXISTS transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sender_id INT NOT NULL,
    receiver_id INT NOT NULL,
    amount INT NOT NULL CHECK(amount > 0) COMMENT 'Số tiền (đơn vị: 枚 mai)',
    description TEXT COMMENT 'Nội dung chuyển khoản',
    status VARCHAR(20) DEFAULT 'completed' COMMENT 'completed, failed, pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE RESTRICT,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE RESTRICT,
    CHECK (sender_id != receiver_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
