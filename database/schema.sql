-- Drop tables if exists (for clean setup)
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS wallets;
DROP TABLE IF EXISTS users;

-- Users table
CREATE TABLE users (
  user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  role ENUM('ADMIN', 'TEACHER', 'STUDENT') NOT NULL,
  student_code VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  team_id BIGINT,
  mail VARCHAR(255) UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_role (role),
  INDEX idx_student_code (student_code),
  INDEX idx_team_id (team_id)
);

-- Wallets table (chỉ cho Student)
CREATE TABLE wallets (
  user_id BIGINT PRIMARY KEY,
  balance DECIMAL(18,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- Transactions table
CREATE TABLE transactions (
  tx_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  type ENUM('ISSUE', 'TRANSFER') NOT NULL,
  amount DECIMAL(18,2) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  from_user_id BIGINT NOT NULL,
  to_user_id BIGINT NOT NULL,
  category VARCHAR(100),
  reason VARCHAR(255),
  message VARCHAR(255),
  is_public BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_tx_from_user FOREIGN KEY (from_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  CONSTRAINT fk_tx_to_user FOREIGN KEY (to_user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  INDEX idx_type (type),
  INDEX idx_is_public (is_public),
  INDEX idx_from_user (from_user_id),
  INDEX idx_to_user (to_user_id),
  INDEX idx_created_at (created_at)
);
