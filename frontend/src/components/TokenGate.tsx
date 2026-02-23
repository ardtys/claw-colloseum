'use client'

import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'

interface TokenGateProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function TokenGate({ children, fallback }: TokenGateProps) {
  const { address, isConnected } = useAccount()
  const [isHolder, setIsHolder] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkTokenHolding = async () => {
      if (!isConnected || !address) {
        setIsHolder(false)
        setChecking(false)
        return
      }

      // For now, allow all connected wallets
      // In production, you would check token balance here
      // Example: const balance = await tokenContract.balanceOf(address)
      setIsHolder(true)
      setChecking(false)
    }

    checkTokenHolding()
  }, [address, isConnected])

  if (checking) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!isConnected) {
    return fallback || (
      <div className="card text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h3 className="text-lg font-bold text-text mb-2">Connect Wallet</h3>
        <p className="text-text-muted text-sm">
          Connect your wallet to access exclusive features
        </p>
      </div>
    )
  }

  if (!isHolder) {
    return fallback || (
      <div className="card text-center">
        <div className="text-4xl mb-4">🎟️</div>
        <h3 className="text-lg font-bold text-text mb-2">Token Required</h3>
        <p className="text-text-muted text-sm mb-4">
          You need to hold CLAW tokens to access this feature
        </p>
        <a
          href="#"
          className="btn-primary inline-block"
        >
          Get CLAW Tokens
        </a>
      </div>
    )
  }

  return <>{children}</>
}

export function TokenGatedBadge() {
  const { isConnected } = useAccount()

  if (!isConnected) return null

  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 bg-accent/20 text-accent text-xs rounded-full">
      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
      </svg>
      Token Holder
    </span>
  )
}
