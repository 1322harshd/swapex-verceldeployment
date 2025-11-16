import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from '../axiosInstance';
import { API_ENDPOINTS } from '../apiEndpoints';
import './user_icon.css';

// Get backend base URL from environment
const BACKEND_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

function UserIcon() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [image, setImage] = useState(null);
  const fileInputRef = useRef(null);
  const menuRef = useRef(null);

  // Fetch profile image from backend on mount
  useEffect(() => {
    async function fetchProfile() {
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get(API_ENDPOINTS.CURRENT_USER_PROFILE, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.data && res.data.profile_image) {
          setImage(res.data.profile_image);
        }
      } catch (err) {
        setImage(null); // fallback to no image
      }
    }
    fetchProfile();
  }, []);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [menuOpen]);

  const handleIconClick = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleChangeProfileClick = () => {
    fileInputRef.current.click();
  };

  const handleProfileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('profile_image', file);
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.patch(API_ENDPOINTS.CURRENT_USER_PROFILE, formData, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
        if (res.data && res.data.profile_image) {
          setImage(res.data.profile_image);
        }
      } catch (err) {
        // handle error
      }
    }
  };

  // Function to get the appropriate image source
  const getImageSource = () => {
    if (image) {
      // User has a custom profile image
      return `${BACKEND_BASE_URL}${image}`;
    } else {
      // No custom image, use default from backend
      return `${BACKEND_BASE_URL}/media/profile_images/default.jpeg`;
    }
  };

  return (
    <div className="user-icon-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '120px', position: 'relative' }}>
      <img
        src={getImageSource()}
        alt="User Icon"
        className="user-icon-img"
        onClick={handleIconClick}
        style={{ cursor: 'pointer', borderRadius: '50%', width: '80px', height: '80px', objectFit: 'cover', display: 'block', margin: 'auto 0' }}
        onError={e => { 
          e.target.onerror = null; 
          e.target.src = "/logo.png"; // Final fallback to local logo
        }}
      />
      {menuOpen && (
        <div ref={menuRef} className="user-icon-menu" style={{ position: 'absolute', top: '100px', left: '50%', transform: 'translateX(-50%)', zIndex: 100 }}>
          <button onClick={handleLogout} className="user-icon-menu-btn">Logout</button>
          <button onClick={handleChangeProfileClick} className="user-icon-menu-btn">Change Profile Picture</button>
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleProfileChange}
          />
        </div>
      )}
    </div>
  );
}

export default UserIcon;
