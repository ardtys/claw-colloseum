import { Server, Socket } from 'socket.io';
import { ClawShield, OpenClaw } from '../claw-protocols/shield.js';
import { MoltbookLogger, MoltRound } from '../molt-adapter/logger.js';
import { arenaSandbox } from '../docker/sandbox.js';
import { prisma } from '../index.js';
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

export class BattleEngine {
  private io: Server;
  private matchId: string;
  private agentA: AgentState;
  private agentB: AgentState;
  private logger: MoltbookLogger;
  private currentRound: MoltRound = 'PRE_MATCH';
  private isRunning: boolean = false;

  constructor(io: Server, matchId: string, agentA: AgentState, agentB: AgentState) {
    this.io = io;
    this.matchId = matchId;
    this.agentA = agentA;
    this.agentB = agentB;
    this.logger = new MoltbookLogger(matchId);
    this.logger.setAgents([
      { id: agentA.id, name: agentA.name, category: agentA.category },
      { id: agentB.id, name: agentB.name, category: agentB.category }
    ]);
  }

  private emit(event: string, data: unknown): void {
    this.io.to(this.matchId).emit(event, data);
  }

  private emitMetrics(): void {
    const metrics: BattleMetrics = {
      agentA: {
        health: this.agentA.health,
        integrity: this.agentA.integrity,
        speed: this.agentA.speed
      },
      agentB: {
        health: this.agentB.health,
        integrity: this.agentB.integrity,
        speed: this.agentB.speed
      },
      round: this.currentRound,
      timeRemaining: 60
    };
    this.emit('match:metrics', metrics);
  }

  private emitEvent(moltEvent: ReturnType<typeof this.logger.log>): void {
    this.emit('match:event', moltEvent);
  }

