import './WalletHeader.css';

function WalletHeader({ onSelectWallet, onScanQR, avatar, firstName, username }) {
  return (
    <div className="header-section">
      <div className="flex items-center justify-between px-5 py-4">
        <div className="user-avatar">
          {avatar ? (
            <img 
              src={avatar} 
              alt="User Avatar" 
              className="avatar-image"
            />
          ) : (
            <span>👤</span>
          )}
        </div>

        <button onClick={onSelectWallet} className="btn-primary">
          Выбрать кошелек
        </button>

        <button onClick={onScanQR} className="btn-circle">
          {/* Новый более четкий QR код */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="6" height="6" rx="1" fill="white"/>
            <rect x="3" y="15" width="6" height="6" rx="1" fill="white"/>
            <rect x="15" y="3" width="6" height="6" rx="1" fill="white"/>
            <rect x="15" y="15" width="6" height="6" rx="1" fill="white"/>
            <rect x="10" y="2" width="2" height="4" fill="white"/>
            <rect x="2" y="10" width="4" height="2" fill="white"/>
            <rect x="18" y="10" width="4" height="2" fill="white"/>
            <rect x="10" y="18" width="2" height="4" fill="white"/>
            <rect x="12" y="10" width="2" height="2" fill="white"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

export default WalletHeader;