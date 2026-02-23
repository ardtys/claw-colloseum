import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const builtInBots = [
  { name: 'CryptoKnight', category: 'crypto', eloRating: 1450, wins: 23, losses: 12 },
  { name: 'ShadowByte', category: 'stealth', eloRating: 1380, wins: 18, losses: 14 },
  { name: 'IronShield', category: 'fortress', eloRating: 1520, wins: 31, losses: 9 },
  { name: 'NexusCore', category: 'balanced', eloRating: 1290, wins: 15, losses: 17 },
  { name: 'PhantomAES', category: 'crypto', eloRating: 1410, wins: 20, losses: 13 },
  { name: 'VaultBreaker', category: 'stealth', eloRating: 1350, wins: 16, losses: 15 },
  { name: 'Citadel', category: 'fortress', eloRating: 1480, wins: 27, losses: 11 },
  { name: 'QuantumNode', category: 'balanced', eloRating: 1320, wins: 14, losses: 16 },
];

const shieldConfigs = {
  crypto: {
    protocol: 'AES-256',
    publicKey: 'a'.repeat(128),
    challengeResponse: 'cr_' + 'x'.repeat(60),
    strength: 40,
  },
  stealth: {
    protocol: 'CHACHA20',
    publicKey: 'b'.repeat(128),
    challengeResponse: 'cr_' + 'y'.repeat(60),
    strength: 38,
  },
  fortress: {
    protocol: 'AES-256',
    publicKey: 'c'.repeat(128),
    challengeResponse: 'cr_' + 'z'.repeat(60),
    strength: 40,
  },
  balanced: {
    protocol: 'RSA-2048',
    publicKey: 'd'.repeat(128),
    challengeResponse: 'cr_' + 'w'.repeat(60),
    strength: 35,
  },
};

async function main() {
  console.log('Seeding database with built-in bots...');

  // Create agents
  const createdAgents: { id: string; name: string }[] = [];

  for (const bot of builtInBots) {
    const existing = await prisma.agent.findUnique({ where: { name: bot.name } });

    if (existing) {
      console.log(`Bot ${bot.name} already exists, skipping...`);
      createdAgents.push({ id: existing.id, name: existing.name });
      continue;
    }

    const agent = await prisma.agent.create({
      data: {
        name: bot.name,
        category: bot.category,
        eloRating: bot.eloRating,
        wins: bot.wins,
        losses: bot.losses,
        shieldConfig: shieldConfigs[bot.category as keyof typeof shieldConfigs],
      },
    });

    createdAgents.push({ id: agent.id, name: agent.name });
    console.log(`Created bot: ${bot.name} (ELO: ${bot.eloRating})`);
  }

  // Create some sample matches between bots
  console.log('Creating sample match history...');

  const matchCount = await prisma.match.count();
  if (matchCount === 0 && createdAgents.length >= 2) {
    const matchPairs = [
      { aIdx: 0, bIdx: 1, winner: 0 },
      { aIdx: 2, bIdx: 3, winner: 2 },
      { aIdx: 4, bIdx: 5, winner: 4 },
      { aIdx: 6, bIdx: 7, winner: 6 },
      { aIdx: 0, bIdx: 2, winner: 2 },
      { aIdx: 1, bIdx: 3, winner: 1 },
      { aIdx: 4, bIdx: 6, winner: 6 },
      { aIdx: 5, bIdx: 7, winner: 5 },
      { aIdx: 0, bIdx: 4, winner: 0 },
      { aIdx: 2, bIdx: 6, winner: 2 },
    ];

    for (const pair of matchPairs) {
      if (createdAgents[pair.aIdx] && createdAgents[pair.bIdx]) {
        const startTime = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000);
        const endTime = new Date(startTime.getTime() + Math.random() * 60000 + 30000);

        await prisma.match.create({
          data: {
            agentAId: createdAgents[pair.aIdx].id,
            agentBId: createdAgents[pair.bIdx].id,
            winnerId: createdAgents[pair.winner].id,
            status: 'COMPLETED',
            startedAt: startTime,
            endedAt: endTime,
            scores: {
              agentA: { defense: Math.floor(Math.random() * 30) + 10, attack: Math.floor(Math.random() * 30) + 10 },
              agentB: { defense: Math.floor(Math.random() * 30) + 10, attack: Math.floor(Math.random() * 30) + 10 },
            },
          },
        });

        console.log(`Created match: ${createdAgents[pair.aIdx].name} vs ${createdAgents[pair.bIdx].name}`);
      }
    }
  } else {
    console.log('Matches already exist, skipping match creation...');
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
