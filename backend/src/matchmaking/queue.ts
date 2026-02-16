import Queue from 'bull';
import { Server } from 'socket.io';
import { prisma } from '../index.js';
import { BattleEngine, AgentState } from '../arena-logic/battle.js';
import { OpenClaw } from '../claw-protocols/shield.js';
import { v4 as uuidv4 } from 'uuid';

interface QueuedAgent {
  id: string;
  name: string;
  category: string;
  eloRating: number;
  socketId: string;
  queuedAt: number;
}

interface MatchJob {
  matchId: string;
  agentA: QueuedAgent;
  agentB: QueuedAgent;
}

const ELO_RANGE = 200;
const QUEUE_TIMEOUT = 30000; // 30 seconds

export class MatchmakingQueue {
  private io: Server;
  private queue: Queue.Queue<MatchJob>;
  private waitingAgents: Map<string, QueuedAgent> = new Map();
  private matchCheckInterval: NodeJS.Timeout | null = null;

  constructor(io: Server) {
    this.io = io;
    this.queue = new Queue<MatchJob>('matchmaking', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379')
      }
    });

    this.setupQueueProcessing();
  }

  async initialize(): Promise<void> {
    // Clear any stale jobs
    await this.queue.empty();
    console.log('[MATCHMAKING] Queue initialized');

    // Start match checking
    this.matchCheckInterval = setInterval(() => {
      this.tryMatchmaking();
    }, 1000);
  }

  private setupQueueProcessing(): void {
    this.queue.process(async (job) => {
      const { matchId, agentA, agentB } = job.data;

      console.log(`[MATCHMAKING] Processing match ${matchId}`);

      // Fetch full agent data
      const [dbAgentA, dbAgentB] = await Promise.all([
        prisma.agent.findUnique({ where: { id: agentA.id } }),
        prisma.agent.findUnique({ where: { id: agentB.id } })
      ]);

      if (!dbAgentA || !dbAgentB) {
        throw new Error('Agent not found');
      }

      // Create agent states
      const stateA: AgentState = {
        id: dbAgentA.id,
        name: dbAgentA.name,
        category: dbAgentA.category,
        shield: dbAgentA.shieldConfig
          ? (dbAgentA.shieldConfig as AgentState['shield'])
          : OpenClaw.createShield('AES-256'),
        health: 100,
        integrity: 100,
        attackPower: 30 + Math.random() * 20,
        speed: 50
      };

      const stateB: AgentState = {
        id: dbAgentB.id,
        name: dbAgentB.name,
        category: dbAgentB.category,
        shield: dbAgentB.shieldConfig
          ? (dbAgentB.shieldConfig as AgentState['shield'])
          : OpenClaw.createShield('AES-256'),
        health: 100,
        integrity: 100,
        attackPower: 30 + Math.random() * 20,
        speed: 50
      };

      // Start battle
      const engine = new BattleEngine(this.io, matchId, stateA, stateB);
      await engine.start();

      return { matchId, completed: true };
    });

    this.queue.on('completed', (job, result) => {
      console.log(`[MATCHMAKING] Match ${result.matchId} completed`);
    });

    this.queue.on('failed', (job, err) => {
      console.error(`[MATCHMAKING] Match failed:`, err);
    });
  }

  async addToQueue(
    agentId: string,
    socketId: string
  ): Promise<{ position: number; estimatedWait: number }> {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId }
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Check if already in queue
    if (this.waitingAgents.has(agentId)) {
      const position = Array.from(this.waitingAgents.keys()).indexOf(agentId) + 1;
      return { position, estimatedWait: position * 5 };
    }

    const queuedAgent: QueuedAgent = {
      id: agent.id,
      name: agent.name,
      category: agent.category,
      eloRating: agent.eloRating,
      socketId,
      queuedAt: Date.now()
    };

    this.waitingAgents.set(agentId, queuedAgent);

    const position = this.waitingAgents.size;
    console.log(`[MATCHMAKING] Agent ${agent.name} joined queue (position: ${position})`);

    // Notify the agent
    this.io.to(socketId).emit('queue:joined', { position, agentId });

    return { position, estimatedWait: Math.max(5, (position - 1) * 5) };
  }

  removeFromQueue(agentId: string): boolean {
    const agent = this.waitingAgents.get(agentId);
    if (agent) {
      this.waitingAgents.delete(agentId);
      this.io.to(agent.socketId).emit('queue:left', { agentId });
      return true;
    }
    return false;
  }

  private async tryMatchmaking(): Promise<void> {
    const agents = Array.from(this.waitingAgents.values());

    if (agents.length < 2) return;

    // Sort by queue time
    agents.sort((a, b) => a.queuedAt - b.queuedAt);

    for (let i = 0; i < agents.length - 1; i++) {
      const agentA = agents[i];

      // Find suitable opponent
      for (let j = i + 1; j < agents.length; j++) {
        const agentB = agents[j];

        // Check Elo range
        const eloDiff = Math.abs(agentA.eloRating - agentB.eloRating);
        const waitTime = Date.now() - agentA.queuedAt;

        // Expand range based on wait time
        const dynamicRange = ELO_RANGE + Math.floor(waitTime / 10000) * 50;

        if (eloDiff <= dynamicRange) {
          // Check category match (optional)
          const categoryMatch = agentA.category === agentB.category;

          if (categoryMatch || waitTime > 15000) {
            await this.createMatch(agentA, agentB);
            return;
          }
        }
      }

      // Timeout - force match with next available
      if (Date.now() - agentA.queuedAt > QUEUE_TIMEOUT && agents.length >= 2) {
        await this.createMatch(agentA, agents[i + 1]);
        return;
      }
    }
  }

  private async createMatch(agentA: QueuedAgent, agentB: QueuedAgent): Promise<void> {
    // Remove from waiting queue
    this.waitingAgents.delete(agentA.id);
    this.waitingAgents.delete(agentB.id);

    const matchId = uuidv4();

    // Create match record
    await prisma.match.create({
      data: {
        id: matchId,
        agentAId: agentA.id,
        agentBId: agentB.id,
        status: 'PENDING'
      }
    });

    // Notify agents
    this.io.to(agentA.socketId).emit('match:found', { matchId, opponent: agentB.name });
    this.io.to(agentB.socketId).emit('match:found', { matchId, opponent: agentA.name });

    // Join match room
    const socketA = this.io.sockets.sockets.get(agentA.socketId);
    const socketB = this.io.sockets.sockets.get(agentB.socketId);

    if (socketA) socketA.join(matchId);
    if (socketB) socketB.join(matchId);

    // Add to processing queue
    await this.queue.add({ matchId, agentA, agentB });

    console.log(`[MATCHMAKING] Created match ${matchId}: ${agentA.name} vs ${agentB.name}`);
  }

  getQueueStatus(): { total: number; agents: { name: string; position: number }[] } {
    const agents = Array.from(this.waitingAgents.values());
    return {
      total: agents.length,
      agents: agents.map((a, i) => ({ name: a.name, position: i + 1 }))
    };
  }

  async close(): Promise<void> {
    if (this.matchCheckInterval) {
      clearInterval(this.matchCheckInterval);
    }
    await this.queue.close();
  }
}
