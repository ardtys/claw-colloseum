import { Server } from 'socket.io';
import { ClawShield, OpenClaw } from '../claw-protocols/shield.js';
import { MoltbookLogger, MoltRound } from '../molt-adapter/logger.js';
import { arenaSandbox } from '../docker/sandbox.js';
import { prisma } from '../index.js';
import { eloSystem } from '../utils/elo.js';
import logger from '../utils/logger.js';
import { join } from 'path';

export interface AgentState {
  id: string;
  name: string;
  category: string;
  shield: ClawShield;
  health: number;
  integrity: number;
  attackPower: number;
  speed: number;
  totalGames: number;
  eloRating: number;
}

export interface BattleMetrics {
  agentA: {
    health: number;
    integrity: number;
    speed: number;
  };
  agentB: {
    health: number;
    integrity: number;
    speed: number;
  };
  round: MoltRound;
  timeRemaining: number;
}

export interface BattleScores {
  agentId: string;
  encryption: number;
  attack: number;
  speed: number;
  total: number;
}

export interface BattleConfig {
  roundDuration: number;
  preMatchDelay: number;
  roundDelay: number;
}

const DEFAULT_CONFIG: BattleConfig = {
  roundDuration: 60,
  preMatchDelay: 2000,
  roundDelay: 3000,
};

export class BattleEngine {
  private io: Server;
  private matchId: string;
  private agentA: AgentState;
  private agentB: AgentState;
  private logger: MoltbookLogger;
  private currentRound: MoltRound = 'PRE_MATCH';
  private isRunning: boolean = false;
  private config: BattleConfig;
  private startTime: number = 0;

  constructor(
    io: Server,
    matchId: string,
    agentA: AgentState,
    agentB: AgentState,
    config: Partial<BattleConfig> = {}
  ) {
    this.io = io;
    this.matchId = matchId;
    this.agentA = agentA;
    this.agentB = agentB;
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.logger = new MoltbookLogger(matchId);
    this.logger.setAgents([
      { id: agentA.id, name: agentA.name, category: agentA.category },
      { id: agentB.id, name: agentB.name, category: agentB.category },
    ]);
  }

  private emit(event: string, data: unknown): void {
    this.io.to(this.matchId).emit(event, data);
  }

  private emitMetrics(): void {
    const elapsed = Date.now() - this.startTime;
    const timeRemaining = Math.max(0, this.config.roundDuration - Math.floor(elapsed / 1000));

    const metrics: BattleMetrics = {
      agentA: {
        health: Math.max(0, Math.round(this.agentA.health)),
        integrity: Math.max(0, Math.round(this.agentA.integrity)),
        speed: Math.round(this.agentA.speed),
      },
      agentB: {
        health: Math.max(0, Math.round(this.agentB.health)),
        integrity: Math.max(0, Math.round(this.agentB.integrity)),
        speed: Math.round(this.agentB.speed),
      },
      round: this.currentRound,
      timeRemaining,
    };
    this.emit('match:metrics', metrics);
  }

  private emitEvent(moltEvent: ReturnType<typeof this.logger.log>): void {
    this.emit('match:event', moltEvent);
  }

