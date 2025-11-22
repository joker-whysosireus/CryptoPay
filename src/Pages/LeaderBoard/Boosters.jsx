import './Boosters.css';
import Menu from "../../assets/Menus/Menu/Menu";
import UserHeader from '../../assets/UserHeader/UserHeader';
import { useState, useEffect } from 'react';

function Boosters({ userData, updateUserData }) {
  const [webApp, setWebApp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [purchaseSuccess, setPurchaseSuccess] = useState(null);
  const [selectedBooster, setSelectedBooster] = useState(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Состояние для накопленных USDT
  const [accumulatedUSDT, setAccumulatedUSDT] = useState(0);
  const [totalHourlyEarnings, setTotalHourlyEarnings] = useState(0);

  // Список бустеров с обновленными названиями
  const boostersList = [
    {
      id: 'mini_booster',
      name: 'Mini',
      usdtPerHour: 0.0001,
      price: 1,
      dbColumn: 'mini_booster'
    },
    {
      id: 'basic_booster',
      name: 'Basic',
      usdtPerHour: 0.0005,
      price: 1,
      dbColumn: 'basic_booster'
    },
    {
      id: 'advanced_booster', 
      name: 'Advanced',
      usdtPerHour: 0.001,
      price: 1,
      dbColumn: 'advanced_booster'
    },
    {
      id: 'pro_booster',
      name: 'Pro',
      usdtPerHour: 0.005,
      price: 1,
      dbColumn: 'pro_booster'
    },
    {
      id: 'ultimate_booster',
      name: 'Ultimate',
      usdtPerHour: 0.01,
      price: 1,
      dbColumn: 'ultimate_booster'
    },
    {
      id: 'mega_booster',
      name: 'Mega',
      usdtPerHour: 0.05,
      price: 1,
      dbColumn: 'mega_booster'
    }
  ];

  useEffect(() => {
    if (window.Telegram && window.Telegram.WebApp) {
      setWebApp(window.Telegram.WebApp);
    }

    // Загружаем накопленные USDT из localStorage
    const savedUSDT = localStorage.getItem('boostersAccumulatedUSDT');
    if (savedUSDT) {
      setAccumulatedUSDT(parseFloat(savedUSDT));
    }

    // Запускаем интервал для накопления USDT
    const interval = setInterval(() => {
      setAccumulatedUSDT(prev => {
        const newValue = prev + (totalHourlyEarnings / 3600); // Добавляем за секунду
        localStorage.setItem('boostersAccumulatedUSDT', newValue.toString());
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [totalHourlyEarnings]);

  // Пересчитываем общий доход в час при изменении бустеров
  useEffect(() => {
    const total = calculateTotalHourlyEarnings();
    setTotalHourlyEarnings(total);
  }, [userData]);

  // Функция для создания инвойса на бустер
  const createBoosterInvoice = async (booster) => {
    try {
      if (!webApp) {
        throw new Error('Telegram WebApp not initialized');
      }

      const userId = webApp.initDataUnsafe?.user?.id;
      if (!userId) {
        throw new Error('User ID not available');
      }

      const payload = JSON.stringify({
        item_id: booster.id,
        user_id: userId.toString(),
        booster_type: booster.id
      });

      const response = await fetch('https://cryptopayappbackend.netlify.app/.netlify/functions/create-invoice', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: booster.name,
          description: `Generates ${booster.usdtPerHour} USDT per hour`,
          payload: payload,
          currency: "XTR",
          prices: [{ amount: booster.price, label: booster.name }]
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      if (!result.invoiceLink) {
        throw new Error('Invoice link not received from server');
      }

      return result.invoiceLink;
    } catch (error) {
      console.error('Error creating booster invoice:', error);
      throw error;
    }
  };

  // Функция для проверки платежа за бустер
  const verifyBoosterPayment = async (payload) => {
    try {
      if (!webApp) {
        throw new Error('Telegram WebApp not initialized');
      }

      const userId = webApp.initDataUnsafe?.user?.id;
      if (!userId) {
        throw new Error('User ID not available');
      }

      const response = await fetch('https://cryptopayappbackend.netlify.app/.netlify/functions/verify-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payload: payload,
          user_id: userId.toString()
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `HTTP error! status: ${response.status}`);
      }

      return result;
    } catch (error) {
      console.error('Error verifying booster payment:', error);
      throw error;
    }
  };

  // Функция для обновления бустера в базе данных
  const updateBoosterInDatabase = async (boosterId) => {
    try {
      if (!webApp) {
        throw new Error('Telegram WebApp not initialized');
      }

      const userId = webApp.initDataUnsafe?.user?.id;
      if (!userId) {
        throw new Error('User ID not available');
      }

      const response = await fetch('https://cryptopayappbackend.netlify.app/.netlify/functions/update-booster', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_user_id: userId.toString(),
          booster_type: boosterId
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update booster in database');
      }

      console.log('Booster updated successfully in database:', result);
      return result;
    } catch (error) {
      console.error('Error updating booster in database:', error);
      throw error;
    }
  };

  // Обработчик покупки бустера
  const handleBuyBooster = async (booster) => {
    if (!webApp) {
      alert('Telegram WebApp not available');
      return;
    }

    setIsLoading(true);
    setPurchaseSuccess(null);
    setSelectedBooster(booster);

    try {
      // Создаем инвойс
      const invoiceLink = await createBoosterInvoice(booster);
      
      // Открываем инвойс в Telegram
      webApp.openInvoice(invoiceLink, async (status) => {
        if (status === "paid") {
          try {
            // Создаем payload для верификации
            const payload = JSON.stringify({
              item_id: booster.id,
              user_id: webApp.initDataUnsafe?.user?.id?.toString(),
              booster_type: booster.id
            });

            // Проверяем платеж
            const verificationResult = await verifyBoosterPayment(payload);
            
            if (verificationResult.success) {
              if (verificationResult.duplicate) {
                setPurchaseSuccess('Duplicate payment detected');
              } else if (verificationResult.alreadyOwned) {
                setPurchaseSuccess('Booster already owned');
              } else {
                // Обновляем бустер в базе данных
                await updateBoosterInDatabase(booster.id);
                
                setPurchaseSuccess(`${booster.name} purchased successfully!`);
                
                // Обновляем данные пользователя
                await updateUserData();
              }
            } else {
              throw new Error('Payment verification failed');
            }
            
          } catch (error) {
            console.error('Error processing booster payment:', error);
            setPurchaseSuccess('Payment verification failed: ' + error.message);
          }
        } else {
          // Payment failed or cancelled
          if (status === "failed") {
            setPurchaseSuccess('Payment failed. Please try again.');
          } else if (status === "cancelled") {
            setPurchaseSuccess('Payment cancelled.');
          }
        }
        
        setIsLoading(false);
        
        // Сбрасываем сообщение через 3 секунды
        setTimeout(() => {
          setPurchaseSuccess(null);
          setSelectedBooster(null);
        }, 3000);
      });

    } catch (error) {
      console.error('Error in booster purchase:', error);
      setPurchaseSuccess('Error processing booster purchase: ' + error.message);
      setIsLoading(false);
      
      setTimeout(() => {
        setPurchaseSuccess(null);
        setSelectedBooster(null);
      }, 3000);
    }
  };

  // Получаем количество каждого бустера у пользователя
  const getBoosterCount = (boosterId) => {
    const booster = boostersList.find(b => b.id === boosterId);
    if (!booster || !userData) return 0;
    return userData[booster.dbColumn] || 0;
  };

  // Рассчитываем общий доход в час от всех бустеров
  const calculateTotalHourlyEarnings = () => {
    if (!userData) return 0;
    
    let total = 0;
    boostersList.forEach(booster => {
      const count = userData[booster.dbColumn] || 0;
      total += booster.usdtPerHour * count;
    });
    return total;
  };

  // Функция для отправки уведомлений о выводе с бустеров
  const sendBoostersWithdrawalNotification = async (userData, amount) => {
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
          source: 'boosters'
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to send withdrawal notification');
      }

      console.log('Boosters withdrawal notifications sent successfully');
      return result;
    } catch (error) {
      console.error('Error sending boosters withdrawal notification:', error);
      throw error;
    }
  };

  // Обработчик вывода накопленных USDT
  const handleWithdrawBoosters = async () => {
    if (accumulatedUSDT < 10) {
      alert('Minimum withdrawal is 10 USDT from boosters');
      return;
    }

    setProcessing(true);
    
    try {
      // Отправка уведомлений о выводе с бустеров
      await sendBoostersWithdrawalNotification(userData, accumulatedUSDT.toFixed(4));

      // Сбрасываем накопленные USDT до нуля
      setAccumulatedUSDT(0);
      localStorage.setItem('boostersAccumulatedUSDT', '0');
      
      // Закрытие модального окна
      setIsWithdrawModalOpen(false);
      
      alert('Withdrawal request submitted successfully! Funds will be sent within a week.');
      
    } catch (error) {
      console.error('Error processing boosters withdrawal:', error);
      alert('Error processing withdrawal: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  const handleCancelWithdraw = () => {
    setIsWithdrawModalOpen(false);
  };

  // Проверяем, доступна ли кнопка вывода
  const isWithdrawEnabled = accumulatedUSDT >= 10;

  return (
    <div className="boosters-container">
      <UserHeader userData={userData} updateUserData={updateUserData} />

      <div className="boosters-content">
        {/* Блок с накопленными USDT */}
        <div className="accumulated-section">
          <div className="accumulated-card">
            <div className="accumulated-header">
              <div className="accumulated-icon">
                <img src="/usdt.svg" alt="USDT" className="usdt-icon" />
              </div>
              <div className="accumulated-info">
                <div className="accumulated-amount">{accumulatedUSDT.toFixed(4)} USDT</div>
                <div className="accumulated-label">From Boosters</div>
                <div className="hourly-earnings">+{totalHourlyEarnings.toFixed(4)} USDT per hour</div>
              </div>
            </div>
            <button 
              className="withdraw-boosters-button"
              onClick={() => setIsWithdrawModalOpen(true)}
              disabled={!isWithdrawEnabled}
            >
              {isWithdrawEnabled ? 'Withdraw' : `Min: 10 USDT`}
            </button>
          </div>
        </div>

        {/* Список бустеров */}
        <div className="boosters-section">
          <h2 className="boosters-title">Available Boosters</h2>
          <p className="boosters-subtitle">Buy boosters to earn USDT automatically every hour</p>
          
          <div className="boosters-grid">
            {boostersList.map((booster) => {
              const ownedCount = getBoosterCount(booster.id);
              const isCurrentLoading = isLoading && selectedBooster?.id === booster.id;
              
              return (
                <div key={booster.id} className="booster-card">
                  <div className="booster-header">
                    <div className="booster-name">{booster.name}</div>
                    <button 
                      className={`booster-buy-button ${isCurrentLoading ? 'loading' : ''} ${ownedCount > 0 ? 'purchased' : ''}`}
                      onClick={() => handleBuyBooster(booster)}
                      disabled={isLoading || ownedCount > 0}
                    >
                      {isCurrentLoading ? (
                        <div className="loading-spinner">
                          <div className="spinner"></div>
                          Processing...
                        </div>
                      ) : ownedCount > 0 ? (
                        '✓'
                      ) : (
                        <div className="booster-price">
                          <span className="price-number">{booster.price}</span>
                          <img src="/starii.png" alt="Stars" className="stars-icon" />
                        </div>
                      )}
                    </button>
                  </div>
                  
                  <div className="booster-content">
                    <div className="booster-icon">
                      <img src="/usdt.svg" alt="USDT" className="usdt-icon-small" />
                    </div>
                    <div className="booster-earnings">
                      <span className="earnings-amount">+{booster.usdtPerHour} USDT</span>
                      <span className="earnings-period">per hour</span>
                    </div>
                    
                    {ownedCount > 0 && (
                      <div className="owned-count">
                        Owned: <strong>{ownedCount}</strong>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Сообщение о результате покупки */}
      {purchaseSuccess && (
        <div className="purchase-message">
          {purchaseSuccess}
        </div>
      )}

      {/* Модальное окно вывода с бустеров */}
      {isWithdrawModalOpen && (
        <div className="withdraw-modal-overlay" onClick={handleCancelWithdraw}>
          <div className="withdraw-modal" onClick={(e) => e.stopPropagation()}>
            <div className="withdraw-modal-header">
              <h3>Withdraw Boosters Earnings</h3>
              <button className="close-button" onClick={handleCancelWithdraw}>×</button>
            </div>
            
            <div className="withdraw-modal-content">
              <div className="withdraw-balance-info">
                <p>Available from Boosters: <strong>{accumulatedUSDT.toFixed(4)} USDT</strong></p>
                <p className="withdraw-fee">Minimum withdrawal: 10 USDT</p>
                <p className="withdraw-total">
                  You will receive: <strong>{accumulatedUSDT.toFixed(4)} USDT</strong>
                </p>
                <p className="boosters-note">
                  💫 This is USDT earned from your active boosters
                </p>
              </div>
              
              <div className="withdraw-modal-actions">
                <button 
                  className="confirm-withdraw-button"
                  onClick={handleWithdrawBoosters}
                  disabled={accumulatedUSDT < 10 || processing}
                >
                  {processing ? 'Processing...' : 'Confirm Withdrawal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="boosters-bottom-section">
        <Menu />
      </div>
    </div>
  );
}

export default Boosters;