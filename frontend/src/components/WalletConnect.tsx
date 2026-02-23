'use client'

import { useAccount, useConnect, useDisconnect, useSignMessage, Connector } from 'wagmi'
import { useState } from 'react'

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const [proof, setProof] = useState<string | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)

  const handleGenerateProof = async () => {
    if (!address) return

    const message = `Claw Colosseum Verification\n\nWallet: ${address}\nTimestamp: ${Date.now()}\n\nSign to verify ownership of this wallet.`

    try {
      const signature = await signMessageAsync({ message })
      setProof(signature)
    } catch (error) {
      console.error('Failed to sign message:', error)
    }
  }

  const truncateAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  if (isConnected && address) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowDropdown(!showDropdown)}
          className="flex items-center gap-2 px-3 py-2 bg-bg-secondary border border-border rounded-lg hover:border-accent transition-colors"
        >
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-sm font-mono text-text">{truncateAddress(address)}</span>
          <svg className="w-4 h-4 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-72 bg-bg-secondary border border-border rounded-lg shadow-lg z-50">
            <div className="p-4 border-b border-border">
              <div className="text-xs text-text-muted mb-1">Connected Wallet</div>
              <div className="font-mono text-sm text-text break-all">{address}</div>
              {chain && (
                <div className="text-xs text-accent mt-1">{chain.name}</div>
              )}
            </div>

            <div className="p-4 border-b border-border">
              <button
                onClick={handleGenerateProof}
                className="w-full py-2 px-3 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dim transition-colors"
              >
                Generate On-Chain Proof
              </button>
              {proof && (
                <div className="mt-3">
                  <div className="text-xs text-text-muted mb-1">Signature Proof</div>
                  <div className="bg-bg rounded p-2 font-mono text-xs text-accent break-all max-h-20 overflow-y-auto">
                    {proof}
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-xs text-accent">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Verified ownership
                  </div>
                </div>
              )}
            </div>

            <div className="p-3">
              <button
                onClick={() => {
                  disconnect()
                  setShowDropdown(false)
                  setProof(null)
                }}
                className="w-full py-2 px-3 text-sm text-text-secondary hover:text-text transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isPending}
        className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dim transition-colors disabled:opacity-50"
      >
        {isPending ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            Connect Wallet
          </>
        )}
      </button>

      {showDropdown && !isPending && (
        <div className="absolute right-0 mt-2 w-64 bg-bg-secondary border border-border rounded-lg shadow-lg z-50">
          <div className="p-3 border-b border-border">
            <div className="text-sm font-medium text-text">Connect Wallet</div>
            <div className="text-xs text-text-muted">Choose your wallet provider</div>
          </div>
          <div className="p-2">
            {connectors.map((connector) => (
              <button
                key={connector.uid}
                onClick={() => {
                  connect({ connector })
                  setShowDropdown(false)
                }}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-bg-tertiary transition-colors text-left"
              >
                <div className="w-8 h-8 bg-accent/20 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div>
                  <div className="text-sm font-medium text-text">{connector.name}</div>
                  <div className="text-xs text-text-muted">Connect with {connector.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
