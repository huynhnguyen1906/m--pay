-- Seed data for initial setup

-- 1. Tạo tài khoản Admin mặc định
INSERT INTO users (role, name, mail, password) 
VALUES ('ADMIN', 'Admin User', 'admin@mpay.com', 'admin123');

-- 2. Tạo tài khoản Teacher demo
INSERT INTO users (role, name, mail, password) 
VALUES ('TEACHER', '田中先生', 'tanaka@mpay.com', 'teacher123');

-- 3. Tạo học sinh demo cho team 1
INSERT INTO users (role, student_code, name, team_id, mail, password) 
VALUES 
('STUDENT', 'S001', '山田太郎', 1, 'yamada@student.mpay.com', 'student123'),
('STUDENT', 'S002', '佐藤花子', 1, 'sato@student.mpay.com', 'student123'),
('STUDENT', 'S003', '鈴木一郎', 1, 'suzuki@student.mpay.com', 'student123');

-- 4. Tạo học sinh demo cho team 2
INSERT INTO users (role, student_code, name, team_id, mail, password) 
VALUES 
('STUDENT', 'S004', '高橋美咲', 2, 'takahashi@student.mpay.com', 'student123'),
('STUDENT', 'S005', '伊藤健太', 2, 'ito@student.mpay.com', 'student123'),
('STUDENT', 'S006', '渡辺さくら', 2, 'watanabe@student.mpay.com', 'student123');

-- 5. Tạo wallet cho các học sinh (balance khởi tạo = 0)
INSERT INTO wallets (user_id, balance)
SELECT user_id, 0 
FROM users 
WHERE role = 'STUDENT';

-- 6. Demo: Teacher phát tiền cho học sinh (ISSUE transactions - PUBLIC)
INSERT INTO transactions (type, from_user_id, to_user_id, amount, category, reason, is_public)
SELECT 
  'ISSUE',
  (SELECT user_id FROM users WHERE role = 'TEACHER' LIMIT 1),
  user_id,
  100,
  'プログラミング',
  'デモ初期ボーナス',
  TRUE
FROM users 
WHERE role = 'STUDENT';

-- 7. Cập nhật balance trong wallet sau khi phát tiền
UPDATE wallets w
INNER JOIN (
  SELECT to_user_id, SUM(amount) as total
  FROM transactions
  WHERE type = 'ISSUE'
  GROUP BY to_user_id
) t ON w.user_id = t.to_user_id
SET w.balance = t.total;
