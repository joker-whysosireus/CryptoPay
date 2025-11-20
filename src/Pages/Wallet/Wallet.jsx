import './Wallet.css';
import Menu from "../../assets/Menus/Menu/Menu";
import UserHeader from '../../assets/UserHeader/UserHeader';
import { useTonAddress } from '@tonconnect/ui-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAdsgram } from './hook/useAdsgram';

function Wallet({ userData, updateUserData }) {
  const userFriendlyAddress = useTonAddress();
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isAdLoading, setIsAdLoading] = useState(false);
  const [adError, setAdError] = useState(null);
  const userIdRef = useRef(null);

  useEffect(() => {
    userIdRef.current = userData?.telegram_user_id;
  }, [userData]);

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

  // Функция для отправки уведомлений о выводе
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
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send withdrawal notification');
      }

      console.log('Withdrawal notifications sent successfully');
      return result;
    } catch (error) {
      console.error('Error sending withdrawal notification:', error);
      throw error;
    }
  };

  // Колбэк при успешном просмотре рекламы
  const onRewardAd = useCallback(async () => {
    if (!userIdRef.current) {
      setAdError('User ID not available');
      setIsAdLoading(false);
      return;
    }

    try {
      // Начисляем награду через функцию
      await rewardAdWatch(userIdRef.current);
      
      // Обновляем данные пользователя
      await updateUserData();
      
      console.log("Ad watched successfully, reward processed");
      
    } catch (error) {
      console.error('Error processing ad reward:', error);
      setAdError(error.message || 'Failed to process ad reward');
    } finally {
      setIsAdLoading(false);
    }
  }, [updateUserData]);

  // Колбэк при ошибке рекламы
  const onErrorAd = useCallback((error) => {
    console.error('Adsgram error (Wallet):', error);
    setAdError('Ad error: ' + error.message);
    setIsAdLoading(false);
  }, []);

  // Инициализация Adsgram для USDT рекламы
  const showAdWallet = useAdsgram({ 
    blockId: '17908', // Используем другой blockId для USDT рекламы
    onReward: onRewardAd, 
    onError: onErrorAd 
  });

  // Обработчик показа рекламы
  const handleWatchAd = useCallback(() => {
    if (isAdLoading || !userData?.telegram_user_id) return;
    
    setIsAdLoading(true);
    setAdError(null);
    showAdWallet();
  }, [userData, isAdLoading, showAdWallet]);

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

      // Отправка уведомлений о выводе
      await sendWithdrawalNotification(userData, withdrawAmount);

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

  // Текст для кнопки просмотра рекламы
  const getWatchAdButtonText = () => {
    if (isAdLoading) return 'Processing...';
    if (adError) return 'Retry';
    return 'Watch Ad';
  };

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
            className={`wallet-watch-ad-button ${isAdLoading ? 'loading' : ''} ${adError ? 'error' : ''}`}
            onClick={handleWatchAd}
            disabled={isAdLoading}
          >
            {isAdLoading ? (
              <div className="ad-loading-spinner">
                <div className="spinner"></div>
                Processing...
              </div>
            ) : (
              getWatchAdButtonText()
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