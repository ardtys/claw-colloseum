import { Server, Socket } from 'socket.io';
import { matchmakingQueue } from '../index.js';

interface ClientData {
  agentId?: string;
  inMatch?: string;
}

const clientData = new Map<string, ClientData>();

export function setupSocketHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log(`[SOCKET] Client connected: ${socket.id}`);
    clientData.set(socket.id, {});

    // Queue management
    socket.on('queue:join', async (data: { agentId: string }) => {
      try {
        const result = await matchmakingQueue.addToQueue(data.agentId, socket.id);
        clientData.set(socket.id, { ...clientData.get(socket.id), agentId: data.agentId });
        socket.emit('queue:status', result);
      } catch (error) {
        socket.emit('error', { message: (error as Error).message });
      }
    });

    socket.on('queue:leave', () => {
      const data = clientData.get(socket.id);
      if (data?.agentId) {
        matchmakingQueue.removeFromQueue(data.agentId);
      }
    });

    socket.on('queue:status', () => {
      const status = matchmakingQueue.getQueueStatus();
      socket.emit('queue:status', status);
    });

    // Match management
    socket.on('match:join', (data: { matchId: string }) => {
      socket.join(data.matchId);
      clientData.set(socket.id, { ...clientData.get(socket.id), inMatch: data.matchId });
      console.log(`[SOCKET] Client ${socket.id} joined match ${data.matchId}`);
    });

    socket.on('match:leave', () => {
      const data = clientData.get(socket.id);
      if (data?.inMatch) {
        socket.leave(data.inMatch);
        clientData.set(socket.id, { ...clientData.get(socket.id), inMatch: undefined });
      }
    });

    // Spectator mode
    socket.on('spectate:join', (data: { matchId: string }) => {
      socket.join(`spectate:${data.matchId}`);
      console.log(`[SOCKET] Spectator ${socket.id} watching match ${data.matchId}`);
    });

    socket.on('spectate:leave', (data: { matchId: string }) => {
      socket.leave(`spectate:${data.matchId}`);
    });

    // Disconnect handling
    socket.on('disconnect', () => {
      const data = clientData.get(socket.id);

      // Remove from queue if waiting
      if (data?.agentId) {
        matchmakingQueue.removeFromQueue(data.agentId);
      }

      clientData.delete(socket.id);
      console.log(`[SOCKET] Client disconnected: ${socket.id}`);
    });

    // Heartbeat
    socket.on('ping', () => {
      socket.emit('pong', { timestamp: Date.now() });
    });
  });

  // Broadcast queue updates periodically
  setInterval(() => {
    const status = matchmakingQueue.getQueueStatus();
    io.emit('queue:update', status);
  }, 5000);

  console.log('[SOCKET] Handlers configured');
}

export function broadcastToMatch(io: Server, matchId: string, event: string, data: unknown): void {
  io.to(matchId).emit(event, data);
  io.to(`spectate:${matchId}`).emit(event, data);
}
