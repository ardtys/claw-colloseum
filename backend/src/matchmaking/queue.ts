import Queue from 'bull';
import { Server } from 'socket.io';
import { prisma } from '../index.js';
import { BattleEngine, AgentState } from '../arena-logic/battle.js';
import { OpenClaw } from '../claw-protocols/shield.js';
import { v4 as uuidv4 } from 'uuid';
import logger from '../utils/logger.js';

interface QueuedAgent {
  id: string;
  name: string;
  category: string;
  eloRating: number;
  socketId: string;
  queuedAt: number;
  totalGames: number;
}

interface MatchJob {
  matchId: string;
  agentA: QueuedAgent;
  agentB: QueuedAgent;
}

// Matchmaking configuration
const CONFIG = {
  BASE_ELO_RANGE: 200,
  ELO_EXPANSION_RATE: 50, // Expand by 50 ELO every 10 seconds
  ELO_EXPANSION_INTERVAL: 10000, // 10 seconds
  QUEUE_TIMEOUT: 60000, // 60 seconds max wait
  CATEGORY_MATCH_TIMEOUT: 15000, // After 15s, ignore category
  MATCH_CHECK_INTERVAL: 1000, // Check every second
  MAX_ELO_RANGE: 500, // Maximum ELO difference
};

// ELO bucket system for O(1) matching
const ELO_BUCKET_SIZE = 100;

export class MatchmakingQueue {
  private io: Server;
  private queue: Queue.Queue<MatchJob>;
  private waitingAgents: Map<string, QueuedAgent> = new Map();
  private eloBuckets: Map<number, Set<string>> = new Map();
  private matchCheckInterval: NodeJS.Timeout | null = null;
  private activeBattles: Map<string, BattleEngine> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.queue = new Queue<MatchJob>('matchmaking', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      defaultJobOptions: {
        removeOnComplete: 100,
        removeOnFail: 50,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    });

