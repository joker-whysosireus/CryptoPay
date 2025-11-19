import Menu from "../../assets/Menus/Menu/Menu";
import UserHeader from "../../assets/UserHeader/UserHeader";
import './Help.css';

function Help({ userData, userLanguage }) {
  const handleInviteClick = () => {
    const telegramUserId = userData?.telegram_user_id;
    if (!telegramUserId) {
      console.warn("Telegram User ID not found.");
      return;
    }

    const message = userLanguage !== 'ru' 
      ? "Join this app and start earning USDT for watching ads! 🎉"
      : "Присоединяйся к этому приложению и начинай зарабатывать USDT за просмотр рекламы! 🎉";
    
    const startAppValue = `ref_${telegramUserId}`; 
    const telegramUrl = `https://t.me/share/url?url=${encodeURIComponent(`https://t.me/your_bot?startapp=${startAppValue}`)}&text=${encodeURIComponent(message)}`;
    window.open(telegramUrl, '_blank');
  };

  const referralsCount = userData?.referrals_count || 0;
  const referralsEarned = userData?.referrals_earned || '0.000';

  // Тексты в зависимости от языка
  const texts = {
    inviteFriends: userLanguage !== 'ru' ? 'Invite Friends' : 'Приглашай друзей',
    inviteDescription: userLanguage !== 'ru' 
      ? 'For each invited friend you get <span class="help-highlight">0.001 USDT</span>'
      : 'За каждого приглашенного друга вы получаете <span class="help-highlight">0.001 USDT</span>',
    invitedFriends: userLanguage !== 'ru' ? 'Friends Invited' : 'Приглашено друзей',
    earned: userLanguage !== 'ru' ? 'Earned' : 'Заработано',
    inviteButton: userLanguage !== 'ru' ? 'Invite Friends' : 'Пригласить друзей'
  };

  return (
    <div className="help-container">
      <UserHeader userData={userData} userLanguage={userLanguage} />

      <div className="help-content">
        <div className="help-referral-card">
          <div className="help-referral-icon">🎁</div>
          <div className="help-referral-title">{texts.inviteFriends}</div>
          <div 
            className="help-referral-description"
            dangerouslySetInnerHTML={{ __html: texts.inviteDescription }}
          />
        </div>

        <div className="help-stats">
          <div className="help-stat-item">
            <div className="help-stat-number">{referralsCount}</div>
            <div className="help-stat-label">{texts.invitedFriends}</div>
          </div>
          <div className="help-stat-item">
            <div className="help-stat-number">{referralsEarned} USDT</div>
            <div className="help-stat-label">{texts.earned}</div>
          </div>
        </div>
      </div>

      <div className="help-bottom-section">
        <button className='help-invite-button' onClick={handleInviteClick}>
          {texts.inviteButton}
        </button>
        <Menu />
      </div>
    </div>
  );
}

export default Help;