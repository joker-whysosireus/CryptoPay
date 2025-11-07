import { Trash2 } from "lucide-react";
import './WalletList.css';

const ALL_WALLETS = [
  { id: "bitcoin", name: "Bitcoin", symbol: "BTC", icon: "/btc.svg" },
  { id: "ethereum", name: "Ethereum", symbol: "ETH", icon: "/eth.svg" },
  { id: "ton", name: "TON", symbol: "TON", icon: "/ton.svg" },
  { id: "tron", name: "Tron", symbol: "TRX", icon: "/tron.svg" },
  { id: "solana", name: "Solana", symbol: "SOL", icon: "/sol.svg" },
];

function WalletList({ connectedWallets, selectedWallet, onDisconnectWallet, userData }) {
  // Создаем карту подключенных кошельков для быстрого доступа
  const connectedWalletsMap = {};
  connectedWallets.forEach(wallet => {
    connectedWalletsMap[wallet.blockchain] = wallet;
  });

  // Объединяем все кошельки с данными о подключении
  const displayWallets = ALL_WALLETS.map(wallet => {
    const connectedWallet = connectedWalletsMap[wallet.id];
    const isConnected = !!connectedWallet;
    const isSelected = selectedWallet && selectedWallet.blockchain === wallet.id;
    
    if (isConnected) {
      return {
        ...wallet,
        address: connectedWallet.address,
        balance: connectedWallet.balance,
        balanceInRub: connectedWallet.balanceInRub,
        isConnected: true,
        isSelected: isSelected,
        connectedId: connectedWallet.id
      };
    }
    
    // Для неподключенных кошельков
    return {
      ...wallet,
      address: null,
      balance: '0',
      balanceInRub: 0,
      isConnected: false,
      isSelected: false
    };
  });

  return (
    <div className="wallets-section slide-up">
      {displayWallets.map((wallet, index) => (
        <div key={wallet.id} className="wallet-item">
          <div className="wallet-icon-container">
            <div className="wallet-icon">
              <img 
                src={wallet.icon} 
                alt={wallet.name}
                className="wallet-svg-icon"
              />
            </div>
          </div>

          <div className="wallet-info">
            <div className="wallet-name-container">
              <span className="wallet-name">{wallet.name}</span>
              {wallet.isSelected && (
                <div className="wallet-selected-indicator">
                  <div className="pulsing-dot" />
                </div>
              )}
            </div>
            <p className="wallet-address">
              {wallet.isConnected ? 
                `${wallet.address.slice(0, 3)}...${wallet.address.slice(-3)}` : 
                'Не подключен'
              }
            </p>
          </div>

          <div className="wallet-balance-section">
            <p className="wallet-balance">{wallet.balanceInRub.toLocaleString('ru-RU')} ₽</p>
            <p className="wallet-crypto-balance">
              {wallet.isConnected ? 
                `${parseFloat(wallet.balance).toFixed(4)} ${wallet.symbol}` : 
                `0 ${wallet.symbol}`
              }
            </p>
          </div>

          {wallet.isConnected && (
            <button 
              onClick={() => onDisconnectWallet(wallet.connectedId)}
              className="disconnect-btn"
              title="Отключить кошелек"
            >
              <Trash2 size={16} />
            </button>
          )}

          {index < displayWallets.length - 1 && (
            <div className="wallet-divider" />
          )}
        </div>
      ))}
    </div>
  );
}

export default WalletList;