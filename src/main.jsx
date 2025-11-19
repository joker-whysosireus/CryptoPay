import { createRoot } from 'react-dom/client'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import App from './App'

// TON манифест - замените на ваш реальный URL
const manifestUrl = 'https://gist.githubusercontent.com/your-username/your-manifest-id/raw/tonconnect-manifest.json'

const root = createRoot(document.getElementById('root'))
root.render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
)