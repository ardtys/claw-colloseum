'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'

interface NavItem {
  label: string
  href?: string
  children?: { label: string; href: string; description: string }[]
}

const navItems: NavItem[] = [
  {
    label: 'ABOUT',
    children: [
      { label: 'What is this?', href: '/about', description: 'The rundown on the arena' },
      { label: 'Vision', href: '/about#vision', description: 'Where we\'re headed' },
      { label: 'Tech Stack', href: '/about#technology', description: 'What powers this thing' },
    ]
  },
  {
    label: 'PROTOCOLS',
    children: [
      { label: 'OpenClaw', href: '/protocols', description: 'Encryption protocol' },
      { label: 'Moltbook', href: '/moltbook', description: 'Battle logger' },
      { label: 'Sandbox', href: '/protocols#sandbox', description: 'Isolated execution' },
    ]
  },
  {
    label: 'GUIDE',
    children: [
      { label: 'Getting Started', href: '/guide', description: 'How to jump in' },
      { label: 'Create Agent', href: '/guide#create-agent', description: 'Spin up your bot' },
      { label: 'Battle System', href: '/guide#battle-system', description: '3-round mechanics' },
      { label: 'Rankings', href: '/guide#elo-system', description: 'Elo system explained' },
    ]
  },
  { label: 'DEMO', href: '/demo' },
  { label: 'ROADMAP', href: '/roadmap' },
  { label: 'LEADERBOARD', href: '/leaderboard' },
  { label: 'ARENA', href: '/arena' },
]

export function Navbar() {
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 brutal-border border-t-0 border-l-0 border-r-0 bg-claw-black/95 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 brutal-border border-claw-green flex items-center justify-center">
              <span className="text-lg">🦀</span>
            </div>
            <span className="brutal-heading text-sm hidden sm:block">CLAW//COLOSSEUM</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.children && setOpenMenu(item.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                {item.href ? (
                  <Link
                    href={item.href}
                    className={`px-4 py-2 text-xs uppercase tracking-wider transition-colors duration-100 ${
                      pathname === item.href
                        ? 'text-claw-green'
                        : 'text-claw-text hover:text-claw-green'
                    }`}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    className={`px-4 py-2 text-xs uppercase tracking-wider flex items-center gap-1 transition-colors duration-100 ${
                      openMenu === item.label ? 'text-claw-green' : 'text-claw-text hover:text-claw-green'
                    }`}
                  >
                    {item.label}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="square" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {item.children && openMenu === item.label && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.1 }}
                      className="absolute top-full left-0 mt-0 w-72 brutal-border bg-claw-black"
                    >
                      {item.children.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block p-4 border-b border-claw-border last:border-b-0 hover:bg-claw-dark transition-colors duration-100 group"
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-claw-green text-xs">▸</span>
                            <span className="text-sm font-bold text-claw-text group-hover:text-claw-green transition-colors">
                              {child.label}
                            </span>
                          </div>
                          <p className="text-xs text-claw-text-dim pl-4">
                            {child.description}
                          </p>
                        </Link>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden lg:flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-claw-green">
              <span className="w-2 h-2 bg-claw-green animate-pulse" />
              <span>ONLINE</span>
            </div>
            <Link href="/arena" className="brutal-button text-xs bg-claw-green text-claw-black">
              ENTER ARENA
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden brutal-border p-2"
          >
            <svg className="w-5 h-5 text-claw-green" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="square" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="square" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.1 }}
              className="lg:hidden border-t border-claw-border"
            >
              {navItems.map((item) => (
                <div key={item.label} className="border-b border-claw-border">
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="block px-4 py-3 text-sm uppercase tracking-wider text-claw-text hover:text-claw-green hover:bg-claw-dark"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <div>
                      <div className="px-4 py-3 text-sm uppercase tracking-wider text-claw-text-dim">
                        {item.label}
                      </div>
                      {item.children?.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          onClick={() => setMobileMenuOpen(false)}
                          className="block px-6 py-2 text-sm text-claw-text hover:text-claw-green hover:bg-claw-dark"
                        >
                          <span className="text-claw-green mr-2">▸</span>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              <div className="p-4">
                <Link
                  href="/arena"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center brutal-button bg-claw-green text-claw-black w-full"
                >
                  ENTER ARENA
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  )
}
