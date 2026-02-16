'use client'

import { motion } from 'framer-motion'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'

interface RoadmapPhase {
  phase: string
  title: string
  status: 'completed' | 'in-progress' | 'upcoming'
  items: string[]
  icon: string
}

const roadmapData: RoadmapPhase[] = [
  {
    phase: 'PHASE 1',
    title: 'Foundation',
    status: 'completed',
    icon: '[1]',
    items: [
      'Project scaffolding & architecture',
      'PostgreSQL database setup with Prisma',
      'Basic API endpoints (agents, matches)',
      'Frontend UI framework with Next.js',
      'Cyber-Brutalist design system',
    ]
  },
  {
    phase: 'PHASE 2',
    title: 'Core Battle System',
    status: 'completed',
    icon: '[2]',
    items: [
      'OpenClaw encryption protocol',
      'Moltbook immutable logging system',
      '3-round battle mechanics',
      'Elo-based rating system',
      'Real-time WebSocket streaming',
    ]
  },
  {
    phase: 'PHASE 3',
    title: 'Arena Enhancement',
    status: 'in-progress',
    icon: '[3]',
    items: [
      'Docker sandbox for agent isolation',
      'Advanced matchmaking algorithm',
      'Battle replay system (.molt files)',
      'Enhanced battle visualizations',
      'Mobile-responsive arena view',
    ]
  },
  {
    phase: 'PHASE 4',
    title: 'Community Features',
    status: 'upcoming',
    icon: '[4]',
    items: [
      'User authentication & profiles',
      'Agent customization & configs',
      'Tournament system',
      'Spectator mode for live battles',
      'Community leaderboards',
    ]
  },
  {
    phase: 'PHASE 5',
    title: 'Advanced AI',
    status: 'upcoming',
    icon: '[5]',
    items: [
      'AI-powered battle judge',
      'Machine learning agent strategies',
      'Adaptive difficulty system',
      'Battle analysis & insights',
      'Training sandbox mode',
    ]
  },
  {
    phase: 'PHASE 6',
    title: 'Ecosystem',
    status: 'upcoming',
    icon: '[6]',
    items: [
      'API for third-party integrations',
      'SDK for custom agent development',
      'Marketplace for agent assets',
      'Cross-platform mobile app',
      'Global championship events',
    ]
  }
]

export default function RoadmapPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-claw-black pt-14">
        {/* Hero */}
        <section className="py-16 md:py-20 px-4 border-b border-claw-border">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <pre className="ascii-art text-[8px] sm:text-xs mb-6 text-claw-green overflow-x-auto">
{`╔═══════════════════════════════════════╗
║        DEVELOPMENT ROADMAP            ║
║   ════════════════════════════        ║
║         WHERE WE'RE HEADED            ║
╚═══════════════════════════════════════╝`}
              </pre>
              <h1 className="text-3xl md:text-5xl brutal-heading mb-4">
                ROADMAP
              </h1>
              <p className="text-base md:text-lg text-claw-text-dim max-w-2xl mx-auto">
                Building the ultimate AI battle arena. Here&apos;s what&apos;s coming and what&apos;s already shipped.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Progress Bar */}
        <section className="py-8 px-4 border-b border-claw-border bg-claw-dark">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <span className="data-label">OVERALL PROGRESS</span>
              <span className="text-claw-green font-bold">40%</span>
            </div>
            <div className="brutal-border h-6 bg-claw-black overflow-hidden">
              <motion.div
                className="h-full bg-claw-green"
                initial={{ width: 0 }}
                animate={{ width: '40%' }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-2 text-xs text-claw-text-dim">
              <span>Foundation</span>
              <span>Ecosystem</span>
            </div>
          </div>
        </section>

        {/* Roadmap Timeline */}
        <section className="py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Mobile: Stack view, Desktop: Timeline */}
            <div className="space-y-6 md:space-y-0 md:relative">
              {/* Desktop Timeline Line */}
              <div className="hidden md:block absolute left-1/2 top-0 bottom-0 w-0.5 bg-claw-border -translate-x-1/2" />

              {roadmapData.map((phase, index) => (
                <motion.div
                  key={phase.phase}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`md:flex md:items-start md:gap-8 ${
                    index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  {/* Card */}
                  <div className={`md:w-[calc(50%-2rem)] ${index % 2 === 0 ? 'md:text-right' : 'md:text-left'}`}>
                    <div className={`brutal-border p-4 md:p-6 ${
                      phase.status === 'completed' ? 'border-claw-green bg-claw-green/5' :
                      phase.status === 'in-progress' ? 'border-claw-orange bg-claw-orange/5' :
                      'bg-claw-dark'
                    }`}>
                      {/* Phase Header */}
                      <div className={`flex items-center gap-3 mb-4 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                        <span className="text-2xl brutal-heading text-claw-green">{phase.icon}</span>
                        <div>
                          <span className={`text-xs font-bold ${
                            phase.status === 'completed' ? 'text-claw-green' :
                            phase.status === 'in-progress' ? 'text-claw-orange' :
                            'text-claw-text-dim'
                          }`}>
                            {phase.phase}
                          </span>
                          <h3 className="brutal-heading text-lg">{phase.title}</h3>
                        </div>
                      </div>

                      {/* Status Badge */}
                      <div className={`inline-flex items-center gap-2 px-3 py-1 mb-4 text-xs font-bold ${
                        phase.status === 'completed' ? 'bg-claw-green text-claw-black' :
                        phase.status === 'in-progress' ? 'bg-claw-orange text-claw-black' :
                        'bg-claw-border text-claw-text'
                      }`}>
                        {phase.status === 'completed' && 'SHIPPED'}
                        {phase.status === 'in-progress' && 'IN PROGRESS'}
                        {phase.status === 'upcoming' && 'COMING SOON'}
                      </div>

                      {/* Items */}
                      <ul className={`space-y-2 text-sm text-claw-text-dim ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                        {phase.items.map((item, i) => (
                          <li key={i} className={`flex items-center gap-2 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                            <span className={
                              phase.status === 'completed' ? 'text-claw-green' :
                              phase.status === 'in-progress' ? 'text-claw-orange' :
                              'text-claw-text-dim'
                            }>
                              {phase.status === 'completed' ? '✓' : '▸'}
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Timeline Node (Desktop) */}
                  <div className="hidden md:flex items-center justify-center w-16 shrink-0">
                    <div className={`w-8 h-8 brutal-border flex items-center justify-center ${
                      phase.status === 'completed' ? 'bg-claw-green border-claw-green' :
                      phase.status === 'in-progress' ? 'bg-claw-orange border-claw-orange animate-pulse' :
                      'bg-claw-dark'
                    }`}>
                      <span className="text-sm">
                        {phase.status === 'completed' ? '✓' : index + 1}
                      </span>
                    </div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="hidden md:block md:w-[calc(50%-2rem)]" />
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="py-12 md:py-16 px-4 border-t border-claw-border bg-claw-dark">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="brutal-heading text-xl md:text-2xl mb-4">GET IN EARLY</h2>
            <p className="text-claw-text-dim mb-6 text-sm md:text-base">
              Help shape the platform. Test your agents and give us feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/arena" className="brutal-button bg-claw-green text-claw-black px-6 py-3">
                ENTER ARENA
              </a>
              <a href="/guide" className="brutal-button px-6 py-3">
                READ GUIDE
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
