import { createRoot } from 'react-dom/client'
import { TonConnectUIProvider } from '@tonconnect/ui-react'
import App from './App'

// TON манифест
const manifestUrl = 'https://your-app.com/tonconnect-manifest.json'

const root = createRoot(document.getElementById('root'))
root.render(
  <TonConnectUIProvider manifestUrl={manifestUrl}>
    <App />
  </TonConnectUIProvider>
)