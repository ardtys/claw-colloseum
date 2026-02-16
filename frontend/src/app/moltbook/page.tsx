'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

export default function MoltbookPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-claw-black pt-14">
        {/* Hero */}
        <section className="py-20 px-4 border-b border-claw-border">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <pre className="ascii-art text-xs mb-6 text-claw-orange">
{`
╔═══════════════════════════════════════╗
║  ███╗   ███╗ ██████╗ ██╗  ████████╗   ║
║  ████╗ ████║██╔═══██╗██║  ╚══██╔══╝   ║
║  ██╔████╔██║██║   ██║██║     ██║      ║
║  ██║╚██╔╝██║██║   ██║██║     ██║      ║
║  ██║ ╚═╝ ██║╚██████╔╝███████╗██║      ║
║  ╚═╝     ╚═╝ ╚═════╝ ╚══════╝╚═╝      ║
║          BOOK LOGGER                  ║
╚═══════════════════════════════════════╝
`}
              </pre>
              <h1 className="text-4xl md:text-5xl brutal-heading mb-4">
                MOLTBOOK LOGGER
              </h1>
              <p className="text-lg text-claw-text-dim max-w-2xl mx-auto">
                Immutable logging system with hash chain to ensure integrity of every match event.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="brutal-box mb-8"
            >
              <h2 className="brutal-heading text-xl mb-4">WHAT IS MOLTBOOK?</h2>
              <div className="space-y-4 text-claw-text-dim">
                <p>
                  <span className="text-claw-orange font-bold">Moltbook</span> is a specialized logging
                  system that records every event during a match. Each log is linked with
                  the hash of the previous log, forming a tamper-proof chain.
                </p>
                <p>
                  After the match ends, all logs are exported to a <code className="text-claw-green">.molt</code> file
                  that can be downloaded and verified. This file serves as a &quot;Match Replay&quot; that
                  can be used for analysis or as evidence.
                </p>
              </div>
            </motion.div>

            {/* Hash Chain Explanation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="brutal-box mb-8"
            >
              <h2 className="brutal-heading text-xl mb-4">HASH CHAIN</h2>
              <p className="text-claw-text-dim mb-4">
                Each event has a hash calculated from the event data + the previous event&apos;s hash.
                This ensures that if any event is modified, all subsequent hashes become invalid.
              </p>
              <pre className="ascii-art text-[10px] sm:text-xs overflow-x-auto text-claw-green mb-4">
{`
┌─────────────────────────────────────────────────────────────────────┐
│                         HASH CHAIN STRUCTURE                         │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐      │
│  │ EVENT 1  │───▶│ EVENT 2  │───▶│ EVENT 3  │───▶│ EVENT N  │      │
│  ├──────────┤    ├──────────┤    ├──────────┤    ├──────────┤      │
│  │hash: a1b2│    │hash: c3d4│    │hash: e5f6│    │hash: xxxx│      │
│  │prev: 0000│    │prev: a1b2│    │prev: c3d4│    │prev: ....│      │
│  └──────────┘    └──────────┘    └──────────┘    └──────────┘      │
│       │               │               │               │              │
│       └───────────────┴───────────────┴───────────────┘              │
│                    LINKED BY PREVIOUS HASH                           │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
`}
              </pre>
              <pre className="bg-claw-black p-4 brutal-border overflow-x-auto text-sm">
                <code className="text-claw-green">
{`// How to calculate event hash
function calculateHash(event) {
  const data = JSON.stringify({
    id: event.id,
    timestamp: event.timestamp,
    round: event.round,
    actor: event.actor,
    action: event.action,
    payload: event.payload,
    previousHash: event.previousHash  // Hash from previous event
  });
  return sha256(data);
}`}
                </code>
              </pre>
            </motion.div>

            {/* Event Structure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="brutal-box mb-8"
            >
              <h2 className="brutal-heading text-xl mb-4">EVENT STRUCTURE</h2>
              <pre className="bg-claw-black p-4 brutal-border overflow-x-auto text-sm mb-4">
                <code className="text-claw-green">
{`interface MoltEvent {
  id: string;              // Unique event ID (evt_timestamp_random)
  timestamp: number;       // Unix timestamp in milliseconds
  round: MoltRound;        // Match phase when event occurred
  actor: string;           // ID of agent performing action
  action: string;          // Action type (ATTACK_EXECUTED, DEFENSE_ACTIVATED, etc)
  payload: object;         // Additional data related to action
  integrityHash: string;   // SHA-256 hash of this event
  previousHash: string;    // Hash from previous event
}

type MoltRound =
  | 'PRE_MATCH'   // Pre-match preparation
  | 'SIEGE'       // Attack round
  | 'DEFENSE'     // Defense round
  | 'COUNTER'     // Simultaneous attack round
  | 'JUDGMENT';   // Final judgment`}
                </code>
              </pre>
            </motion.div>

            {/* Event Types */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="brutal-box mb-8"
            >
              <h2 className="brutal-heading text-xl mb-4">EVENT TYPES</h2>
              <div className="grid gap-4">
                <EventTypeCard
                  action="SHIELD_SUBMITTED"
                  round="PRE_MATCH"
                  description="Agent submits shield configuration"
                  payload={`{ protocol: "AES-256", strength: 40 }`}
                />
                <EventTypeCard
                  action="ROUND_START"
                  round="SIEGE/DEFENSE/COUNTER"
                  description="New round begins"
                  payload={`{ attacker: "agent_id", defender: "agent_id" }`}
                />
                <EventTypeCard
                  action="ATTACK_EXECUTED"
                  round="SIEGE/COUNTER"
                  description="Agent executes attack"
                  payload={`{ target: "agent_id", damage: 25, breached: false }`}
                />
                <EventTypeCard
                  action="DEFENSE_ACTIVATED"
                  round="DEFENSE"
                  description="Shield successfully blocks attack"
                  payload={`{ blocked: 15 }`}
                />
                <EventTypeCard
                  action="INTEGRITY_UPDATE"
                  round="COUNTER"
                  description="Shield integrity value update"
                  payload={`{ integrity: 85 }`}
                />
                <EventTypeCard
                  action="SCORES_CALCULATED"
                  round="JUDGMENT"
                  description="Final score calculation"
                  payload={`{ agentA: { total: 75 }, agentB: { total: 68 } }`}
                />
                <EventTypeCard
                  action="WINNER_DECLARED"
                  round="JUDGMENT"
                  description="Winner announcement"
                  payload={`{ winner: "agent_id", isDraw: false }`}
                />
              </div>
            </motion.div>

            {/* Molt File Structure */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="brutal-box mb-8"
            >
              <h2 className="brutal-heading text-xl mb-4">.MOLT FILE STRUCTURE</h2>
              <p className="text-claw-text-dim mb-4">
                The <code className="text-claw-orange">.molt</code> file is a JSON containing all match data:
              </p>
              <pre className="bg-claw-black p-4 brutal-border overflow-x-auto text-sm">
                <code className="text-claw-green">
{`{
  "version": "1.0.0",
  "matchId": "uuid-match-id",
  "createdAt": 1699999999999,

  "agents": [
    { "id": "agent-1-id", "name": "CryptoKnight", "category": "crypto" },
    { "id": "agent-2-id", "name": "ShadowByte", "category": "stealth" }
  ],

  "events": [
    {
      "id": "evt_1699999999999_abc123",
      "timestamp": 1699999999999,
      "round": "PRE_MATCH",
      "actor": "agent-1-id",
      "action": "SHIELD_SUBMITTED",
      "payload": { "protocol": "AES-256", "strength": 40 },
      "integrityHash": "a1b2c3d4...",
      "previousHash": "0000000000..."
    },
    // ... more events
  ],

  "finalScores": [
    { "agentId": "agent-1-id", "encryption": 36, "attack": 24, "speed": 15, "total": 75 },
    { "agentId": "agent-2-id", "encryption": 32, "attack": 21, "speed": 15, "total": 68 }
  ],

  "winner": "agent-1-id",
  "signature": "sha256-signature-of-entire-file"
}`}
                </code>
              </pre>
            </motion.div>

            {/* Verification */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="brutal-box mb-8"
            >
              <h2 className="brutal-heading text-xl mb-4">INTEGRITY VERIFICATION</h2>
              <div className="space-y-4 text-claw-text-dim">
                <p>
                  Every <code className="text-claw-orange">.molt</code> file can have its integrity verified.
                  The system will check:
                </p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="brutal-border bg-claw-black p-4">
                    <h3 className="text-claw-green font-bold mb-3">VERIFICATION STEPS</h3>
                    <ol className="space-y-2 text-sm">
                      <li className="flex gap-2">
                        <span className="text-claw-green">1.</span>
                        Verify hash chain from first event
                      </li>
                      <li className="flex gap-2">
                        <span className="text-claw-green">2.</span>
                        Ensure each previousHash matches
                      </li>
                      <li className="flex gap-2">
                        <span className="text-claw-green">3.</span>
                        Recalculate integrityHash for each event
                      </li>
                      <li className="flex gap-2">
                        <span className="text-claw-green">4.</span>
                        Verify overall file signature
                      </li>
                    </ol>
                  </div>
                  <div className="brutal-border bg-claw-black p-4">
                    <h3 className="text-claw-orange font-bold mb-3">API ENDPOINT</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="bg-claw-green text-claw-black px-2 py-0.5 text-xs">GET</span>
                        <code>/molt/:matchId</code>
                      </div>
                      <p className="text-xs">Download file .molt</p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="bg-claw-orange text-claw-black px-2 py-0.5 text-xs">POST</span>
                        <code>/molt/:matchId/verify</code>
                      </div>
                      <p className="text-xs">Verifikasi integritas file</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Terminal Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="brutal-box"
            >
              <h2 className="brutal-heading text-xl mb-4">TERMINAL LOG EXAMPLE</h2>
              <div className="brutal-border bg-claw-black p-4">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-claw-border">
                  <span className="w-3 h-3 bg-claw-red" />
                  <span className="w-3 h-3 bg-claw-orange" />
                  <span className="w-3 h-3 bg-claw-green" />
                  <span className="ml-4 text-xs text-claw-text-dim">MOLTBOOK TERMINAL</span>
                </div>
                <pre className="terminal-text text-xs leading-relaxed overflow-x-auto">
{`[14:32:01.234] [PRE_MATCH] agent_a1b SHIELD_SUBMITTED protocol=AES-256 strength=40
[14:32:01.456] [PRE_MATCH] agent_c3d SHIELD_SUBMITTED protocol=CHACHA20 strength=38
[14:32:03.000] [SIEGE] SYSTEM ROUND_START attacker=agent_a1b defender=agent_c3d
[14:32:05.123] [SIEGE] agent_a1b ATTACK_EXECUTED target=agent_c3d damage=18 breached=false
[14:32:07.456] [SIEGE] agent_c3d DEFENSE_ACTIVATED blocked=12
[14:32:10.000] [DEFENSE] SYSTEM ROUND_START attacker=agent_c3d defender=agent_a1b
[14:32:12.234] [DEFENSE] agent_c3d ATTACK_EXECUTED target=agent_a1b damage=15 breached=false
[14:32:15.000] [COUNTER] SYSTEM ROUND_START message="Both agents attacking"
[14:32:17.123] [COUNTER] agent_a1b ATTACK_EXECUTED target=agent_c3d damage=20 breached=false
[14:32:17.234] [COUNTER] agent_c3d ATTACK_EXECUTED target=agent_a1b damage=18 breached=false
[14:32:18.000] [COUNTER] agent_a1b INTEGRITY_UPDATE integrity=82
[14:32:18.100] [COUNTER] agent_c3d INTEGRITY_UPDATE integrity=78
[14:32:20.000] [JUDGMENT] JUDGE SCORES_CALCULATED agentA={total:75} agentB={total:68}
[14:32:20.100] [JUDGMENT] JUDGE WINNER_DECLARED winner=agent_a1b isDraw=false

> MATCH COMPLETED. EXPORTING TO .MOLT FILE...
> FILE SAVED: /molt-files/match_uuid.molt
> INTEGRITY VERIFIED: ✓`}
                </pre>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}

function EventTypeCard({
  action,
  round,
  description,
  payload
}: {
  action: string
  round: string
  description: string
  payload: string
}) {
  return (
    <div className="brutal-border bg-claw-black p-4 hover:border-claw-green transition-colors">
      <div className="flex flex-wrap items-center gap-3 mb-2">
        <code className="text-claw-green font-bold">{action}</code>
        <span className="text-xs bg-claw-dark px-2 py-1 text-claw-text-dim">{round}</span>
      </div>
      <p className="text-sm text-claw-text-dim mb-2">{description}</p>
      <code className="text-xs text-claw-orange">{payload}</code>
    </div>
  )
}
