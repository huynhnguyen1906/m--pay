// User types
export type UserRole = 'ADMIN' | 'TEACHER' | 'STUDENT';

export interface User {
    user_id: number;
    role: UserRole;
    student_code: string | null;
    name: string;
    team_id: number | null;
    mail: string;
    password: string;
    created_at: Date;
    updated_at: Date;
}

export interface UserWithBalance extends User {
    balance?: number;
}

// Transaction types
export type TransactionType = 'ISSUE' | 'TRANSFER';

export interface Transaction {
    tx_id: number;
    type: TransactionType;
    amount: number;
    created_at: Date;
    from_user_id: number;
    to_user_id: number;
    category: string | null;
    reason: string | null;
    message: string | null;
    is_public: boolean;
}

export interface TransactionWithUsers extends Transaction {
    from_user_name?: string;
    from_student_code?: string;
    to_user_name?: string;
    to_student_code?: string;
}

// Wallet types
export interface Wallet {
    user_id: number;
    balance: number;
    created_at: Date;
    updated_at: Date;
}

// API Response types
export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
}

// Login types
export interface LoginRequest {
    identifier: string; // email or student_code
    password: string;
}

export interface LoginResponse extends ApiResponse {
    user?: {
        user_id: number;
        role: UserRole;
        student_code: string | null;
        name: string;
        team_id: number | null;
        mail: string;
        balance?: number;
    };
}

// Transaction request types
export interface IssueRequest {
    toStudentCode: string;
    amount: number;
    category: string;
    reason: string;
}

export interface TransferRequest {
    fromStudentCode: string;
    toStudentCode: string;
    amount: number;
    message?: string;
}
