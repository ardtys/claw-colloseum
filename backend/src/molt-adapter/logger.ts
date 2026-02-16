import { createHash } from 'crypto';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

export type MoltRound = 'PRE_MATCH' | 'SIEGE' | 'DEFENSE' | 'COUNTER' | 'JUDGMENT';

export interface MoltEvent {
  id: string;
  timestamp: number;
  round: MoltRound;
  actor: string;
  action: string;
  payload: Record<string, unknown>;
  integrityHash: string;
  previousHash: string;
}

export interface MoltFile {
  version: string;
  matchId: string;
  createdAt: number;
  agents: {
    id: string;
    name: string;
    category: string;
  }[];
  events: MoltEvent[];
  finalScores: {
    agentId: string;
    encryption: number;
    attack: number;
    speed: number;
    total: number;
  }[];
  winner: string | null;
  signature: string;
}

export class MoltbookLogger {
  private events: MoltEvent[] = [];
  private matchId: string;
  private agents: { id: string; name: string; category: string }[] = [];
  private previousHash: string = '0'.repeat(64);

  constructor(matchId: string) {
    this.matchId = matchId;
  }

  setAgents(agents: { id: string; name: string; category: string }[]): void {
    this.agents = agents;
  }

  private generateEventId(): string {
    return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  }

  private calculateHash(event: Omit<MoltEvent, 'integrityHash'>): string {
    const data = JSON.stringify({
      id: event.id,
      timestamp: event.timestamp,
      round: event.round,
      actor: event.actor,
      action: event.action,
      payload: event.payload,
      previousHash: event.previousHash
    });
    return createHash('sha256').update(data).digest('hex');
  }

  log(
    round: MoltRound,
    actor: string,
    action: string,
    payload: Record<string, unknown> = {}
  ): MoltEvent {
    const partialEvent = {
      id: this.generateEventId(),
      timestamp: Date.now(),
      round,
      actor,
      action,
      payload,
      previousHash: this.previousHash
    };

    const event: MoltEvent = {
      ...partialEvent,
      integrityHash: this.calculateHash(partialEvent)
    };

    this.events.push(event);
    this.previousHash = event.integrityHash;

    return event;
  }

  logShieldSubmission(agentId: string, protocol: string, strength: number): MoltEvent {
    return this.log('PRE_MATCH', agentId, 'SHIELD_SUBMITTED', {
      protocol,
      strength
    });
  }

  logAttack(
    round: MoltRound,
    attackerId: string,
    defenderId: string,
    damage: number,
    breached: boolean
  ): MoltEvent {
    return this.log(round, attackerId, 'ATTACK_EXECUTED', {
      target: defenderId,
      damage,
      breached
    });
  }

  logDefense(round: MoltRound, defenderId: string, blocked: number): MoltEvent {
    return this.log(round, defenderId, 'DEFENSE_ACTIVATED', {
      blocked
    });
  }

  logIntegrityUpdate(agentId: string, integrity: number): MoltEvent {
    return this.log('COUNTER', agentId, 'INTEGRITY_UPDATE', {
      integrity
    });
  }

  getEvents(): MoltEvent[] {
    return [...this.events];
  }

  verifyChain(): boolean {
    let expectedPreviousHash = '0'.repeat(64);

    for (const event of this.events) {
      if (event.previousHash !== expectedPreviousHash) {
        return false;
      }

      const calculatedHash = this.calculateHash({
        id: event.id,
        timestamp: event.timestamp,
        round: event.round,
        actor: event.actor,
        action: event.action,
        payload: event.payload,
        previousHash: event.previousHash
      });

      if (calculatedHash !== event.integrityHash) {
        return false;
      }

      expectedPreviousHash = event.integrityHash;
    }

    return true;
  }

  async exportToFile(
    outputDir: string,
    scores: { agentId: string; encryption: number; attack: number; speed: number; total: number }[],
    winner: string | null
  ): Promise<string> {
    const moltFile: MoltFile = {
      version: '1.0.0',
      matchId: this.matchId,
      createdAt: Date.now(),
      agents: this.agents,
      events: this.events,
      finalScores: scores,
      winner,
      signature: this.generateSignature(scores, winner)
    };

    await mkdir(outputDir, { recursive: true });
    const filePath = join(outputDir, `${this.matchId}.molt`);
    await writeFile(filePath, JSON.stringify(moltFile, null, 2));

    return filePath;
  }

  private generateSignature(
    scores: { agentId: string; total: number }[],
    winner: string | null
  ): string {
    const data = JSON.stringify({
      matchId: this.matchId,
      eventCount: this.events.length,
      lastHash: this.previousHash,
      scores,
      winner
    });
    return createHash('sha256').update(data).digest('hex');
  }

  static async loadFromFile(filePath: string): Promise<MoltFile> {
    const { readFile } = await import('fs/promises');
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content) as MoltFile;
  }

  static verifyMoltFile(moltFile: MoltFile): boolean {
    const logger = new MoltbookLogger(moltFile.matchId);
    logger.events = moltFile.events;

    if (!logger.verifyChain()) {
      return false;
    }

    const expectedSignature = createHash('sha256')
      .update(
        JSON.stringify({
          matchId: moltFile.matchId,
          eventCount: moltFile.events.length,
          lastHash: moltFile.events[moltFile.events.length - 1]?.integrityHash || '0'.repeat(64),
          scores: moltFile.finalScores.map(s => ({ agentId: s.agentId, total: s.total })),
          winner: moltFile.winner
        })
      )
      .digest('hex');

    return expectedSignature === moltFile.signature;
  }
}
