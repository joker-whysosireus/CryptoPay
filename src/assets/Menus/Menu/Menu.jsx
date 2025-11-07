import { Link, useLocation } from 'react-router-dom';
import './Menu.css';
import WalletGray from '../img-jsx/WalletGrey';
import WalletGreen from '../img-jsx/WalletGreen';
import HelpGray from '../img-jsx/HelpGray';
import HelpGreen from '../img-jsx/HelpGreen';
import HistoryGreen from '../img-jsx/HistoryGreen';
import HistoryAnother from '../img-jsx/HistoryAnother';

const Menu = () => {
  const location = useLocation();
  const currentPath = location.pathname;

  const handleClick = (path) => (event) => {
    if (currentPath === path) {
      event.preventDefault(); 
    }
  };

  return (
      <div className="menu">
        <div className={`menu-item ${currentPath === '/' ? 'active' : ''}`}>
          <Link to="/" onClick={handleClick('/')}>
              {currentPath === '/' ? <WalletGreen /> :  <WalletGray />}
              <span className="Name">
                Кошелек
              </span>
          </Link>
        </div>
        <div className={`menu-item ${currentPath === '/help' ? 'active' : ''}`}>
          <Link to="/help" onClick={handleClick('/help')}>
            {currentPath === '/help' ? <HelpGreen /> : <HelpGray />}
            <span className="Name">
              Помощь
            </span>
          </Link>
        </div>
        <div className={`menu-item ${currentPath === '/history' ? 'active' : ''}`}>
          <Link to="/history" onClick={handleClick('/history')}>
            {currentPath === '/history' ? <HistoryGreen /> : <HistoryAnother />}
            <span className="Name">
              История
            </span>
          </Link>
        </div>
      </div>
  );
};

export default Menu;