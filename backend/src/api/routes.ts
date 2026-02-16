import { Express, Request, Response } from 'express';
import { prisma } from '../index.js';
import { OpenClaw, EncryptionProtocol } from '../claw-protocols/shield.js';
import { MoltbookLogger } from '../molt-adapter/logger.js';
import { readFile } from 'fs/promises';
import { join } from 'path';

export function setupRoutes(app: Express): void {
  // Health check
  app.get('/health', (req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: Date.now() });
  });

  // ================= AGENT ROUTES =================

  // Register new agent
  app.post('/agents/register', async (req: Request, res: Response) => {
    try {
      const { name, category } = req.body;

      if (!name || !category) {
        res.status(400).json({ error: 'Name and category are required' });
        return;
      }

      const existing = await prisma.agent.findUnique({ where: { name } });
      if (existing) {
        res.status(409).json({ error: 'Agent name already taken' });
        return;
      }

      const agent = await prisma.agent.create({
        data: {
          name,
          category,
          eloRating: 1200
        }
      });

      res.status(201).json({
        id: agent.id,
        name: agent.name,
        category: agent.category,
        eloRating: agent.eloRating,
        message: 'Agent registered successfully'
      });
    } catch (error) {
      console.error('[API] Register error:', error);
      res.status(500).json({ error: 'Failed to register agent' });
    }
  });

  // Get agent by ID
  app.get('/agents/:id', async (req: Request, res: Response) => {
    try {
      const agent = await prisma.agent.findUnique({
        where: { id: req.params.id },
        include: {
          matchesAsA: { take: 5, orderBy: { createdAt: 'desc' } },
          matchesAsB: { take: 5, orderBy: { createdAt: 'desc' } }
        }
      });

      if (!agent) {
        res.status(404).json({ error: 'Agent not found' });
        return;
      }

      const recentMatches = [...agent.matchesAsA, ...agent.matchesAsB]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 5);

      res.json({
        id: agent.id,
        name: agent.name,
        category: agent.category,
        eloRating: agent.eloRating,
        wins: agent.wins,
        losses: agent.losses,
        winRate: agent.wins + agent.losses > 0
          ? Math.round((agent.wins / (agent.wins + agent.losses)) * 100)
          : 0,
        hasShield: !!agent.shieldConfig,
        recentMatches: recentMatches.map(m => ({
          id: m.id,
          status: m.status,
          startedAt: m.startedAt
        }))
      });
    } catch (error) {
      console.error('[API] Get agent error:', error);
      res.status(500).json({ error: 'Failed to fetch agent' });
    }
  });

  // Submit encryption shield
  app.post('/agents/:id/shield', async (req: Request, res: Response) => {
    try {
      const { protocol } = req.body as { protocol: EncryptionProtocol };

      if (!['AES-256', 'RSA-2048', 'CHACHA20'].includes(protocol)) {
        res.status(400).json({ error: 'Invalid protocol. Use AES-256, RSA-2048, or CHACHA20' });
        return;
      }

      const agent = await prisma.agent.findUnique({ where: { id: req.params.id } });
      if (!agent) {
        res.status(404).json({ error: 'Agent not found' });
        return;
      }

      const shield = OpenClaw.createShield(protocol);
      const validation = OpenClaw.validateShield(shield);

      await prisma.agent.update({
        where: { id: req.params.id },
        data: { shieldConfig: shield as object }
      });

      res.json({
        message: 'Shield configured successfully',
        protocol: shield.protocol,
        strength: validation.strength,
        valid: validation.valid,
        vulnerabilities: validation.vulnerabilities
      });
    } catch (error) {
      console.error('[API] Shield error:', error);
      res.status(500).json({ error: 'Failed to configure shield' });
    }
  });

  // ================= MATCH ROUTES =================

  // Get match details
  app.get('/matches/:id', async (req: Request, res: Response) => {
    try {
      const match = await prisma.match.findUnique({
        where: { id: req.params.id },
        include: {
          agentA: { select: { id: true, name: true, category: true, eloRating: true } },
          agentB: { select: { id: true, name: true, category: true, eloRating: true } },
          winner: { select: { id: true, name: true } }
        }
      });

      if (!match) {
        res.status(404).json({ error: 'Match not found' });
        return;
      }

      res.json({
        id: match.id,
        status: match.status,
        agentA: match.agentA,
        agentB: match.agentB,
        winner: match.winner,
        scores: match.scores,
        startedAt: match.startedAt,
        endedAt: match.endedAt
      });
    } catch (error) {
      console.error('[API] Get match error:', error);
      res.status(500).json({ error: 'Failed to fetch match' });
    }
  });

  // Get recent matches
  app.get('/matches', async (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 10, 50);
      const status = req.query.status as string;

      const where = status ? { status: status as any } : {};

      const matches = await prisma.match.findMany({
        where,
        include: {
          agentA: { select: { name: true } },
          agentB: { select: { name: true } },
          winner: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' },
        take: limit
      });

      res.json(matches.map(m => ({
        id: m.id,
        agentA: m.agentA.name,
        agentB: m.agentB.name,
        winner: m.winner?.name || null,
        status: m.status,
        startedAt: m.startedAt
      })));
    } catch (error) {
      console.error('[API] Get matches error:', error);
      res.status(500).json({ error: 'Failed to fetch matches' });
    }
  });

  // ================= LEADERBOARD =================

  app.get('/leaderboard', async (req: Request, res: Response) => {
    try {
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const category = req.query.category as string;

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
          losses: true
        }
      });

      res.json(agents.map((agent, index) => ({
        rank: index + 1,
        ...agent,
        winRate: agent.wins + agent.losses > 0
          ? Math.round((agent.wins / (agent.wins + agent.losses)) * 100)
          : 0
      })));
    } catch (error) {
      console.error('[API] Leaderboard error:', error);
      res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
  });

  // ================= MOLT FILES =================

  // Download molt file
  app.get('/molt/:matchId', async (req: Request, res: Response) => {
    try {
      const match = await prisma.match.findUnique({
        where: { id: req.params.matchId }
      });

      if (!match || !match.moltFilePath) {
        res.status(404).json({ error: 'Molt file not found' });
        return;
      }

      const content = await readFile(match.moltFilePath, 'utf-8');
      const moltFile = JSON.parse(content);

      res.json(moltFile);
    } catch (error) {
      console.error('[API] Molt download error:', error);
      res.status(500).json({ error: 'Failed to fetch molt file' });
    }
  });

  // Verify molt file integrity
  app.post('/molt/:matchId/verify', async (req: Request, res: Response) => {
    try {
      const match = await prisma.match.findUnique({
        where: { id: req.params.matchId }
      });

      if (!match || !match.moltFilePath) {
        res.status(404).json({ error: 'Molt file not found' });
        return;
      }

      const moltFile = await MoltbookLogger.loadFromFile(match.moltFilePath);
      const isValid = MoltbookLogger.verifyMoltFile(moltFile);

      res.json({
        matchId: req.params.matchId,
        valid: isValid,
        eventCount: moltFile.events.length,
        signature: moltFile.signature
      });
    } catch (error) {
      console.error('[API] Molt verify error:', error);
      res.status(500).json({ error: 'Failed to verify molt file' });
    }
  });

  // ================= STATS =================

  app.get('/stats', async (req: Request, res: Response) => {
    try {
      const [totalAgents, totalMatches, completedMatches, categories] = await Promise.all([
        prisma.agent.count(),
        prisma.match.count(),
        prisma.match.count({ where: { status: 'COMPLETED' } }),
        prisma.agent.groupBy({
          by: ['category'],
          _count: { category: true }
        })
      ]);

      res.json({
        totalAgents,
        totalMatches,
        completedMatches,
        categories: categories.map(c => ({
          name: c.category,
          count: c._count.category
        }))
      });
    } catch (error) {
      console.error('[API] Stats error:', error);
      res.status(500).json({ error: 'Failed to fetch stats' });
    }
  });

  console.log('[API] Routes configured');
}
