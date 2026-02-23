import { Express, Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { prisma } from '../index.js';
import { OpenClaw } from '../claw-protocols/shield.js';
import { MoltbookLogger } from '../molt-adapter/logger.js';
import { readFile } from 'fs/promises';
import logger from '../utils/logger.js';
import {
  RegisterAgentSchema,
  ShieldConfigSchema,
  MatchQuerySchema,
  LeaderboardQuerySchema,
  UUIDSchema,
} from '../utils/validation.js';
import { AppError, NotFoundError, ConflictError, ValidationError } from '../utils/errors.js';

// Response wrapper for consistency
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: { code: string; message: string; details?: unknown };
  meta?: { timestamp: number };
}

function sendSuccess<T>(res: Response, data: T, status: number = 200): void {
  const response: ApiResponse<T> = {
    success: true,
    data,
    meta: { timestamp: Date.now() },
  };
  res.status(status).json(response);
}

function sendError(res: Response, error: AppError | Error): void {
  const statusCode = error instanceof AppError ? error.statusCode : 500;
  const code = error instanceof AppError ? error.code : 'INTERNAL_ERROR';

  const response: ApiResponse = {
    success: false,
    error: {
      code,
      message: error.message,
    },
    meta: { timestamp: Date.now() },
  };

  res.status(statusCode).json(response);
}

