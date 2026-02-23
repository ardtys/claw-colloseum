import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { setupRoutes } from './api/routes.js';
import { setupSocketHandlers } from './socket/handler.js';
import { MatchmakingQueue } from './matchmaking/queue.js';
import { arenaSandbox } from './docker/sandbox.js';
import logger from './utils/logger.js';

const app = express();
const httpServer = createServer(app);

// Socket.IO configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

export let matchmakingQueue: MatchmakingQueue;

// Security middleware
app.use(helmet({
  contentSecurityPolicy: false, // Disable for API
  crossOriginEmbedderPolicy: false,
}));

// CORS configuration
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:3001',
  'http://127.0.0.1:3002',
  'https://claw-colloseum-nkdn.vercel.app',
  'https://claw-colloseum.vercel.app',
  ...(process.env.ALLOWED_ORIGINS || '').split(',').filter(Boolean),
];

const isDevelopment = process.env.NODE_ENV !== 'production';

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow all localhost/127.0.0.1 origins regardless of port
    if (isDevelopment) {
      const isLocalhost = origin.includes('localhost') || origin.includes('127.0.0.1');
      if (isLocalhost) {
        return callback(null, true);
      }
    }

    // Check against allowed origins
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Log rejected origins for debugging
    logger.warn('CORS rejected origin', { origin });
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to API routes
app.use('/agents', limiter);
app.use('/matches', limiter);

// Stricter rate limit for registration
const registrationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // 10 registrations per hour per IP
  message: {
    success: false,
    error: {
      code: 'REGISTRATION_LIMIT_EXCEEDED',
      message: 'Too many registration attempts, please try again later',
    },
  },
});

app.use('/agents/register', registrationLimiter);

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Request logging
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.path !== '/health') {
      logger.info('Request', {
        method: req.method,
        path: req.path,
        status: res.statusCode,
        duration: `${duration}ms`,
      });
    }
  });
  next();
});

// Setup routes
setupRoutes(app);

const PORT = process.env.PORT || 3001;

async function main() {
  try {
    // Connect to database
    await prisma.$connect();
    logger.info('Database connected');

    // Initialize sandbox
    await arenaSandbox.initialize();
    logger.info('Arena sandbox initialized');

    // Initialize matchmaking queue
    matchmakingQueue = new MatchmakingQueue(io);
    await matchmakingQueue.initialize();
    logger.info('Matchmaking queue initialized');

    // Setup socket handlers
    setupSocketHandlers(io);
    logger.info('Socket handlers configured');

    // Start server
    httpServer.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    logger.error('Failed to start server', { error: (error as Error).message });
    process.exit(1);
  }
}

main();

// Graceful shutdown
async function gracefulShutdown(signal: string) {
  logger.info(`${signal} received, starting graceful shutdown`);

  // Stop accepting new connections
  httpServer.close();

  try {
    // Close matchmaking queue (waits for active battles)
    if (matchmakingQueue) {
      await matchmakingQueue.close();
    }

    // Cleanup sandbox
    await arenaSandbox.destroyAll();

    // Disconnect from database
    await prisma.$disconnect();

    logger.info('Graceful shutdown completed');
    process.exit(0);
  } catch (error) {
    logger.error('Error during shutdown', { error: (error as Error).message });
    process.exit(1);
  }
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Uncaught exception handling
process.on('uncaughtException', (error) => {
  logger.error('Uncaught exception', { error: error.message, stack: error.stack });
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled rejection', { reason, promise });
});
