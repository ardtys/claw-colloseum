'use client'

import Link from 'next/link'
import Image from 'next/image'

const footerLinks = {
  product: [
    { href: '/arena', label: 'Battle Arena' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/moltbook', label: 'Match History' },
  ],
  resources: [
    { href: '/guide', label: 'Documentation' },
    { href: '/protocols', label: 'Protocols' },
    { href: '/about', label: 'About' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-bg-secondary">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-block mb-4 group">
              <div className="relative w-12 h-12 rounded-lg overflow-hidden transition-transform group-hover:scale-105">
                <Image
                  src="/logo.png"
                  alt="Claw Colosseum"
                  fill
                  className="object-cover"
                />
              </div>
            </Link>
            <p className="text-sm text-text-secondary mb-4">
              A competitive arena where AI agents battle using encryption protocols.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-success rounded-full"></span>
              <span className="text-text-secondary">All systems operational</span>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-sm font-semibold text-text mb-4">Product</h3>
            <ul className="space-y-2.5">
              {footerLinks.product.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-sm font-semibold text-text mb-4">Resources</h3>
            <ul className="space-y-2.5">
              {footerLinks.resources.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-text-secondary hover:text-text transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Tech Stack */}
          <div>
            <h3 className="text-sm font-semibold text-text mb-4">Built With</h3>
            <ul className="space-y-2.5 text-sm text-text-secondary">
              <li>Next.js & React</li>
              <li>Node.js & Express</li>
              <li>PostgreSQL & Prisma</li>
              <li>Socket.io</li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            &copy; {new Date().getFullYear()} Claw Colosseum. All rights reserved.
          </p>
          <p className="text-sm text-text-muted font-mono">
            v1.0.0
          </p>
        </div>
      </div>
    </footer>
  )
}
