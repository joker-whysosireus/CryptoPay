import './Wallet.css';
import Menu from "../../assets/Menus/Menu/Menu";
import UserHeader from '../../assets/UserHeader/UserHeader';
import { useTonAddress } from '@tonconnect/ui-react';
import { useState, useEffect, useCallback } from 'react';

function Wallet({ userData, updateUserData }) {
  const userFriendlyAddress = useTonAddress();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adError, setAdError] = useState(null);

  // Функция для начисления награды за просмотр рекламы
  const rewardAdWatch = async (telegramUserId) => {
    try {
      const response = await fetch('https://cryptopayappbackend.netlify.app/.netlify/functions/watch-ad-reward', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_user_id: telegramUserId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to process ad reward');
      }

      console.log('Ad reward processed successfully:', result.reward);
      return result;
    } catch (error) {
      console.error('Error processing ad reward:', error);
      throw error;
    }
  };

  // Функция для показа рекламы
  const showAd = useCallback(() => {
    return new Promise((resolve, reject) => {
      console.log("Starting ad display...");
      
      // Имитация показа рекламы на 5 секунд
      setTimeout(() => {
        console.log("Ad completed successfully");
        resolve();
      }, 5000);
    });
  }, []);

  // Обработчик показа рекламы
  const handleWatchAd = useCallback(async () => {
    if (isAdLoading || !userData?.telegram_user_id) return;
    
    setIsAdLoading(true);
    setAdError(null);

    try {
      // Показываем рекламу
      await showAd();
      
      // Начисляем награду через новую функцию
      await rewardAdWatch(userData.telegram_user_id);
      
      // Обновляем данные пользователя
      await updateUserData();
      
      console.log("Ad watched successfully, reward processed");
      
    } catch (error) {
      console.error('Error watching ad:', error);
      setAdError(error.message || 'Failed to process ad reward');
    } finally {
      setIsAdLoading(false);
    }
  }, [userData, updateUserData, isAdLoading, showAd]);

  const handleWithdrawClick = () => {
    setIsWithdrawModalOpen(true);
  };

  const handleConfirmWithdraw = async () => {
    if (!withdrawAmount || parseFloat(withdrawAmount) < 1 || parseFloat(withdrawAmount) > parseFloat(userData?.balance || '0')) {
      alert('Invalid withdrawal amount');
      return;
    }

    setProcessing(true);
    
    try {
      // Обновление баланса в базе данных
      const balanceResponse = await fetch('https://cryptopayappbackend.netlify.app/.netlify/functions/update-balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_user_id: userData.telegram_user_id,
          amount: -parseFloat(withdrawAmount),
        }),
      });

      const balanceResult = await balanceResponse.json();

      if (!balanceResponse.ok || !balanceResult.success) {
        throw new Error(balanceResult.error || 'Failed to update balance');
      }

      console.log('User balance updated successfully');

      // Отправка уведомления разработчику
      try {
        const notificationResponse = await fetch('https://cryptopayappbackend.netlify.app/.netlify/functions/withdraw-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userData.telegram_user_id,
            username: userData.username,
            first_name: userData.first_name,
            amount: withdrawAmount,
            timestamp: new Date().toISOString()
          }),
        });

        if (notificationResponse.ok) {
          console.log('Withdrawal notification sent to developer');
        }
      } catch (notificationError) {
        console.error('Error sending notification:', notificationError);
      }

      // Отправка уведомления пользователю
      try {
        const userNotificationResponse = await fetch('https://cryptopayappbackend.netlify.app/.netlify/functions/user-notification', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userData.telegram_user_id,
            amount: withdrawAmount,
            timestamp: new Date().toISOString()
          }),
        });

        if (userNotificationResponse.ok) {
          console.log('Withdrawal confirmation sent to user');
        }
      } catch (userNotificationError) {
        console.error('Error sending user notification:', userNotificationError);
      }

      // Обновление данных пользователя
      await updateUserData();
      
      // Закрытие модального окна
      setIsWithdrawModalOpen(false);
      setWithdrawAmount('');
      
      alert('Withdrawal request submitted successfully!');
      
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      alert('Error processing withdrawal: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelWithdraw = () => {
    setIsWithdrawModalOpen(false);
    setWithdrawAmount('');
  };

  // Автоматически устанавливаем доступный баланс при открытии модального окна
  useEffect(() => {
    if (isWithdrawModalOpen) {
      setWithdrawAmount(userData?.balance || '0.000');
    }
  }, [isWithdrawModalOpen, userData?.balance]);

  const balance = userData?.balance || '0.000';
  const totalAdsWatched = userData?.total_ads_watched || 0;
  const weeklyAdsWatched = userData?.weekly_ads_watched || 0;
  
  // Проверяем, доступна ли кнопка вывода
  const isWithdrawEnabled = parseFloat(balance) >= 1 && userFriendlyAddress;

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
          <button 
            className={`wallet-watch-ad-button ${isAdLoading ? 'loading' : ''}`}
            onClick={handleWatchAd}
            disabled={isAdLoading}
          >
            {isAdLoading ? (
              <div className="ad-loading-spinner">
                <div className="spinner"></div>
                Processing...
              </div>
            ) : (
              'Watch Ad'
            )}
          </button>
          {adError && (
            <div className="ad-error-message">{adError}</div>
          )}
        </div>
        <Menu />
      </div>

      {/* Модальное окно вывода */}
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