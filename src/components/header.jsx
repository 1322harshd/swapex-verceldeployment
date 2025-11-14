import logo from '../assets/logo.png';
import './header.css';
import walletIcon from '../assets/wallet.png';
import UserIcon from './user_icon';

function Header() {
  return (
    <header className="site-header">
      <div className="header-top">
        <div className='logo'>
          <img src={logo} alt="SwapEx Logo" />
        </div>
        <div className="user-icon" aria-hidden="true">
          <UserIcon />
        </div>
      </div>
      <nav className='nav-bar'>
        <ul>
          <li><a href="/allproducts">All Products</a></li>
          <li><a href="/my-products">My Products</a></li>
          <li><a href="/favourite">Favourite</a></li>
        </ul>
        <a href="/wallet" className="wallet-link">
          <img src={walletIcon} alt="Wallet" className="wallet-icon" />
        </a>
      </nav>
    </header>
  );
}
export default Header;