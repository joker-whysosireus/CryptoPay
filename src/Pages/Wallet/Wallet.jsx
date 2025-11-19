import './Wallet.css';
import Menu from "../../assets/Menus/Menu/Menu";
import UserHeader from '../../assets/UserHeader/UserHeader';
import { useTonAddress } from '@tonconnect/ui-react';
import { useState } from 'react';

function Wallet({ userData, updateUserData }) {
  const userFriendlyAddress = useTonAddress();
  const [withdrawAmount, setWithdrawAmount] = useState(userData?.balance || '0.000');

  const handleWatchAd = () => {
    console.log("Showing ad");
  };

  const handleWithdraw = () => {
    console.log("Withdrawing funds:", withdrawAmount);
  };

  // Используем данные из userData или значения по умолчанию
  const balance = userData?.balance || '0.000';
  const totalAdsWatched = userData?.total_ads_watched || 0;
  const weeklyAdsWatched = userData?.weekly_ads_watched || 0;

  return (
    <div className="wallet-container">
      <UserHeader userData={userData} updateUserData={updateUserData} />

      <div className="wallet-content">
        <div className="wallet-balance-section">
          <div className="wallet-balance-display">
            <img src="/usdt.svg" alt="USDT" className="wallet-usdt-icon" />
            <span className="wallet-balance-amount">{balance}</span>
            <span className="wallet-balance-currency">USDT</span>
          </div>
        </div>

        <div className="wallet-stats-section">
          <div className="wallet-stats-container">
            <div className="wallet-stat-card">
              <div className="wallet-stat-value">{totalAdsWatched}</div>
              <div className="wallet-stat-label">Total Views</div>
            </div>
            <div className="wallet-stat-card">
              <div className="wallet-stat-value">{weeklyAdsWatched}</div>
              <div className="wallet-stat-label">This Week</div>
            </div>
          </div>
        </div>

        <div className="wallet-info-section">
          <div className="wallet-info-card">
            <div className="wallet-info-title">How it works?</div>
            <div className="wallet-info-text">
              • Watch ads and earn 0.001 USDT per view<br/>
              • Minimum withdrawal: 1 USDT<br/>
              • Withdraw to your TON wallet
            </div>
          </div>
        </div>
      </div>

      <div className="wallet-bottom-section">
        <div className="wallet-buttons-section">
          <button 
            className="wallet-withdraw-button"
            onClick={handleWithdraw}
            disabled={!withdrawAmount || !userFriendlyAddress}
          >
            Withdraw
          </button>
          <button className="wallet-watch-ad-button" onClick={handleWatchAd}>
            Watch Ad
          </button>
        </div>
        <Menu />
      </div>
    </div>
  );
}

export default Wallet;