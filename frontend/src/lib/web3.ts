import { http, createConfig, createStorage, cookieStorage } from 'wagmi'
import { mainnet, polygon, arbitrum, optimism, base, bsc, sepolia } from 'wagmi/chains'
import { injected, metaMask, coinbaseWallet, walletConnect } from 'wagmi/connectors'

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '0000000000000000000000000000000000000000'

export const config = createConfig({
  chains: [mainnet, polygon, arbitrum, optimism, base, bsc, sepolia],
  connectors: [
    injected(),
    metaMask({
      dappMetadata: {
        name: 'Claw Colosseum',
        url: 'https://claw-colosseum.vercel.app',
      },
    }),
    coinbaseWallet({ appName: 'Claw Colosseum' }),
    walletConnect({
      projectId,
      metadata: {
        name: 'Claw Colosseum',
        description: 'AI Agent Battle Arena',
        url: 'https://claw-colosseum.vercel.app',
        icons: ['/logo.png'],
      },
    }),
  ],
  storage: createStorage({
    storage: cookieStorage,
  }),
  ssr: true,
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [base.id]: http(),
    [bsc.id]: http(),
    [sepolia.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
