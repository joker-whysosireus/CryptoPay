import { motion } from "motion/react";
import { Check } from "lucide-react";
import './ConnectWalletModal.css';

const SUPPORTED_WALLETS = [
  { id: "ethereum", name: "Ethereum", symbol: "ETH", icon: "/eth.svg" },
  { id: "solana", name: "Solana", symbol: "SOL", icon: "/sol.svg" },
  { id: "ton", name: "TON", symbol: "TON", icon: "/ton.svg" },
  { id: "tron", name: "Tron", symbol: "TRX", icon: "/tron.svg" },
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", icon: "/btc.svg" },
];

function ConnectWalletModal({ open, onOpenChange, onConnectWallet, connectedWallets, userData }) {
  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  const isWalletConnected = (walletId) => {
    return connectedWallets.some(wallet => wallet.blockchain === walletId);
  };

  return (
    <div className="modal-overlay fade-in" onClick={handleOverlayClick}>
      <div className="modal-content">
        <h2 className="modal-title">Подключить кошелек</h2>
        
        <div className="space-y-2">
          {SUPPORTED_WALLETS.map((wallet) => {
            const isConnected = isWalletConnected(wallet.id);
            
            return (
              <motion.button
                key={wallet.id}
                onClick={() => {
                  if (!isConnected) {
                    onConnectWallet(wallet.id);
                  }
                  onOpenChange(false);
                }}
                whileHover={{ backgroundColor: '#3A3A3C' }}
                whileTap={{ scale: 0.98 }}
                className="wallet-selector-item"
                disabled={isConnected}
              >
                <div className="modal-wallet-content">
                  <div className="modal-wallet-icon">
                    <img 
                      src={wallet.icon} 
                      alt={wallet.name}
                      className="modal-wallet-svg-icon"
                    />
                  </div>
                  <div className="modal-wallet-text">
                    <p className="modal-wallet-name">{wallet.name}</p>
                    <p className="wallet-address">
                      {isConnected ? 'Подключен' : 'Нажмите для подключения'}
                    </p>
                  </div>
                </div>

                {isConnected && (
                  <Check className="w-5 h-5" style={{ color: '#54D66B' }} />
                )}
              </motion.button>
            );
          })}
          
          {connectedWallets.length === 0 && (
            <p className="text-center text-muted py-4">Нет подключенных кошельков</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ConnectWalletModal;