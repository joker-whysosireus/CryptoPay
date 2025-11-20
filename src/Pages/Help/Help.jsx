import Menu from "../../assets/Menus/Menu/Menu";
import UserHeader from "../../assets/UserHeader/UserHeader";
import './Help.css';

function Help({ userData }) {
  const handleInviteClick = () => {
    const telegramUserId = userData?.telegram_user_id;
    
    // Если нет userData, все равно показываем сообщение
    const message = "Join this app and start earning USDT for watching ads! 🎉";
    const startAppValue = telegramUserId ? `ref_${telegramUserId}` : 'ref_default';
    
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(`https://t.me/watch_and_earn_usdt_bot?startapp=${startAppValue}`)}&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  // Используем данные из userData или значения по умолчанию
  const referralsCount = userData?.referrals_count || 0;
  const referralsEarned = userData?.referrals_earned || '0.000';

  return (
    <div className="help-container">
      <UserHeader userData={userData} />

      <div className="help-content">
        <div className="help-referral-card">
          <div className="help-referral-icon">🎁</div>
          <div className="help-referral-title">Invite Friends</div>
          <div className="help-referral-description">
            For each invited friend you get <span className="help-highlight">0.05 USDT</span>
          </div>
        </div>

        <div className="help-stats">
          <div className="help-stat-item">
            <div className="help-stat-number">{referralsCount}</div>
            <div className="help-stat-label">Friends Invited</div>
          </div>
          <div className="help-stat-item">
            <div className="help-stat-number">{referralsEarned} USDT</div>
            <div className="help-stat-label">Earned</div>
          </div>
        </div>
      </div>

      <div className="help-bottom-section">
        <button className='help-invite-button' onClick={handleInviteClick}>
          Invite Friends
        </button>
        <Menu />
      </div>
    </div>
  );
}

export default Help;