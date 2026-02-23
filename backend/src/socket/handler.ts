import { Server, Socket } from 'socket.io';
import { matchmakingQueue } from '../index.js';
import logger from '../utils/logger.js';

interface ClientData {
  agentId?: string;
  inMatch?: string;
  connectedAt: number;
  lastActivity: number;
}

const clientData = new Map<string, ClientData>();

// Cleanup interval for stale connections
const CLEANUP_INTERVAL = 60000; // 1 minute
const STALE_THRESHOLD = 300000; // 5 minutes of inactivity

export function setupSocketHandlers(io: Server): void {
  // Periodic cleanup of stale client data
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    let cleaned = 0;

    for (const [socketId, data] of clientData.entries()) {
      // Check if socket still exists
      if (!io.sockets.sockets.has(socketId)) {
        // Clean up orphaned data
        if (data.agentId) {
          matchmakingQueue.removeFromQueue(data.agentId);
        }
        clientData.delete(socketId);
        cleaned++;
      } else if (now - data.lastActivity > STALE_THRESHOLD) {
        // Disconnect stale connections
        const socket = io.sockets.sockets.get(socketId);
        if (socket) {
          socket.disconnect(true);
        }
        clientData.delete(socketId);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      logger.info('Cleaned up stale connections', { count: cleaned });
    }
  }, CLEANUP_INTERVAL);

  io.on('connection', (socket: Socket) => {
    logger.info('Client connected', { socketId: socket.id });

    clientData.set(socket.id, {
      connectedAt: Date.now(),
      lastActivity: Date.now(),
    });

    // Update activity on any event
    const updateActivity = () => {
      const data = clientData.get(socket.id);
      if (data) {
        data.lastActivity = Date.now();
      }
    };

    // Queue management
    socket.on('queue:join', async (data: { agentId: string }) => {
      updateActivity();

      if (!data.agentId || typeof data.agentId !== 'string') {
        socket.emit('error', { message: 'Invalid agent ID' });
        return;
      }

      try {
        const result = await matchmakingQueue.addToQueue(data.agentId, socket.id);
        const clientInfo = clientData.get(socket.id);
        if (clientInfo) {
          clientInfo.agentId = data.agentId;
        }
        socket.emit('queue:status', result);
      } catch (error) {
        logger.error('Queue join error', {
          socketId: socket.id,
          agentId: data.agentId,
          error: (error as Error).message,
        });
        socket.emit('error', { message: (error as Error).message });
      }
    });

    socket.on('queue:leave', () => {
      updateActivity();

      const data = clientData.get(socket.id);
      if (data?.agentId) {
        matchmakingQueue.removeFromQueue(data.agentId);
        data.agentId = undefined;
      }
    });

    socket.on('queue:status', () => {
      updateActivity();

      const status = matchmakingQueue.getQueueStatus();
      socket.emit('queue:status', status);
    });

    // Match management
    socket.on('match:join', (data: { matchId: string }) => {
      updateActivity();

      if (!data.matchId || typeof data.matchId !== 'string') {
        socket.emit('error', { message: 'Invalid match ID' });
        return;
      }

      socket.join(data.matchId);
      const clientInfo = clientData.get(socket.id);
      if (clientInfo) {
        clientInfo.inMatch = data.matchId;
      }

      logger.info('Client joined match', { socketId: socket.id, matchId: data.matchId });
    });

    socket.on('match:leave', () => {
      updateActivity();

      const data = clientData.get(socket.id);
      if (data?.inMatch) {
        socket.leave(data.inMatch);
        data.inMatch = undefined;
      }
    });

    // Spectator mode
    socket.on('spectate:join', (data: { matchId: string }) => {
      updateActivity();

      if (!data.matchId || typeof data.matchId !== 'string') {
        socket.emit('error', { message: 'Invalid match ID' });
        return;
      }

      socket.join(`spectate:${data.matchId}`);
      logger.info('Spectator joined', { socketId: socket.id, matchId: data.matchId });
    });

    socket.on('spectate:leave', (data: { matchId: string }) => {
      updateActivity();

      if (data.matchId) {
        socket.leave(`spectate:${data.matchId}`);
      }
    });

    // Disconnect handling
    socket.on('disconnect', (reason) => {
      const data = clientData.get(socket.id);

      // Remove from queue if waiting
      if (data?.agentId) {
        matchmakingQueue.removeFromQueue(data.agentId);
      }

      clientData.delete(socket.id);
      logger.info('Client disconnected', { socketId: socket.id, reason });
    });

    // Error handling
    socket.on('error', (error) => {
      logger.error('Socket error', { socketId: socket.id, error: error.message });
    });

    // Heartbeat
    socket.on('ping', () => {
      updateActivity();
      socket.emit('pong', { timestamp: Date.now() });
    });
  });

  // Broadcast queue updates periodically
  const queueUpdateInterval = setInterval(() => {
    const status = matchmakingQueue.getQueueStatus();
    io.emit('queue:update', status);
  }, 5000);

  // Cleanup on server shutdown
  process.on('SIGTERM', () => {
    clearInterval(cleanupInterval);
    clearInterval(queueUpdateInterval);
  });

  logger.info('Socket handlers configured');
}

export function broadcastToMatch(io: Server, matchId: string, event: string, data: unknown): void {
  io.to(matchId).emit(event, data);
  io.to(`spectate:${matchId}`).emit(event, data);
}

export function getConnectedClients(): number {
  return clientData.size;
}
