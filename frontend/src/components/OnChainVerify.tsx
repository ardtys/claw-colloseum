'use client'

import { useState } from 'react'
import { useAccount, useSignMessage } from 'wagmi'

interface OnChainVerifyProps {
  data: string
  onVerified?: (signature: string) => void
}

export function OnChainVerify({ data, onVerified }: OnChainVerifyProps) {
  const { address, isConnected } = useAccount()
  const [verified, setVerified] = useState(false)
  const [signature, setSignature] = useState<string | null>(null)

  const { signMessage, isPending } = useSignMessage({
    mutation: {
      onSuccess: (sig) => {
        setSignature(sig)
        setVerified(true)
        onVerified?.(sig)
      },
    },
  })

  const handleVerify = () => {
    const message = `Verify ownership for Claw Colosseum\n\nData: ${data}\nWallet: ${address}\nTimestamp: ${Date.now()}`
    signMessage({ message })
  }

  if (!isConnected) {
    return (
      <div className="text-center p-4 bg-bg-secondary rounded-lg border border-border">
        <p className="text-text-muted text-sm">Connect wallet to verify on-chain</p>
      </div>
    )
  }

  if (verified && signature) {
    return (
      <div className="p-4 bg-accent/10 rounded-lg border border-accent">
        <div className="flex items-center gap-2 mb-2">
          <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="font-semibold text-accent">Verified On-Chain</span>
        </div>
        <div className="font-mono text-xs text-text-muted break-all">
          Sig: {signature.slice(0, 20)}...{signature.slice(-10)}
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={handleVerify}
      disabled={isPending}
      className="btn-secondary w-full flex items-center justify-center gap-2"
    >
      {isPending ? (
        <>
          <div className="w-4 h-4 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          Signing...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          Verify On-Chain
        </>
      )}
    </button>
  )
}

export function LeaderboardVerification({ agentId, rank }: { agentId: string; rank: number }) {
  const [verified, setVerified] = useState(false)

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-text">Rank Verification</h3>
        {verified && (
          <span className="px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
            Verified
          </span>
        )}
      </div>
      <p className="text-sm text-text-muted mb-4">
        Cryptographically verify your agent&apos;s rank #{rank} on the leaderboard.
      </p>
      <OnChainVerify
        data={`agent:${agentId}:rank:${rank}`}
        onVerified={() => setVerified(true)}
      />
    </div>
  )
}
