'use client'

export function ContractAddress() {
  return (
    <section className="max-w-5xl mx-auto px-4 py-8">
      <div className="bg-bg-secondary border border-border rounded-xl p-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/20 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <div>
              <div className="text-xs text-text-muted uppercase tracking-wide">Contract Address (CA)</div>
              <div className="font-mono text-sm text-text-muted">TBA - Coming Soon</div>
            </div>
          </div>
          <div className="px-4 py-2 text-sm rounded-lg bg-bg-tertiary text-text-muted">
            Stay Tuned
          </div>
        </div>
      </div>
    </section>
  )
}
