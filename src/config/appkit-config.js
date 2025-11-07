import { createAppKit } from '@reown/appkit'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { SolanaAdapter } from '@reown/appkit-adapter-solana'
import { createConfig, http } from 'wagmi'
import { mainnet, arbitrum, polygon } from 'wagmi/chains'
import { solana, solanaDevnet } from '@reown/appkit/networks'

// Конфигурация сетей
export const networks = [mainnet, arbitrum, polygon, solana, solanaDevnet]

// Ваш Project ID с Reown Cloud
const projectId = '74a1a88877e340f38f17cc598a498dc8'

// Адаптер для EVM-сетей (Ethereum, Polygon, Arbitrum)
export const wagmiAdapter = new WagmiAdapter({
  ssr: false,
  projectId,
  networks: [mainnet, arbitrum, polygon],
  transports: {
    [mainnet.id]: http(),
    [arbitrum.id]: http(),
    [polygon.id]: http(),
  }
})

// Адаптер для Solana
export const solanaWeb3JsAdapter = new SolanaAdapter({
  registerWalletStandard: true,
})

// Метаданные приложения
export const metadata = {
  name: 'CryptoPay',
  description: 'Мультичейн кошелек для оплаты QR-кодов',
  url: 'https://yourapp.com',
  icons: ['https://yourapp.com/icon.png']
}

// Основной экземпляр AppKit
export const appKit = createAppKit({
  adapters: [wagmiAdapter, solanaWeb3JsAdapter],
  networks: networks,
  metadata: metadata,
  projectId: projectId,
  features: {
    analytics: true,
  }
})

// Конфиг для Wagmi
export const wagmiConfig = wagmiAdapter.wagmiConfig