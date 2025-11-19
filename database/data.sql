-- Dữ liệu mẫu để test (Sinh viên trường Nhật)
-- Password mẫu: "123123a" (trong thực tế cần hash bằng bcrypt)
-- Thêm 3 sinh viên với số dư ban đầu (đơn vị: 枚)
INSERT INTO users (student_id, username, password, name, email, balance) VALUES 
    ('2024001', 'tanaka', '123123a', '田中太郎', 'tanaka.taro@school.jp', 1000),
    ('2024002', 'sato', '123123a', '佐藤花子', 'sato.hanako@school.jp', 500),
    ('2024003', 'suzuki', '123123a', '鈴木一郎', 'suzuki.ichiro@school.jp', 750);

-- Thêm vài giao dịch mẫu
INSERT INTO transactions (sender_id, receiver_id, amount, description, status) VALUES 
    (1, 2, 100, '昼食代', 'completed'),
    (2, 3, 50, '本代', 'completed'),
    (3, 1, 200, '返金', 'completed');
