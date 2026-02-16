import express from 'express';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { setupRoutes } from './api/routes.js';
import { setupSocketHandlers } from './socket/handler.js';
import { MatchmakingQueue } from './matchmaking/queue.js';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

export const prisma = new PrismaClient();
export const matchmakingQueue = new MatchmakingQueue(io);

app.use(cors());
app.use(express.json());

setupRoutes(app);
setupSocketHandlers(io);

const PORT = process.env.PORT || 3001;

async function main() {
  try {
    await prisma.$connect();
    console.log('[DB] Connected to PostgreSQL');

    await matchmakingQueue.initialize();
    console.log('[QUEUE] Matchmaking queue initialized');

    httpServer.listen(PORT, () => {
      console.log(`[SERVER] Claw-Colosseum running on port ${PORT}`);
      console.log(`[SOCKET] WebSocket server ready`);
    });
  } catch (error) {
    console.error('[ERROR] Failed to start server:', error);
    process.exit(1);
  }
}

main();

process.on('SIGTERM', async () => {
  console.log('[SHUTDOWN] Graceful shutdown initiated');
  await matchmakingQueue.close();
  await prisma.$disconnect();
  process.exit(0);
});
