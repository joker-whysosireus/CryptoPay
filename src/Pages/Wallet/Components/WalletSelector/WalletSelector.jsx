import { motion } from "motion/react";
import { Check } from "lucide-react";
import './WalletSelector.css';

function WalletSelector({ open, onOpenChange, connectedWallets, selectedWallet, onSelect }) {
  if (!open) return null;

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onOpenChange(false);
    }
  };

  return (
    <div className="modal-overlay fade-in" onClick={handleOverlayClick}>
      <div className="modal-content">
        <h2 className="modal-title">Выбрать кошелек</h2>
        
        <div className="space-y-2">
          {connectedWallets.map((wallet) => (
            <motion.button
              key={wallet.id}
              onClick={() => {
                onSelect(wallet.id);
                onOpenChange(false);
              }}
              whileHover={{ backgroundColor: '#3A3A3C' }}
              whileTap={{ scale: 0.98 }}
              className="wallet-selector-item"
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
                    {`${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}
                  </p>
                </div>
              </div>

              {selectedWallet && selectedWallet.id === wallet.id && (
                <Check className="w-5 h-5" style={{ color: '#54D66B' }} />
              )}
            </motion.button>
          ))}
          
          {connectedWallets.length === 0 && (
            <p className="text-center text-muted py-4">Нет подключенных кошельков</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default WalletSelector;