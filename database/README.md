# Database Setup Guide

## Quick Setup

### Using MySQL CLI:
```bash
mysql -h 162.43.90.192 -u root -p < database/schema.sql
mysql -h 162.43.90.192 -u root -p mpay < database/seed.sql
```

### Or run all at once:
```bash
mysql -h 162.43.90.192 -u root -p < database/setup.sql
```

## Default Accounts

### Admin
- Email: `admin@mpay.com`
- Password: `admin123`

### Teacher
- Email: `tanaka@mpay.com`
- Password: `teacher123`

### Students (Team 1)
- S001: `yamada@student.mpay.com` / `student123`
- S002: `sato@student.mpay.com` / `student123`
- S003: `suzuki@student.mpay.com` / `student123`

### Students (Team 2)
- S004: `takahashi@student.mpay.com` / `student123`
- S005: `ito@student.mpay.com` / `student123`
- S006: `watanabe@student.mpay.com` / `student123`

## Database Structure

### Tables
1. **users** - User accounts with role (ADMIN/TEACHER/STUDENT)
2. **wallets** - Student wallets with balance
3. **transactions** - All transactions (ISSUE/TRANSFER)

### Transaction Types
- **ISSUE**: Teacher → Student (public, requires category & reason)
- **TRANSFER**: Student → Student (private, optional message)
