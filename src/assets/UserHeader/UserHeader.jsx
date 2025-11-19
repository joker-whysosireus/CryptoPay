import './UserHeader.css';
import { TonConnectButton, useTonAddress } from '@tonconnect/ui-react';
import { useEffect } from 'react';

function UserHeader({ userData, updateUserData }) {
  const userFriendlyAddress = useTonAddress();

  useEffect(() => {
    // Сохраняем адрес кошелька только если есть userData и адрес
    if (userFriendlyAddress && userData?.telegram_user_id) {
      saveWalletAddress(userData.telegram_user_id, userFriendlyAddress)
        .then(() => {
          console.log('Wallet address saved successfully');
          // Вызываем updateUserData после успешного сохранения
          if (updateUserData) {
            updateUserData();
          }
        })
        .catch(error => {
          console.error('Error saving wallet address:', error);
        });
    }
  }, [userFriendlyAddress, userData, updateUserData]);

  const saveWalletAddress = async (telegramUserId, walletAddress) => {
    try {
      const response = await fetch('https://cryptopayappbackend.netlify.app/.netlify/functions/save-wallet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          telegram_user_id: telegramUserId,
          wallet_address: walletAddress
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('Wallet address saved successfully');
        return result;
      } else {
        console.error('Error saving wallet address:', result.error);
        throw new Error(result.error || 'Failed to save wallet address');
      }
    } catch (error) {
      console.error('Error saving wallet address:', error);
      throw error;
    }
  };

  // Используем данные из userData или значения по умолчанию
  const avatar = userData?.avatar;
  const firstName = userData?.first_name || 'User';
  const username = userData?.username || 'username';

  return (
    <div className="user-header">
      <div className="user-info-section">
        <div className={`user-avatar ${!avatar ? 'no-avatar' : ''}`}>
          {avatar ? (
            <img 
              src={avatar} 
              alt="Avatar" 
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.classList.add('no-avatar');
              }}
            />
          ) : null}
        </div>
        <div className="user-details">
          <div className="user-first-name">{firstName}</div>
          <div className="user-username">@{username}</div>
        </div>
      </div>

      <div className="ton-connect-button-container">
        <TonConnectButton />
      </div>
    </div>
  );
}

export default UserHeader;