  async start(): Promise<void> {
    this.isRunning = true;
    this.startTime = Date.now();

    logger.info('Battle starting', {
      matchId: this.matchId,
      agentA: this.agentA.name,
      agentB: this.agentB.name,
    });

    try {
      // Update match status
      await prisma.match.update({
        where: { id: this.matchId },
        data: { status: 'IN_PROGRESS', startedAt: new Date() },
      });

      this.emit('match:start', {
        matchId: this.matchId,
        agentA: { id: this.agentA.id, name: this.agentA.name, elo: this.agentA.eloRating },
        agentB: { id: this.agentB.id, name: this.agentB.name, elo: this.agentB.eloRating },
      });

      // Pre-match shield validation
      await this.preMatch();

      // Round 1: SIEGE - Agent A attacks, Agent B defends
      await this.executeSiegeRound(this.agentA, this.agentB, 'SIEGE');

      // Round 2: DEFENSE - Agent B attacks, Agent A defends
      await this.executeSiegeRound(this.agentB, this.agentA, 'DEFENSE');

      // Round 3: COUNTER - Both attack simultaneously
      await this.executeCounterRound();

      // Final judgment
      const { scores, winner } = await this.judgeMatch();

      // Export molt file
      const moltPath = await this.exportResults(scores, winner);

      // Update match record
      await prisma.match.update({
        where: { id: this.matchId },
        data: {
          status: 'COMPLETED',
          winnerId: winner,
          moltFilePath: moltPath,
          scores: JSON.parse(JSON.stringify(scores)),
          endedAt: new Date(),
        },
      });

      // Update agent stats with proper ELO calculation
      await this.updateAgentStats(winner, scores);

      this.emit('match:end', {
        matchId: this.matchId,
        scores,
        winner,
        moltPath,
      });

      logger.info('Battle completed', {
        matchId: this.matchId,
        winner: winner || 'DRAW',
        duration: Date.now() - this.startTime,
      });
    } catch (error) {
      logger.error('Battle error', {
        matchId: this.matchId,
        error: (error as Error).message,
      });

      await prisma.match.update({
        where: { id: this.matchId },
        data: { status: 'CANCELLED' },
      });

      this.emit('match:error', {
        matchId: this.matchId,
        error: 'Battle encountered an error',
      });
    } finally {
      this.isRunning = false;
    }
  }

  private async preMatch(): Promise<void> {
    this.currentRound = 'PRE_MATCH';
    this.emitMetrics();

    // Log shield submissions
    const validationA = OpenClaw.validateShield(this.agentA.shield);
    const validationB = OpenClaw.validateShield(this.agentB.shield);

    this.emitEvent(
      this.logger.logShieldSubmission(
        this.agentA.id,
        this.agentA.shield.protocol,
        validationA.strength
      )
    );

    this.emitEvent(
      this.logger.logShieldSubmission(
        this.agentB.id,
        this.agentB.shield.protocol,
        validationB.strength
      )
    );

    // Apply validation penalties
    if (!validationA.valid) {
      const penalty = validationA.vulnerabilities.length * 5;
      this.agentA.health -= penalty;
      this.emitEvent(
        this.logger.log('PRE_MATCH', this.agentA.id, 'VULNERABILITY_PENALTY', {
          penalty,
          vulnerabilities: validationA.vulnerabilities,
        })
      );
    }

    if (!validationB.valid) {
      const penalty = validationB.vulnerabilities.length * 5;
      this.agentB.health -= penalty;
      this.emitEvent(
        this.logger.log('PRE_MATCH', this.agentB.id, 'VULNERABILITY_PENALTY', {
          penalty,
          vulnerabilities: validationB.vulnerabilities,
        })
      );
    }

    await this.delay(this.config.preMatchDelay);
  }

  private async executeSiegeRound(
    attacker: AgentState,
    defender: AgentState,
    roundType: 'SIEGE' | 'DEFENSE'
  ): Promise<void> {
    this.currentRound = roundType as MoltRound;
    this.emitMetrics();

    this.emitEvent(
      this.logger.log(roundType as MoltRound, attacker.id, 'ROUND_START', {
        attacker: attacker.id,
        defender: defender.id,
        attackerPower: attacker.attackPower,
        defenderStrength: defender.shield.strength,
      })
    );

    // Execute brute force simulation
    const result = OpenClaw.simulateBruteForce(attacker.attackPower, defender.shield, 5000);

    // Calculate damage with critical hit chance
    let damage = result.damageDealt;
    const criticalHit = Math.random() < 0.15; // 15% crit chance
    if (criticalHit) {
      damage *= 1.5;
      this.emitEvent(
        this.logger.log(roundType as MoltRound, attacker.id, 'CRITICAL_HIT', {
          baseDamage: result.damageDealt,
          finalDamage: damage,
        })
      );
    }

    // Apply damage
    defender.health -= damage;
    defender.integrity = OpenClaw.calculateIntegrity(defender.shield, damage);

    // Log attack
    this.emitEvent(
      this.logger.logAttack(
        roundType as MoltRound,
        attacker.id,
        defender.id,
        Math.round(damage),
        result.breached
      )
    );

    // Calculate speed score based on execution efficiency
    const speedBonus = Math.max(0, 30 - result.timeMs / 200);
    attacker.speed = Math.min(100, attacker.speed + speedBonus);

    // Defense bonus if shield held
    if (!result.breached) {
      this.emitEvent(
        this.logger.logDefense(roundType as MoltRound, defender.id, Math.round(damage * 0.3))
      );
    }

    // Emit updated metrics
    this.emitMetrics();

    await this.delay(this.config.roundDelay);
  }

