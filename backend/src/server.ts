import 'dotenv/config';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';
import authRoutes from './routes/authRoutes.js';
import purchaseRequestRoutes from './routes/purchaseRequestRoutes.js';
import supplierRoutes from './routes/supplierRoutes.js';
import purchaseOrderRoutes from './routes/purchaseOrderRoutes.js';
import contractRoutes from './routes/contractRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import auditLogRoutes from './routes/auditLogRoutes.js';
import { errorMiddleware } from './middleware/errorMiddleware.js';
import { ensureUploadDirectory } from './middleware/uploadMiddleware.js';

const app: Express = express();
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Parse allowed origins from comma-separated FRONTEND_URL env var
const allowedOrigins: string[] = [
  ...FRONTEND_URL.split(',').map((u) => u.trim().replace(/\/$/, '')),
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5173',
];

// Dynamic CORS origin checker — allows explicit origins + all *.vercel.app preview URLs
const corsOriginFn = (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
  if (!origin) {
    // Allow server-to-server / curl requests with no Origin header
    return callback(null, true);
  }
  const normalised = origin.replace(/\/$/, '');
  if (
    allowedOrigins.includes(normalised) ||
    /\.vercel\.app$/.test(normalised) ||
    /^https?:\/\/localhost(:\d+)?$/.test(normalised)
  ) {
    return callback(null, true);
  }
  console.warn(`CORS: blocked origin → ${origin}`);
  return callback(new Error(`CORS policy: origin ${origin} not allowed`));
};

// Validate critical environment variables
function validateEnvironment() {
  const errors: string[] = [];
  
  if (!process.env.DATABASE_URL) {
    errors.push('DATABASE_URL is not configured');
  }
  
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 16) {
    errors.push('JWT_SECRET is not configured or too short (minimum 16 characters required)');
  }
  
  if (!process.env.OPENROUTER_API_KEY && !process.env.GEMINI_API_KEY) {
    console.warn('⚠️  INFO: AI API keys not configured. Optional AI supplier recommendations will use deterministic fallbacks.');
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
    origin: corsOriginFn,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Explicitly handle OPTIONS preflight for all routes
app.options('*', cors({ origin: corsOriginFn, credentials: true }));

// Serve static uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Health check endpoints
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Orderly Backend is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ 
    status: 'ok', 
    message: 'Orderly Backend is running',
    environment: NODE_ENV,
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/purchase-requests', purchaseRequestRoutes);
app.use('/api/suppliers', supplierRoutes);
app.use('/api/purchase-orders', purchaseOrderRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/audit-logs', auditLogRoutes);

// Root endpoint for platform and deployment checks
app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'Orderly API is running',
    status: 'ok',
    version: '1.0.0'
  });
});

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
║       Orderly Backend - Node.js + Express                ║
╠══════════════════════════════════════════════════════════╣
║ ✅ Server running on port ${PORT}                        ║
║ 📍 Environment: ${NODE_ENV}                               ║
║ 🌐 Frontend URL: ${FRONTEND_URL}                         ║
║ 🗄️  Database: PostgreSQL                                 ║
║ 🏥 Health: http://localhost:${PORT}/health              ║
║ 📁 Uploads: /uploads/contracts/                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

export default app;

