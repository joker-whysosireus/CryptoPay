import './Wallet.css';
import Menu from "../../assets/Menus/Menu/Menu";
import UserHeader from '../../assets/UserHeader/UserHeader';
import { useTonAddress } from '@tonconnect/ui-react';
import { useState, useEffect } from 'react';

function Wallet({ userData, updateUserData }) {
  const userFriendlyAddress = useTonAddress();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [processing, setProcessing] = useState(false);

  // Вспомогательные функции внутри компонента
  const sendWithdrawalNotification = async (userData, amount) => {
    try {
      const response = await fetch('https://cryptopayappbackend.netlify.app/.netlify/functions/withdraw-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userData.telegram_user_id,
          username: userData.username,
          first_name: userData.first_name,
          amount: amount,
          timestamp: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send notification');
      }
      
      console.log('Withdrawal notification sent to developer');
    } catch (error) {
      console.error('Error sending withdrawal notification:', error);
      throw error;
    }
  };

  const sendUserWithdrawalConfirmation = async (userData, amount) => {
    try {
      const response = await fetch('https://cryptopayappbackend.netlify.app/.netlify/functions/user-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userData.telegram_user_id,
          amount: amount,
          timestamp: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send user confirmation');
      }
      
      console.log('Withdrawal confirmation sent to user');
    } catch (error) {
      console.error('Error sending user confirmation:', error);
      throw error;
    }
  };

  const updateUserBalance = async (telegramUserId, amount) => {
    try {
      const response = await fetch('https://cryptopayappbackend.netlify.app/.netlify/functions/update-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_user_id: telegramUserId,
          amount: -amount,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update balance');
      }
      
      console.log('User balance updated successfully');
    } catch (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  };

  // Обработчики событий
  const handleWatchAd = () => {
    console.log("Showing ad");
  };

  const handleWithdrawClick = () => {
    setIsWithdrawModalOpen(true);
  };

  const handleConfirmWithdraw = async () => {
    setProcessing(true);
    try {
      await sendWithdrawalNotification(userData, withdrawAmount);
      await sendUserWithdrawalConfirmation(userData, withdrawAmount);
      await updateUserBalance(userData.telegram_user_id, parseFloat(withdrawAmount));
      await updateUserData();
      
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
    } catch (error) {
      console.error('Error processing withdrawal:', error);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelWithdraw = () => {
    setIsWithdrawModalOpen(false);
    setWithdrawAmount('');
  };

  // Эффекты
  useEffect(() => {
    if (isWithdrawModalOpen) {
      setWithdrawAmount(userData?.balance || '0.000');
    }
  }, [isWithdrawModalOpen, userData?.balance]);

  // Данные для отображения
  const balance = userData?.balance || '0.000';
  const totalAdsWatched = userData?.total_ads_watched || 0;
  const weeklyAdsWatched = userData?.weekly_ads_watched || 0;
  const isWithdrawEnabled = parseFloat(balance) >= 1 && userFriendlyAddress;

  // Возвращаемая разметка
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
              • Watch ads and earn 0.01 USDT per view<br/>
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
            onClick={handleWithdrawClick}
            disabled={!isWithdrawEnabled}
          >
            {isWithdrawEnabled ? 'Withdraw' : `Min: 1 USDT`}
          </button>
          <button className="wallet-watch-ad-button" onClick={handleWatchAd}>
            Watch Ad
          </button>
        </div>
        <Menu />
      </div>

      {isWithdrawModalOpen && (
        <div className="withdraw-modal-overlay" onClick={handleCancelWithdraw}>
          <div className="withdraw-modal" onClick={(e) => e.stopPropagation()}>
            <div className="withdraw-modal-header">
              <h3>Confirm Withdrawal</h3>
              <button className="close-button" onClick={handleCancelWithdraw}>×</button>
            </div>
            
            <div className="withdraw-modal-content">
              <div className="withdraw-balance-info">
                <p>Available Balance: <strong>{balance} USDT</strong></p>
                <div className="withdraw-input-group">
                  <label>Amount to withdraw:</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={(e) => setWithdrawAmount(e.target.value)}
                    min="1"
                    max={balance}
                    step="0.001"
                    className="withdraw-amount-input"
                  />
                  <span className="currency-symbol">USDT</span>
                </div>
                <p className="withdraw-fee">Fee: 0.1 USDT</p>
                <p className="withdraw-total">
                  You will receive: <strong>{(parseFloat(withdrawAmount) - 0.1).toFixed(3)} USDT</strong>
                </p>
              </div>
              
              <div className="withdraw-modal-actions">
                <button 
                  className="confirm-withdraw-button"
                  onClick={handleConfirmWithdraw}
                  disabled={!withdrawAmount || parseFloat(withdrawAmount) < 1 || parseFloat(withdrawAmount) > parseFloat(balance) || processing}
                >
                  {processing ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Wallet;