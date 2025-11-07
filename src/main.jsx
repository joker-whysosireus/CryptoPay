import { createRoot } from 'react-dom/client'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets'
import { clusterApiUrl } from '@solana/web3.js'

import App from './App'
import { wagmiConfig } from './config/appkit-config'

// TON манифест
const manifestUrl = 'https://your-app.com/tonconnect-manifest.json'

// Solana конфигурация
const network = WalletAdapterNetwork.Mainnet
const endpoint = clusterApiUrl(network)
const wallets = [
  new PhantomWalletAdapter(),
  new SolflareWalletAdapter(),
]

// React Query клиент
const queryClient = new QueryClient()

const root = createRoot(document.getElementById('root'))
root.render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <ConnectionProvider endpoint={endpoint}>
          <WalletProvider wallets={wallets} autoConnect>
            <App />
          </WalletProvider>
        </ConnectionProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </TonConnectUIProvider>
)