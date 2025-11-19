import './Wallet.css';
import Menu from "../../assets/Menus/Menu/Menu";
import UserHeader from '../../assets/UserHeader/UserHeader';
import { useTonAddress } from '@tonconnect/ui-react';
import { useState } from 'react';

function Wallet({ userData, updateUserData, userLanguage }) {
  const userFriendlyAddress = useTonAddress();
  const [withdrawAmount, setWithdrawAmount] = useState(userData?.balance || '0.000');

  const handleWatchAd = () => {
    console.log("Показ рекламы");
  };

  const handleWithdraw = () => {
    console.log("Вывод средств:", withdrawAmount);
  };

  const balance = userData?.balance || '0.000';
  const totalAdsWatched = userData?.total_ads_watched || 0;
  const weeklyAdsWatched = userData?.weekly_ads_watched || 0;

  // Тексты в зависимости от языка
  const texts = {
    watchAd: userLanguage !== 'ru' ? 'Watch Ad' : 'Смотреть рекламу',
    withdraw: userLanguage !== 'ru' ? 'Withdraw' : 'Вывести',
    totalViews: userLanguage !== 'ru' ? 'Total Views' : 'Всего просмотров',
    weeklyViews: userLanguage !== 'ru' ? 'This Week' : 'За неделю',
    howItWorks: userLanguage !== 'ru' ? 'How it works?' : 'Как это работает?',
    howItWorksText: userLanguage !== 'ru' 
      ? '• Watch ads and earn 0.001 USDT per view<br/>• Minimum withdrawal: 1 USDT<br/>• Withdraw to your TON wallet'
      : '• Смотрите рекламу и получайте 0.001 USDT за каждый просмотр<br/>• Минимальная сумма для вывода: 1 USDT<br/>• Выводите средства на свой TON кошелек',
    balance: userLanguage !== 'ru' ? 'Balance' : 'Баланс'
  };

  return (
    <div className="wallet-container">
      <UserHeader userData={userData} updateUserData={updateUserData} userLanguage={userLanguage} />

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
              <div className="wallet-stat-label">{texts.totalViews}</div>
            </div>
            <div className="wallet-stat-card">
              <div className="wallet-stat-value">{weeklyAdsWatched}</div>
              <div className="wallet-stat-label">{texts.weeklyViews}</div>
            </div>
          </div>
        </div>

        <div className="wallet-info-section">
          <div className="wallet-info-card">
            <div className="wallet-info-title">{texts.howItWorks}</div>
            <div 
              className="wallet-info-text" 
              dangerouslySetInnerHTML={{ __html: texts.howItWorksText }}
            />
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
            {texts.withdraw}
          </button>
          <button className="wallet-watch-ad-button" onClick={handleWatchAd}>
            {texts.watchAd}
          </button>
        </div>
        <Menu />
      </div>
    </div>
  );
}

export default Wallet;