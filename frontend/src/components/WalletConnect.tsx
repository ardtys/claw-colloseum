'use client'

import { useAccount, useConnect, useDisconnect, useSignMessage, useSwitchChain } from 'wagmi'
import { useState, useEffect } from 'react'

const walletIcons: Record<string, string> = {
  'MetaMask': '🦊',
  'Coinbase Wallet': '💰',
  'WalletConnect': '🔗',
  'Injected': '💉',
}

const networkLogos: Record<number, { name: string; color: string }> = {
  1: { name: 'Ethereum', color: '#627EEA' },
  137: { name: 'Polygon', color: '#8247E5' },
  42161: { name: 'Arbitrum', color: '#28A0F0' },
  10: { name: 'Optimism', color: '#FF0420' },
  8453: { name: 'Base', color: '#0052FF' },
  56: { name: 'BNB Chain', color: '#F3BA2F' },
  11155111: { name: 'Sepolia', color: '#CFB5F0' },
}

export function WalletConnect() {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { chains, switchChain } = useSwitchChain()
  const { signMessageAsync } = useSignMessage()
  const [proof, setProof] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [showNetworks, setShowNetworks] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

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

  if (!mounted) return null

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
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(false)} />
            <div className="absolute right-0 mt-2 w-80 bg-bg-secondary border border-border rounded-lg shadow-xl z-50">
              <div className="p-4 border-b border-border">
                <div className="text-xs text-text-muted mb-1">Connected Wallet</div>
                <div className="font-mono text-sm text-text break-all">{address}</div>
                {chain && (
                  <div className="flex items-center gap-2 mt-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: networkLogos[chain.id]?.color || '#888' }}
                    />
                    <span className="text-xs text-accent">{chain.name}</span>
                  </div>
                )}
              </div>

              <div className="p-4 border-b border-border space-y-3">
                {/* Network Switcher */}
                <div>
                  <button
                    onClick={() => setShowNetworks(!showNetworks)}
                    className="w-full py-2 px-3 bg-bg-tertiary text-text text-sm font-medium rounded-lg hover:bg-border transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                      </svg>
                      Switch Network
                    </div>
                    <svg className={`w-4 h-4 transition-transform ${showNetworks ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {showNetworks && (
                    <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                      {chains.map((c) => (
                        <button
                          key={c.id}
                          onClick={() => {
                            switchChain({ chainId: c.id })
                            setShowNetworks(false)
                          }}
                          className={`w-full py-2 px-3 text-sm rounded-lg flex items-center gap-2 transition-colors ${
                            chain?.id === c.id
                              ? 'bg-accent/20 text-accent'
                              : 'hover:bg-bg-tertiary text-text-secondary'
                          }`}
                        >
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: networkLogos[c.id]?.color || '#888' }}
                          />
                          {c.name}
                          {chain?.id === c.id && (
                            <svg className="w-4 h-4 ml-auto" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button
                  onClick={handleGenerateProof}
                  className="w-full py-2 px-3 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-dim transition-colors"
                >
                  Generate On-Chain Proof
                </button>

                {proof && (
                  <div>
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
                  className="w-full py-2 px-3 text-sm text-accent-dim hover:text-accent transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Disconnect
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
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

      {/* Wallet Selection Modal */}
      {showModal && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setShowModal(false)}
          />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-bg-secondary border border-border rounded-xl shadow-2xl w-full max-w-md">
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-border">
                <h3 className="text-lg font-bold text-text">Connect Wallet</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-1 hover:bg-bg-tertiary rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Wallet Options */}
              <div className="p-4 space-y-2">
                <p className="text-sm text-text-muted mb-4">Choose your preferred wallet</p>

                {connectors.map((connector) => (
                  <button
                    key={connector.uid}
                    onClick={() => {
                      connect({ connector })
                      setShowModal(false)
                    }}
                    disabled={isPending}
                    className="w-full flex items-center gap-4 p-4 rounded-lg border border-border hover:border-accent hover:bg-bg-tertiary transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-bg-tertiary rounded-lg flex items-center justify-center text-xl group-hover:bg-accent/20 transition-colors">
                      {walletIcons[connector.name] || '🔗'}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-text group-hover:text-accent transition-colors">
                        {connector.name}
                      </div>
                      <div className="text-xs text-text-muted">
                        {connector.name === 'MetaMask' && 'Popular browser extension'}
                        {connector.name === 'Coinbase Wallet' && 'Secure mobile & browser wallet'}
                        {connector.name === 'WalletConnect' && 'Connect via QR code'}
                        {connector.name === 'Injected' && 'Browser injected wallet'}
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-text-muted group-hover:text-accent transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                ))}
              </div>

              {/* Supported Networks */}
              <div className="p-4 border-t border-border">
                <p className="text-xs text-text-muted mb-3">Supported Networks</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(networkLogos).map(([id, { name, color }]) => (
                    <div
                      key={id}
                      className="flex items-center gap-1.5 px-2 py-1 bg-bg-tertiary rounded-full"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-xs text-text-secondary">{name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}
