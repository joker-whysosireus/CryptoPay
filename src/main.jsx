import { createRoot } from 'react-dom/client'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import App from './App'

// TON манифест - замените на ваш реальный URL
const manifestUrl = 'https://raw.githubusercontent.com/joker-whysosireus/manifest-info-watch-earn/main/manifest.txt'

const root = createRoot(document.getElementById('root'))
root.render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
)