  async start(): Promise<void> {
    this.isRunning = true;

    // Update match status
    await prisma.match.update({
      where: { id: this.matchId },
      data: { status: 'IN_PROGRESS', startedAt: new Date() }
    });

    this.emit('match:start', {
      matchId: this.matchId,
      agentA: { id: this.agentA.id, name: this.agentA.name },
      agentB: { id: this.agentB.id, name: this.agentB.name }
    });

    // Pre-match shield validation
    await this.preMatch();

    // Round 1: SIEGE - Agent A attacks, Agent B defends
    await this.executeSiegeRound(this.agentA, this.agentB);

    // Round 2: DEFENSE - Agent B attacks, Agent A defends
    await this.executeSiegeRound(this.agentB, this.agentA);

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
        scores: scores,
        endedAt: new Date()
      }
    });

    // Update agent stats
    await this.updateAgentStats(winner);

    this.emit('match:end', {
      matchId: this.matchId,
      scores,
      winner,
      moltPath
    });

    this.isRunning = false;
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
      this.agentA.health -= validationA.vulnerabilities.length * 5;
    }
    if (!validationB.valid) {
      this.agentB.health -= validationB.vulnerabilities.length * 5;
    }

    await this.delay(2000);
  }

  private async executeSiegeRound(attacker: AgentState, defender: AgentState): Promise<void> {
    this.currentRound = 'SIEGE';
    this.emitMetrics();

    this.emitEvent(
      this.logger.log('SIEGE', attacker.id, 'ROUND_START', {
        attacker: attacker.id,
        defender: defender.id
      })
    );

    // Execute brute force simulation
    const result = OpenClaw.simulateBruteForce(
      attacker.attackPower,
      defender.shield,
      5000
    );

    // Apply damage
    defender.health -= result.damageDealt;
    defender.integrity = OpenClaw.calculateIntegrity(defender.shield, result.damageDealt);

    // Log attack
    this.emitEvent(
      this.logger.logAttack('SIEGE', attacker.id, defender.id, result.damageDealt, result.breached)
    );

    // Calculate speed score based on attempts
    const speedBonus = Math.max(0, 30 - (result.timeMs / 200));
    attacker.speed = Math.min(100, attacker.speed + speedBonus);

    // Emit updated metrics
    this.emitMetrics();

    await this.delay(3000);
  }

  private async executeCounterRound(): Promise<void> {
    this.currentRound = 'COUNTER';
    this.emitMetrics();

    this.emitEvent(
      this.logger.log('COUNTER', 'SYSTEM', 'ROUND_START', {
        message: 'Both agents attacking simultaneously'
      })
    );

    // Simulate parallel execution
    const [resultA, resultB] = await Promise.all([
      arenaSandbox.simulateExecution(this.agentA.id, this.agentA.attackPower, this.agentB.shield.strength),
      arenaSandbox.simulateExecution(this.agentB.id, this.agentB.attackPower, this.agentA.shield.strength)
    ]);

    // Apply mutual damage
    const damageToB = resultA.success ? 20 : 5;
    const damageToA = resultB.success ? 20 : 5;

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
    this.emitEvent(this.logger.logIntegrityUpdate(this.agentA.id, this.agentA.integrity));
    this.emitEvent(this.logger.logIntegrityUpdate(this.agentB.id, this.agentB.integrity));

    this.emitMetrics();

    await this.delay(3000);
  }

  private async judgeMatch(): Promise<{ scores: BattleScores[]; winner: string | null }> {
    this.currentRound = 'JUDGMENT';
    this.emitMetrics();

    const scoreA: BattleScores = {
      agentId: this.agentA.id,
      encryption: Math.round(this.agentA.integrity * 0.4),
      attack: Math.round((100 - this.agentB.health) * 0.3),
      speed: Math.round(this.agentA.speed * 0.3),
      total: 0
    };
    scoreA.total = scoreA.encryption + scoreA.attack + scoreA.speed;

    const scoreB: BattleScores = {
      agentId: this.agentB.id,
      encryption: Math.round(this.agentB.integrity * 0.4),
      attack: Math.round((100 - this.agentA.health) * 0.3),
      speed: Math.round(this.agentB.speed * 0.3),
      total: 0
    };
    scoreB.total = scoreB.encryption + scoreB.attack + scoreB.speed;

    this.emitEvent(
      this.logger.log('JUDGMENT', 'JUDGE', 'SCORES_CALCULATED', {
        agentA: scoreA,
        agentB: scoreB
      })
    );

    let winner: string | null = null;
    if (scoreA.total > scoreB.total) {
      winner = this.agentA.id;
    } else if (scoreB.total > scoreA.total) {
      winner = this.agentB.id;
    }

    this.emitEvent(
      this.logger.log('JUDGMENT', 'JUDGE', 'WINNER_DECLARED', {
        winner,
        isDraw: winner === null
      })
    );

    return { scores: [scoreA, scoreB], winner };
  }

  private async exportResults(scores: BattleScores[], winner: string | null): Promise<string> {
    const outputDir = join(process.cwd(), '..', 'molt-files');
    return await this.logger.exportToFile(outputDir, scores, winner);
  }

  private async updateAgentStats(winnerId: string | null): Promise<void> {
    const eloChange = 32; // K-factor

    if (winnerId === this.agentA.id) {
      await prisma.agent.update({
        where: { id: this.agentA.id },
        data: { wins: { increment: 1 }, eloRating: { increment: eloChange } }
      });
      await prisma.agent.update({
        where: { id: this.agentB.id },
        data: { losses: { increment: 1 }, eloRating: { decrement: eloChange } }
      });
    } else if (winnerId === this.agentB.id) {
      await prisma.agent.update({
        where: { id: this.agentB.id },
        data: { wins: { increment: 1 }, eloRating: { increment: eloChange } }
      });
      await prisma.agent.update({
        where: { id: this.agentA.id },
        data: { losses: { increment: 1 }, eloRating: { decrement: eloChange } }
      });
    }
    // On draw, no Elo change
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  stop(): void {
    this.isRunning = false;
  }
}