  private async executeCounterRound(): Promise<void> {
    this.currentRound = 'COUNTER';
    this.emitMetrics();

    this.emitEvent(
      this.logger.log('COUNTER', 'SYSTEM', 'ROUND_START', {
        message: 'Simultaneous attack phase initiated',
      })
    );

    // Simulate parallel execution
    const [resultA, resultB] = await Promise.all([
      arenaSandbox.simulateExecution(
        this.agentA.id,
        this.agentA.attackPower,
        this.agentB.shield.strength
      ),
      arenaSandbox.simulateExecution(
        this.agentB.id,
        this.agentB.attackPower,
        this.agentA.shield.strength
      ),
    ]);

    // Calculate damage based on execution results
    const baseDamageA = resultA.success ? 20 : 5;
    const baseDamageB = resultB.success ? 20 : 5;

    // Speed modifier - faster execution = more damage
    const speedModA = 1 + (this.agentA.speed - 50) / 200;
    const speedModB = 1 + (this.agentB.speed - 50) / 200;

    const damageToB = Math.round(baseDamageA * speedModA);
    const damageToA = Math.round(baseDamageB * speedModB);

    // Apply mutual damage
    this.agentB.health -= damageToB;
    this.agentA.health -= damageToA;

    this.agentA.integrity = Math.max(0, this.agentA.integrity - damageToA);
    this.agentB.integrity = Math.max(0, this.agentB.integrity - damageToB);

    // Log attacks
    this.emitEvent(
      this.logger.logAttack('COUNTER', this.agentA.id, this.agentB.id, damageToB, resultA.success)
    );
    this.emitEvent(
      this.logger.logAttack('COUNTER', this.agentB.id, this.agentA.id, damageToA, resultB.success)
    );

    // Log integrity updates
    this.emitEvent(
      this.logger.logIntegrityUpdate(this.agentA.id, Math.round(this.agentA.integrity))
    );
    this.emitEvent(
      this.logger.logIntegrityUpdate(this.agentB.id, Math.round(this.agentB.integrity))
    );

    this.emitMetrics();

    await this.delay(this.config.roundDelay);
  }

  private async judgeMatch(): Promise<{ scores: BattleScores[]; winner: string | null }> {
    this.currentRound = 'JUDGMENT';
    this.emitMetrics();

    // Calculate comprehensive scores
    const scoreA: BattleScores = {
      agentId: this.agentA.id,
      encryption: Math.round(Math.max(0, this.agentA.integrity) * 0.4),
      attack: Math.round(Math.max(0, 100 - this.agentB.health) * 0.3),
      speed: Math.round(Math.min(100, this.agentA.speed) * 0.3),
      total: 0,
    };
    scoreA.total = scoreA.encryption + scoreA.attack + scoreA.speed;

    const scoreB: BattleScores = {
      agentId: this.agentB.id,
      encryption: Math.round(Math.max(0, this.agentB.integrity) * 0.4),
      attack: Math.round(Math.max(0, 100 - this.agentA.health) * 0.3),
      speed: Math.round(Math.min(100, this.agentB.speed) * 0.3),
      total: 0,
    };
    scoreB.total = scoreB.encryption + scoreB.attack + scoreB.speed;

    this.emitEvent(
      this.logger.log('JUDGMENT', 'JUDGE', 'SCORES_CALCULATED', {
        agentA: scoreA,
        agentB: scoreB,
      })
    );

    // Determine winner
    let winner: string | null = null;
    if (scoreA.total > scoreB.total) {
      winner = this.agentA.id;
    } else if (scoreB.total > scoreA.total) {
      winner = this.agentB.id;
    }

    this.emitEvent(
      this.logger.log('JUDGMENT', 'JUDGE', 'WINNER_DECLARED', {
        winner,
        isDraw: winner === null,
        scoreDifference: Math.abs(scoreA.total - scoreB.total),
      })
    );

    return { scores: [scoreA, scoreB], winner };
  }

