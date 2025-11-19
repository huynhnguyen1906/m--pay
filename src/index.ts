import express from 'express';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 3000;
const hostname = process.env.HOST_NAME || 'localhost';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Middleware - CORS phải đặt đầu tiên
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', frontendUrl);
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');

    // Handle preflight
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
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
