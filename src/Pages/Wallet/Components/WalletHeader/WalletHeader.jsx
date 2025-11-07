import './WalletHeader.css';

function WalletHeader({ onSelectWallet, onScanQR }) {
  return (
    <div className="header-section">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="user-avatar">
          <span>👤</span>
        </div>

        <button onClick={onSelectWallet} className="btn-primary">
          Выбрать кошелек
        </button>

        <button onClick={onScanQR} className="btn-circle">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 7H7V3H3V7ZM1 1H9V9H1V1ZM3 21H7V17H3V21ZM1 15H9V23H1V15ZM17 3H21V7H17V3ZM15 1H23V9H15V1ZM17 12H21V14H17V12ZM15 10H23V16H15V10ZM10 10H14V14H10V10ZM8 8H16V16H8V8ZM10 18H14V22H10V18ZM8 16H16V24H8V16ZM20 18H22V20H20V18ZM18 20H24V22H18V20ZM18 16H20V18H18V16Z" fill="white"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default WalletHeader;