    this.setupQueueProcessing();
  }

  private getEloBucket(elo: number): number {
    return Math.floor(elo / ELO_BUCKET_SIZE);
  }

  private addToBucket(agent: QueuedAgent): void {
    const bucket = this.getEloBucket(agent.eloRating);
    if (!this.eloBuckets.has(bucket)) {
      this.eloBuckets.set(bucket, new Set());
    }
    this.eloBuckets.get(bucket)!.add(agent.id);
  }

  private removeFromBucket(agent: QueuedAgent): void {
    const bucket = this.getEloBucket(agent.eloRating);
    this.eloBuckets.get(bucket)?.delete(agent.id);
  }

  async initialize(): Promise<void> {
    // Clear any stale jobs
    await this.queue.empty();
    await this.queue.clean(0, 'completed');
    await this.queue.clean(0, 'failed');

    logger.info('Matchmaking queue initialized');

    // Start match checking
    this.matchCheckInterval = setInterval(() => {
      this.tryMatchmaking();
    }, CONFIG.MATCH_CHECK_INTERVAL);
  }

  private setupQueueProcessing(): void {
    this.queue.process(async (job) => {
      const { matchId, agentA, agentB } = job.data;

      logger.info('Processing match', { matchId, agentA: agentA.name, agentB: agentB.name });

      // Fetch full agent data
      const [dbAgentA, dbAgentB] = await Promise.all([
        prisma.agent.findUnique({ where: { id: agentA.id } }),
        prisma.agent.findUnique({ where: { id: agentB.id } }),
      ]);

      if (!dbAgentA || !dbAgentB) {
        throw new Error('Agent not found');
      }

      // Create agent states with full data
      const stateA: AgentState = {
        id: dbAgentA.id,
        name: dbAgentA.name,
        category: dbAgentA.category,
        shield: dbAgentA.shieldConfig
          ? (dbAgentA.shieldConfig as unknown as AgentState['shield'])
          : OpenClaw.createShield('AES-256'),
        health: 100,
        integrity: 100,
        attackPower: 30 + Math.random() * 20,
        speed: 50,
        totalGames: dbAgentA.wins + dbAgentA.losses,
        eloRating: dbAgentA.eloRating,
      };

      const stateB: AgentState = {
        id: dbAgentB.id,
        name: dbAgentB.name,
        category: dbAgentB.category,
        shield: dbAgentB.shieldConfig
          ? (dbAgentB.shieldConfig as unknown as AgentState['shield'])
          : OpenClaw.createShield('AES-256'),
        health: 100,
        integrity: 100,
        attackPower: 30 + Math.random() * 20,
        speed: 50,
        totalGames: dbAgentB.wins + dbAgentB.losses,
        eloRating: dbAgentB.eloRating,
      };

      // Start battle
      const engine = new BattleEngine(this.io, matchId, stateA, stateB);
      this.activeBattles.set(matchId, engine);

      try {
        await engine.start();
      } finally {
        this.activeBattles.delete(matchId);
      }

      return { matchId, completed: true };
    });

    this.queue.on('completed', (job, result) => {
      logger.info('Match completed', { matchId: result.matchId });
    });

    this.queue.on('failed', (job, err) => {
      logger.error('Match failed', { matchId: job?.data?.matchId, error: err.message });
    });

    this.queue.on('stalled', (job) => {
      logger.warn('Match stalled', { matchId: job.data.matchId });
    });
  }

  async addToQueue(
    agentId: string,
    socketId: string
  ): Promise<{ position: number; estimatedWait: number }> {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
    });

    if (!agent) {
      throw new Error('Agent not found');
    }

    // Check if already in queue
    if (this.waitingAgents.has(agentId)) {
      const position = this.getQueuePosition(agentId);
      return { position, estimatedWait: position * 5 };
    }

    const queuedAgent: QueuedAgent = {
      id: agent.id,
      name: agent.name,
      category: agent.category,
      eloRating: agent.eloRating,
      socketId,
      queuedAt: Date.now(),
      totalGames: agent.wins + agent.losses,
    };

    this.waitingAgents.set(agentId, queuedAgent);
    this.addToBucket(queuedAgent);

    const position = this.waitingAgents.size;
    logger.info('Agent joined queue', { agentId, name: agent.name, position });

    // Notify the agent
    this.io.to(socketId).emit('queue:joined', { position, agentId });

    // Broadcast queue update
    this.broadcastQueueUpdate();

    return { position, estimatedWait: Math.max(5, (position - 1) * 5) };
  }

  removeFromQueue(agentId: string): boolean {
    const agent = this.waitingAgents.get(agentId);
    if (agent) {
      this.removeFromBucket(agent);
      this.waitingAgents.delete(agentId);
      this.io.to(agent.socketId).emit('queue:left', { agentId });
      logger.info('Agent left queue', { agentId, name: agent.name });
      this.broadcastQueueUpdate();
      return true;
    }
    return false;
  }

  private getQueuePosition(agentId: string): number {
    const agents = Array.from(this.waitingAgents.keys());
    return agents.indexOf(agentId) + 1;
  }

  private getDynamicEloRange(waitTime: number): number {
    const expansions = Math.floor(waitTime / CONFIG.ELO_EXPANSION_INTERVAL);
    return Math.min(
      CONFIG.MAX_ELO_RANGE,
      CONFIG.BASE_ELO_RANGE + expansions * CONFIG.ELO_EXPANSION_RATE
    );
  }

  private async tryMatchmaking(): Promise<void> {
    if (this.waitingAgents.size < 2) return;

    const agents = Array.from(this.waitingAgents.values());
    // Sort by queue time (oldest first)
    agents.sort((a, b) => a.queuedAt - b.queuedAt);

    const matched = new Set<string>();

    for (const agentA of agents) {
      if (matched.has(agentA.id)) continue;

      const waitTime = Date.now() - agentA.queuedAt;
      const eloRange = this.getDynamicEloRange(waitTime);

      // Find best match using bucket system
      const bestMatch = this.findBestMatch(agentA, eloRange, matched);

      if (bestMatch) {
        matched.add(agentA.id);
        matched.add(bestMatch.id);
        await this.createMatch(agentA, bestMatch);
      } else if (waitTime > CONFIG.QUEUE_TIMEOUT) {
        // Timeout - match with anyone available
        const anyMatch = agents.find(
          (a) => a.id !== agentA.id && !matched.has(a.id)
        );
        if (anyMatch) {
          matched.add(agentA.id);
          matched.add(anyMatch.id);
          await this.createMatch(agentA, anyMatch);
        }
      }
    }
  }

  private findBestMatch(
    agent: QueuedAgent,
    eloRange: number,
    excluded: Set<string>
  ): QueuedAgent | null {
    const bucket = this.getEloBucket(agent.eloRating);
    const bucketsToCheck = Math.ceil(eloRange / ELO_BUCKET_SIZE) + 1;
    const waitTime = Date.now() - agent.queuedAt;
    const ignoreCategory = waitTime > CONFIG.CATEGORY_MATCH_TIMEOUT;

    let bestMatch: QueuedAgent | null = null;
    let bestScore = -Infinity;

    // Check buckets in range
    for (let offset = -bucketsToCheck; offset <= bucketsToCheck; offset++) {
      const checkBucket = bucket + offset;
      const agentsInBucket = this.eloBuckets.get(checkBucket);

      if (!agentsInBucket) continue;

      for (const candidateId of agentsInBucket) {
        if (candidateId === agent.id || excluded.has(candidateId)) continue;

        const candidate = this.waitingAgents.get(candidateId);
        if (!candidate) continue;

        const eloDiff = Math.abs(agent.eloRating - candidate.eloRating);
        if (eloDiff > eloRange) continue;

        // Calculate match score
        let score = 100 - eloDiff; // Lower ELO diff = higher score

        // Category bonus
        if (agent.category === candidate.category) {
          score += 50;
        } else if (!ignoreCategory) {
          continue; // Skip non-matching categories if not timed out
        }

        // Wait time bonus (prioritize longer waiting players)
        const candidateWait = Date.now() - candidate.queuedAt;
        score += Math.min(20, candidateWait / 5000);

        if (score > bestScore) {
          bestScore = score;
          bestMatch = candidate;
        }
      }
    }

    return bestMatch;
  }

  private async createMatch(agentA: QueuedAgent, agentB: QueuedAgent): Promise<void> {
    // Remove from waiting queue
    this.removeFromBucket(agentA);
    this.removeFromBucket(agentB);
    this.waitingAgents.delete(agentA.id);
    this.waitingAgents.delete(agentB.id);

    const matchId = uuidv4();

    // Create match record
    await prisma.match.create({
      data: {
        id: matchId,
        agentAId: agentA.id,
        agentBId: agentB.id,
        status: 'PENDING',
      },
    });

    // Notify agents
    this.io.to(agentA.socketId).emit('match:found', {
      matchId,
      opponent: { name: agentB.name, elo: agentB.eloRating },
    });
    this.io.to(agentB.socketId).emit('match:found', {
      matchId,
      opponent: { name: agentA.name, elo: agentA.eloRating },
    });

    // Join match room
    const socketA = this.io.sockets.sockets.get(agentA.socketId);
    const socketB = this.io.sockets.sockets.get(agentB.socketId);

    if (socketA) socketA.join(matchId);
    if (socketB) socketB.join(matchId);

    // Add to processing queue
    await this.queue.add({ matchId, agentA, agentB });

    logger.info('Match created', {
      matchId,
      agentA: agentA.name,
      agentB: agentB.name,
      eloDiff: Math.abs(agentA.eloRating - agentB.eloRating),
    });

    this.broadcastQueueUpdate();
  }

  private broadcastQueueUpdate(): void {
    const status = this.getQueueStatus();
    this.io.emit('queue:update', status);
  }

  getQueueStatus(): {
    total: number;
    agents: { name: string; position: number; waitTime: number }[];
  } {
    const agents = Array.from(this.waitingAgents.values());
    const now = Date.now();

    return {
      total: agents.length,
      agents: agents
        .sort((a, b) => a.queuedAt - b.queuedAt)
        .map((a, i) => ({
          name: a.name,
          position: i + 1,
          waitTime: Math.floor((now - a.queuedAt) / 1000),
        })),
    };
  }

  getActiveBattleCount(): number {
    return this.activeBattles.size;
  }

  async close(): Promise<void> {
    if (this.matchCheckInterval) {
      clearInterval(this.matchCheckInterval);
    }

    // Wait for active battles to complete
    const timeout = 30000; // 30 seconds
    const start = Date.now();

    while (this.activeBattles.size > 0 && Date.now() - start < timeout) {
      logger.info('Waiting for active battles to complete', {
        count: this.activeBattles.size,
      });
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }

    await this.queue.close();
    logger.info('Matchmaking queue closed');
  }
}
