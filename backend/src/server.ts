import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes';
import contractRoutes from './routes/contractRoutes';
import chatRoutes from './routes/chatRoutes';
import { errorMiddleware } from './middleware/errorMiddleware';

const app: Express = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Backend is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/contracts/:contractId/chat', chatRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handling middleware
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║       Procure AI Backend - Node.js + Express             ║
╠══════════════════════════════════════════════════════════╣
║ Server running on port ${PORT}                          ║
║ Environment: ${process.env.NODE_ENV || 'development'}                    ║
║ Frontend URL: ${FRONTEND_URL}                   ║
║ Database: PostgreSQL                                     ║
║ API Health: http://localhost:${PORT}/health            ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;
