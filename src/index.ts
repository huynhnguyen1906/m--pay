import express from 'express';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import authRoutes from './routes/authRoutes.js';
import transactionRoutes from './routes/transactionRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
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
        app.listen(port, () => {
            console.log(`🚀 Server is running at http://localhost:${port}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
