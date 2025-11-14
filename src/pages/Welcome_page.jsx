import React, { useState } from 'react';
import './Welcome_page.css';
import logo from '../assets/logo.png';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

function WelcomePage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // login button click show loading, then navigate to login page
  const handleLoginClick = () => {
    setLoading(true);
    setTimeout(() => {
      navigate('/login');
      setLoading(false);
    }, 300); 
  };

  // signUp button click show loading, then navigate to the signup page
  const handleSignupClick = () => {
    setLoading(true);
    setTimeout(() => {
      navigate('/signup');
      setLoading(false);
    }, 300);
  };

  return (
    <div className="welcome-page">
        <div className='logo'>
             <img src={logo} alt="SwapEx Logo" className="logo" />
           </div>
      <div className="welcome-content">
        {/* Main welcome heading */}
        <h1>Welcome to SwapEx</h1>
        {/* Login and SignUp buttons */}
        <div className="buttons">
          <button 
            className="btn" 
            onClick={handleLoginClick}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'Login'}
          </button>
          <button 
            className="btn" 
            onClick={handleSignupClick}
            disabled={loading}
          >
            {loading ? 'Loading...' : 'SignUp'}
          </button>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}

export default WelcomePage;