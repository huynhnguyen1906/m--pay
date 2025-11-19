import express from 'express';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';
import userRoutes from './routes/userRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;
const hostname = '0.0.0.0';
const allowedOrigins = [
    'http://localhost:5173',
    'http://192.168.1.100:5173',
    'https://localhost:5173',
    'https://192.168.1.100:5173',
    'http://localhost:5174',
    'https://localhost:5174',
    'http://192.168.1.100:5174',
    'https://192.168.1.100:5174',
];

// Middleware - CORS phải đặt đầu tiên
app.use((req, res, next) => {
    const origin = req.headers.origin;
    // Allow all origins for ngrok since it changes
    if (origin) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        res.sendStatus(200);
        return;
    }
    next();
});

app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded body

// Routes
app.get('/', (req, res) => {
    res.json({ message: 'Payment App API - 学校内部送金システム' });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/users', userRoutes);

// Test database connection và start server
const startServer = async () => {
    try {
        await testConnection();
        app.listen(port, hostname, () => {
            console.log(`🚀 Server is running at http://${hostname}:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