  private async exportResults(scores: BattleScores[], winner: string | null): Promise<string> {
    const outputDir = join(process.cwd(), '..', 'molt-files');
    return await this.logger.exportToFile(outputDir, scores, winner);
  }

  private async updateAgentStats(
    winnerId: string | null,
    scores: BattleScores[]
  ): Promise<void> {
    // Get current agent data
    const [agentAData, agentBData] = await Promise.all([
      prisma.agent.findUnique({ where: { id: this.agentA.id } }),
      prisma.agent.findUnique({ where: { id: this.agentB.id } }),
    ]);

    if (!agentAData || !agentBData) {
      logger.error('Failed to fetch agents for ELO update', { matchId: this.matchId });
      return;
    }

    const gamesA = agentAData.wins + agentAData.losses;
    const gamesB = agentBData.wins + agentBData.losses;

    // Determine match outcome
    let outcome: 'A' | 'B' | 'DRAW';
    if (winnerId === this.agentA.id) {
      outcome = 'A';
    } else if (winnerId === this.agentB.id) {
      outcome = 'B';
    } else {
      outcome = 'DRAW';
    }

    // Calculate new ELO ratings
    const eloResult = eloSystem.calculateNewRatings(
      agentAData.eloRating,
      agentBData.eloRating,
      gamesA,
      gamesB,
      outcome
    );

    // Apply upset bonus if applicable
    let bonusA = 0;
    let bonusB = 0;
    if (outcome === 'A' && agentAData.eloRating < agentBData.eloRating) {
      bonusA = eloSystem.calculateUpsetBonus(agentAData.eloRating, agentBData.eloRating);
    } else if (outcome === 'B' && agentBData.eloRating < agentAData.eloRating) {
      bonusB = eloSystem.calculateUpsetBonus(agentBData.eloRating, agentAData.eloRating);
    }

    // Update agent A
    await prisma.agent.update({
      where: { id: this.agentA.id },
      data: {
        wins: outcome === 'A' ? { increment: 1 } : undefined,
        losses: outcome === 'B' ? { increment: 1 } : undefined,
        eloRating: eloResult.newRatingA + bonusA,
      },
    });

    // Update agent B
    await prisma.agent.update({
      where: { id: this.agentB.id },
      data: {
        wins: outcome === 'B' ? { increment: 1 } : undefined,
        losses: outcome === 'A' ? { increment: 1 } : undefined,
        eloRating: eloResult.newRatingB + bonusB,
      },
    });

    // Log ELO changes
    this.emitEvent(
      this.logger.log('JUDGMENT', 'SYSTEM', 'ELO_UPDATE', {
        agentA: {
          id: this.agentA.id,
          oldElo: agentAData.eloRating,
          newElo: eloResult.newRatingA + bonusA,
          change: eloResult.changeA + bonusA,
        },
        agentB: {
          id: this.agentB.id,
          oldElo: agentBData.eloRating,
          newElo: eloResult.newRatingB + bonusB,
          change: eloResult.changeB + bonusB,
        },
      })
    );

    logger.info('ELO updated', {
      matchId: this.matchId,
      agentA: { change: eloResult.changeA + bonusA },
      agentB: { change: eloResult.changeB + bonusB },
    });
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  stop(): void {
    this.isRunning = false;
    logger.info('Battle stopped', { matchId: this.matchId });
  }

  isActive(): boolean {
    return this.isRunning;
  }
}