// Async handler wrapper
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<void>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export function setupRoutes(app: Express): void {
  // Health check
  app.get('/health', (req: Request, res: Response) => {
    sendSuccess(res, { status: 'healthy', uptime: process.uptime() });
  });

  // ================= AGENT ROUTES =================

  // Register new agent
  app.post(
    '/agents/register',
    asyncHandler(async (req: Request, res: Response) => {
      const validated = RegisterAgentSchema.parse(req.body);

      const existing = await prisma.agent.findUnique({
        where: { name: validated.name },
      });

      if (existing) {
        throw new ConflictError('Agent name already taken');
      }

      const agent = await prisma.agent.create({
        data: {
          name: validated.name,
          category: validated.category,
          eloRating: 1200,
        },
      });

      logger.info('Agent registered', { agentId: agent.id, name: agent.name });

      sendSuccess(
        res,
        {
          id: agent.id,
          name: agent.name,
          category: agent.category,
          eloRating: agent.eloRating,
        },
        201
      );
    })
  );

  // Get agent by ID
  app.get(
    '/agents/:id',
    asyncHandler(async (req: Request, res: Response) => {
      const id = UUIDSchema.parse(req.params.id);

      const agent = await prisma.agent.findUnique({
        where: { id },
        include: {
          matchesAsA: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, status: true, startedAt: true, winnerId: true },
          },
          matchesAsB: {
            take: 5,
            orderBy: { createdAt: 'desc' },
            select: { id: true, status: true, startedAt: true, winnerId: true },
          },
        },
      });

      if (!agent) {
        throw new NotFoundError('Agent');
      }

      const recentMatches = [...agent.matchesAsA, ...agent.matchesAsB]
        .sort((a, b) => (b.startedAt?.getTime() || 0) - (a.startedAt?.getTime() || 0))
        .slice(0, 5);

      const totalGames = agent.wins + agent.losses;

      sendSuccess(res, {
        id: agent.id,
        name: agent.name,
        category: agent.category,
        eloRating: agent.eloRating,
        wins: agent.wins,
        losses: agent.losses,
        winRate: totalGames > 0 ? Math.round((agent.wins / totalGames) * 100) : 0,
        totalGames,
        hasShield: !!agent.shieldConfig,
        recentMatches: recentMatches.map((m) => ({
          id: m.id,
          status: m.status,
          startedAt: m.startedAt,
          won: m.winnerId === agent.id,
        })),
      });
    })
  );

  // Submit encryption shield
  app.post(
    '/agents/:id/shield',
    asyncHandler(async (req: Request, res: Response) => {
      const id = UUIDSchema.parse(req.params.id);
      const { protocol } = ShieldConfigSchema.parse(req.body);

      const agent = await prisma.agent.findUnique({ where: { id } });
      if (!agent) {
        throw new NotFoundError('Agent');
      }

      const shield = OpenClaw.createShield(protocol);
      const validation = OpenClaw.validateShield(shield);

      await prisma.agent.update({
        where: { id },
        data: { shieldConfig: shield as object },
      });

      logger.info('Shield configured', { agentId: id, protocol, strength: validation.strength });

      sendSuccess(res, {
        protocol: shield.protocol,
        strength: validation.strength,
        valid: validation.valid,
        vulnerabilities: validation.vulnerabilities,
      });
    })
  );

  // ================= MATCH ROUTES =================

  // Get match details
  app.get(
    '/matches/:id',
    asyncHandler(async (req: Request, res: Response) => {
      const id = UUIDSchema.parse(req.params.id);

      const match = await prisma.match.findUnique({
        where: { id },
        include: {
          agentA: { select: { id: true, name: true, category: true, eloRating: true } },
          agentB: { select: { id: true, name: true, category: true, eloRating: true } },
          winner: { select: { id: true, name: true } },
        },
      });

      if (!match) {
        throw new NotFoundError('Match');
      }

      sendSuccess(res, {
        id: match.id,
        status: match.status,
        agentA: match.agentA,
        agentB: match.agentB,
        winner: match.winner,
        scores: match.scores,
        startedAt: match.startedAt,
        endedAt: match.endedAt,
        duration: match.endedAt && match.startedAt
          ? match.endedAt.getTime() - match.startedAt.getTime()
          : null,
      });
    })
  );

  // Get recent matches
  app.get(
    '/matches',
    asyncHandler(async (req: Request, res: Response) => {
      const { limit, status, offset } = MatchQuerySchema.parse(req.query);

      const where = status ? { status: status as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' } : {};

      const [matches, total] = await Promise.all([
        prisma.match.findMany({
          where,
          include: {
            agentA: { select: { name: true, eloRating: true } },
            agentB: { select: { name: true, eloRating: true } },
            winner: { select: { name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: limit,
          skip: offset,
        }),
        prisma.match.count({ where }),
      ]);

      sendSuccess(res, {
        matches: matches.map((m) => ({
          id: m.id,
          agentA: { name: m.agentA.name, elo: m.agentA.eloRating },
          agentB: { name: m.agentB.name, elo: m.agentB.eloRating },
          winner: m.winner?.name || null,
          status: m.status,
          startedAt: m.startedAt,
        })),
        pagination: {
          total,
          limit,
          offset,
          hasMore: offset + matches.length < total,
        },
      });
    })
  );

  // ================= LEADERBOARD =================

  app.get(
    '/leaderboard',
    asyncHandler(async (req: Request, res: Response) => {
      const { limit, category } = LeaderboardQuerySchema.parse(req.query);

      const where = category ? { category } : {};

      const agents = await prisma.agent.findMany({
        where,
        orderBy: { eloRating: 'desc' },
        take: limit,
        select: {
          id: true,
          name: true,
          category: true,
          eloRating: true,
          wins: true,
          losses: true,
        },
      });

      sendSuccess(res, {
        leaderboard: agents.map((agent, index) => {
          const totalGames = agent.wins + agent.losses;
          return {
            rank: index + 1,
            ...agent,
            winRate: totalGames > 0 ? Math.round((agent.wins / totalGames) * 100) : 0,
            totalGames,
          };
        }),
      });
    })
  );

  // ================= MOLT FILES =================

  // Download molt file
  app.get(
    '/molt/:matchId',
    asyncHandler(async (req: Request, res: Response) => {
      const matchId = UUIDSchema.parse(req.params.matchId);

      const match = await prisma.match.findUnique({
        where: { id: matchId },
      });

      if (!match || !match.moltFilePath) {
        throw new NotFoundError('Molt file');
      }

      const content = await readFile(match.moltFilePath, 'utf-8');
      const moltFile = JSON.parse(content);

      sendSuccess(res, moltFile);
    })
  );

  // Verify molt file integrity
  app.post(
    '/molt/:matchId/verify',
    asyncHandler(async (req: Request, res: Response) => {
      const matchId = UUIDSchema.parse(req.params.matchId);

      const match = await prisma.match.findUnique({
        where: { id: matchId },
      });

      if (!match || !match.moltFilePath) {
        throw new NotFoundError('Molt file');
      }

      const moltFile = await MoltbookLogger.loadFromFile(match.moltFilePath);
      const isValid = MoltbookLogger.verifyMoltFile(moltFile);

      sendSuccess(res, {
        matchId,
        valid: isValid,
        eventCount: moltFile.events.length,
        signature: moltFile.signature,
        chainIntegrity: isValid ? 'VERIFIED' : 'CORRUPTED',
      });
    })
  );

  // ================= STATS =================

  app.get(
    '/stats',
    asyncHandler(async (req: Request, res: Response) => {
      const [totalAgents, totalMatches, completedMatches, inProgressMatches, categories, topAgents] =
        await Promise.all([
          prisma.agent.count(),
          prisma.match.count(),
          prisma.match.count({ where: { status: 'COMPLETED' } }),
          prisma.match.count({ where: { status: 'IN_PROGRESS' } }),
          prisma.agent.groupBy({
            by: ['category'],
            _count: { category: true },
          }),
          prisma.agent.findMany({
            orderBy: { eloRating: 'desc' },
            take: 3,
            select: { name: true, eloRating: true },
          }),
        ]);

      sendSuccess(res, {
        totalAgents,
        totalMatches,
        completedMatches,
        inProgressMatches,
        categories: categories.map((c) => ({
          name: c.category,
          count: c._count.category,
        })),
        topAgents,
      });
    })
  );

  // ================= ERROR HANDLER =================

  app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
    // Zod validation errors
    if (err instanceof ZodError) {
      const response: ApiResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid request data',
          details: err.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        },
        meta: { timestamp: Date.now() },
      };
      res.status(400).json(response);
      return;
    }

    // App errors
    if (err instanceof AppError) {
      logger.warn('Request error', {
        code: err.code,
        message: err.message,
        path: req.path,
      });
      sendError(res, err);
      return;
    }

    // Unknown errors
    logger.error('Unhandled error', {
      error: err.message,
      stack: err.stack,
      path: req.path,
    });

    sendError(res, new Error('Internal server error'));
  });

  logger.info('API routes configured');
}
