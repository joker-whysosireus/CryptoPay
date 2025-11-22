import './Boosters.css';
import Menu from "../../assets/Menus/Menu/Menu";
import UserHeader from '../../assets/UserHeader/UserHeader';
import { useState, useEffect } from 'react';

function Boosters({ userData, updateUserData }) {
  const [webApp, setWebApp] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedBooster, setSelectedBooster] = useState(null);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [processing, setProcessing] = useState(false);
  
  // Состояние для накопленных USDT
  const [accumulatedUSDT, setAccumulatedUSDT] = useState(0);
  const [totalHourlyEarnings, setTotalHourlyEarnings] = useState(0);

  // Список бустеров
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
      const webAppInstance = window.Telegram.WebApp;
      setWebApp(webAppInstance);
      webAppInstance.expand();
      webAppInstance.enableClosingConfirmation();
    }

    // Загружаем накопленные USDT из localStorage
    const savedUSDT = localStorage.getItem('boostersAccumulatedUSDT');
    if (savedUSDT) {
      setAccumulatedUSDT(parseFloat(savedUSDT));
    }

    // Пересчитываем общий доход в час
    const total = calculateTotalHourlyEarnings();
    setTotalHourlyEarnings(total);

    // Запускаем интервал для накопления USDT в реальном времени
    const interval = setInterval(() => {
      setAccumulatedUSDT(prev => {
        const newValue = prev + (total / 3600);
        localStorage.setItem('boostersAccumulatedUSDT', newValue.toString());
        return newValue;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [userData]);

  // Рассчитываем общий доход в час от всех активных бустеров
  const calculateTotalHourlyEarnings = () => {
    if (!userData) return 0;
    
    let total = 0;
    boostersList.forEach(booster => {
      if (userData[booster.dbColumn]) {
        total += booster.usdtPerHour;
      }
    });
    return total;
  };

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
        timestamp: Date.now()
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

  // Обработчик покупки бустера
  const handleBuyBooster = async (booster) => {
    if (!webApp) {
      console.error('Telegram WebApp not available');
      return;
    }

    setIsLoading(true);
    setSelectedBooster(booster);

    try {
      const invoiceLink = await createBoosterInvoice(booster);
      
      webApp.openInvoice(invoiceLink, async (status) => {
        if (status === "paid") {
          try {
            const payload = JSON.stringify({
              item_id: booster.id,
              user_id: webApp.initDataUnsafe?.user?.id?.toString(),
              timestamp: Date.now()
            });

            const verificationResult = await verifyBoosterPayment(payload);
            
            if (verificationResult.success) {
              // Автоматически обновляем данные пользователя после успешной покупки
              setTimeout(async () => {
                await updateUserData();
              }, 1000);
            } else {
              console.error('Payment verification failed');
            }
            
          } catch (error) {
            console.error('Error processing booster payment:', error);
          }
        }
        
        setIsLoading(false);
        setSelectedBooster(null);
      });

    } catch (error) {
      console.error('Error in booster purchase:', error);
      setIsLoading(false);
      setSelectedBooster(null);
    }
  };

  // Проверяем, есть ли у пользователя бустер
  const hasBooster = (boosterId) => {
    const booster = boostersList.find(b => b.id === boosterId);
    if (!booster || !userData) return false;
    return userData[booster.dbColumn] || false;
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
      await sendBoostersWithdrawalNotification(userData, accumulatedUSDT.toFixed(4));

      setAccumulatedUSDT(0);
      localStorage.setItem('boostersAccumulatedUSDT', '0');
      
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

  const isWithdrawEnabled = accumulatedUSDT >= 10;

  return (
    <div className="boosters-container">
      <UserHeader userData={userData} updateUserData={updateUserData} />

      <div className="boosters-content">
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

        <div className="boosters-section">
          <h2 className="boosters-title">Available Boosters</h2>
          <p className="boosters-subtitle">Buy boosters to earn USDT automatically every hour</p>
          
          <div className="boosters-grid">
            {boostersList.map((booster) => {
              const hasActiveBooster = hasBooster(booster.id);
              const isCurrentLoading = isLoading && selectedBooster?.id === booster.id;
              
              return (
                <div key={booster.id} className="booster-card">
                  <div className="booster-header">
                    <div className="booster-name">{booster.name}</div>
                    <button 
                      className={`booster-buy-button ${isCurrentLoading ? 'loading' : ''} ${hasActiveBooster ? 'purchased' : ''}`}
                      onClick={() => handleBuyBooster(booster)}
                      disabled={isLoading || hasActiveBooster}
                    >
                      {isCurrentLoading ? (
                        <div className="loading-spinner">
                          <div className="spinner"></div>
                          Processing...
                        </div>
                      ) : hasActiveBooster ? (
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
                    
                    <div className="booster-status">
                      {hasActiveBooster ? (
                        <div className="active-status">ACTIVE</div>
                      ) : (
                        <div className="inactive-status">INACTIVE</div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

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