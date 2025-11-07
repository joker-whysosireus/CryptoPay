import { Plus } from "lucide-react";
import './BalanceDisplay.css';

function BalanceDisplay({ balance, onConnectWallet }) {
  return (
    <div className="balance-container">
      <div className="balance-section">
        <p className="balance-label">Баланс</p>
        <p className="balance-amount">{balance.toLocaleString('ru-RU')} ₽</p>
        
        <button onClick={onConnectWallet} className="btn-connect">
          <Plus size={20} />
          Подключить кошелек
        </button>
      </div>
    </div>
  );
}

export default BalanceDisplay;