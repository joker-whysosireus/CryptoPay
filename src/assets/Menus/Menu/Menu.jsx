import { Link, useLocation } from 'react-router-dom';
import './Menu.css';
import WalletGray from '../img-jsx/WalletGrey';
import WalletGreen from '../img-jsx/WalletGreen';
import HelpGray from '../img-jsx/HelpGray';
import HelpGreen from '../img-jsx/HelpGreen';
import LeaderGray from '../img-jsx/LeaderGray';

const Menu = ({ onEarnClick }) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const handleClick = (path) => (event) => {
    if (currentPath === path) {
      event.preventDefault(); 
    }
  };

  return (
      <div className="menu">
        <div className={`menu-item ${currentPath === '/help' ? 'active' : ''}`}>
          <Link to="/help" onClick={handleClick('/help')}>
            {currentPath === '/help' ? <HelpGreen /> : <HelpGray />}
            <span className="Name">
              Friends
            </span>
          </Link>
        </div>
        
        <div className={`menu-item ${currentPath === '/' ? 'active' : ''}`}>
          <Link to="/" onClick={handleClick('/')}>
              {currentPath === '/' ? <WalletGreen /> :  <WalletGray />}
              <span className="Name">
                Wallet
              </span>
          </Link>
        </div>
        
        {/* Новый блок Earn - не переходит на страницу */}
        <div className="menu-item earn-item">
          <div 
            className="menu-item-content" 
            onClick={onEarnClick}
            style={{ cursor: 'pointer' }}
          >
            <LeaderGray /> {/* Замените на вашу иконку */}
            <span className="Name">
              Soon...
            </span>
          </div>
        </div>
        
      </div>
  );
};

export default Menu;