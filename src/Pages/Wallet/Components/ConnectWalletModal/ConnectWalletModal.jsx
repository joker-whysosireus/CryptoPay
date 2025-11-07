import { motion } from "motion/react";
import { Plus, Check } from "lucide-react";
import { TonConnectButton } from '@tonconnect/ui-react';
import './ConnectWalletModal.css';

const blockchainOptions = [
  { id: "ethereum", name: "Ethereum", symbol: "ETH", icon: "/eth.svg" },
  { id: "solana", name: "Solana", symbol: "SOL", icon: "/sol.svg" },
  { id: "tron", name: "Tron", symbol: "TRX", icon: "/tron.svg" },
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", icon: "/btc.svg" },
];

function ConnectWalletModal({ open, onOpenChange, onConnectWallet, connectedWallets }) {
  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  const isWalletConnected = (blockchainId) => {
    return connectedWallets.some(wallet => wallet.blockchain === blockchainId);
  };

  return (
    <div className="modal-overlay fade-in" onClick={handleOverlayClick}>
      <div className="modal-content">
        <h2 className="modal-title">Подключить кошелек</h2>
        
        <div className="space-y-3">
          {blockchainOptions.map((blockchain) => (
            <motion.button
              key={blockchain.id}
              onClick={() => {
                onConnectWallet(blockchain.id);
              }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="modal-wallet-item"
              disabled={isWalletConnected(blockchain.id)}
            >
              <div className="modal-wallet-content">
                <div className="modal-wallet-icon">
                  <img 
                    src={blockchain.icon} 
                    alt={blockchain.name}
                    className="modal-wallet-svg-icon"
                  />
                </div>
                <div className="modal-wallet-text">
                  <p className="modal-wallet-name">{blockchain.name}</p>
                  <p className="modal-wallet-symbol">{blockchain.symbol}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isWalletConnected(blockchain.id) ? (
                  <Check className="w-5 h-5 text-[#54D66B]" />
                ) : (
                  <Plus className="w-5 h-5 text-[#54D66B]" />
                )}
              </div>
            </motion.button>
          ))}
        </div>

        {/* Блок для подключения TON кошелька */}
        <div className="ton-connect-section">
          <div className="section-divider">
            <span>или</span>
          </div>
          <p className="text-center text-muted text-sm mb-2">Подключите TON кошелек</p>
          <div className="ton-connect-button-wrapper">
            <TonConnectButton className="ton-connect-button" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConnectWalletModal;