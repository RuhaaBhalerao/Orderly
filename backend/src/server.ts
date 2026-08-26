import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes';
import contractRoutes from './routes/contractRoutes';
import chatRoutes from './routes/chatRoutes';
import gmailRoutes from './routes/gmailRoutes';
import { errorMiddleware } from './middleware/errorMiddleware';
import { ensureUploadDirectory } from './middleware/uploadMiddleware';

const app: Express = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Validate critical environment variables
function validateEnvironment() {
  const errors: string[] = [];
  
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is not configured');
  }
  
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    errors.push('JWT_SECRET is not configured or too short (minimum 16 characters required)');
  }
  
  if (!process.env.OPENROUTER_API_KEY) {
    console.warn('⚠️  WARNING: OPENROUTER_API_KEY is not configured. AI features will be unavailable.');
  }
  
  if (errors.length > 0) {
    console.error('🔴 CRITICAL CONFIGURATION ERRORS:');
    errors.forEach(err => console.error(`  - ${err}`));
    if (NODE_ENV === 'production') {
      throw new Error('Application cannot start without required environment variables');
    }
  }
}

// Initialize upload directory
ensureUploadDirectory().catch((err) => console.error('Failed to initialize upload directory:', err));

// Validate environment
validateEnvironment();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Security headers
app.use((req: Request, res: Response, next: NextFunction) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

// CORS configuration
app.use(
  cors({
    origin: [FRONTEND_URL, 'http://localhost:3001'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Serve static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Backend is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/contracts/:contractId/chat', chatRoutes);
app.use('/api/gmail', gmailRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ 
    error: 'Not Found',
    message: 'Route not found',
    path: req.path,
    method: req.method
  });
});

// Error handling middleware
app.use(errorMiddleware);

// Start server
app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║       Procure AI Backend - Node.js + Express             ║
╠══════════════════════════════════════════════════════════╣
║ ✅ Server running on port ${PORT}                        ║
║ 📍 Environment: ${NODE_ENV}                               ║
║ 🌐 Frontend URL: ${FRONTEND_URL}                         ║
║ 🗄️  Database: PostgreSQL (Neon)                          ║
║ 🏥 Health: http://localhost:${PORT}/health              ║
║ 📁 Uploads: /uploads/contracts/                          ║
║ 📧 Gmail: ${process.env.GOOGLE_CLIENT_ID ? '✅ Configured' : '⚠️  Not configured'}                             ║
║ 🤖 AI Service: ${process.env.OPENROUTER_API_KEY ? '✅ Configured' : '⚠️  Not configured'}                      ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;
