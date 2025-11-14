import React, { useState } from 'react';
import axios from "../axiosInstance";
import './Forgot_password.css';
import logo from '../assets/logo.png';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import { API_ENDPOINTS } from '../apiEndpoints';

function ForgotPassword() {
  const navigate = useNavigate();

  // State for form fields and UI feedback
  const [form, setForm] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // handle the input changes for all form fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Validate form fields before submitting
  const validate = () => {
    const newErrors = {};
    if (!form.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      newErrors.email = "Invalid email";
    }
    if (form.newPassword.length < 6) {
      newErrors.newPassword = "Password must be at least 6 characters";
    }
    if (form.newPassword !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    return newErrors;
  };

  // Handle form submission for password reset
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      setSuccess('');
      
      // Show loading toast
      toast.info('Updating password...', { 
        position: "top-center", 
        autoClose: 2000, 
        hideProgressBar: true 
      });
      
      try {
        // it will Send the password reset request to backend
        const response = await axios.post(API_ENDPOINTS.FORGOT_PASSWORD, {
          email: form.email,
          new_password: form.newPassword,
        });

        console.log('✅ Password reset response:', response.data);

        const { message, status: responseStatus } = response.data;
        
        if (responseStatus === 'success') {
          // Show success toast and reset form
          toast.success(`✅ Password updated successfully!`, { 
            position: "top-center", 
            hideProgressBar: true 
          });
          
          setSuccess(`✅ ${message}`);
          setForm({
            email: '',
            newPassword: '',
            confirmPassword: '',
          });

          // Redirect to login after success
          setTimeout(() => {
            navigate('/login');
          }, 2000);
        }
      } catch (error) {
        console.error('Password reset error:', error.response);
        
        if (error.response && error.response.data) {
          const { message, status: errorStatus } = error.response.data;
          switch (errorStatus) {
            case 'user_not_found':
              toast.error(`👤 ${message}`, { 
                position: "top-center", 
                hideProgressBar: true 
              });
              setErrors({ api: `👤 ${message}` });
              break;
            case 'error':
              toast.error(`❌ ${message}`, { 
                position: "top-center", 
                hideProgressBar: true 
              });
              setErrors({ api: `❌ ${message}` });
              break;
            default:
              toast.error('❌ Password update failed!', { 
                position: "top-center", 
                hideProgressBar: true 
              });
              setErrors({ api: `❌ ${message || 'Password update failed. Please try again.'}` });
          }
        } else {
          toast.error('❌ Network error!', { 
            position: "top-center", 
            hideProgressBar: true 
          });
          setErrors({ api: "❌ Network error. Please try again." });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="forgot-password-page">
      <ToastContainer /> {/* Toast notifications */}
      <div className='logo'>
        <img src={logo} alt="SwapEx Logo" className="logo" />
      </div>
      <div className="forgot-password-content">
        <h1>Forgot Password</h1>
        {/* Password reset form */}
        <form className="forgot-password-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="input"
            />
            {errors.email && <span style={{color: 'red'}}>{errors.email}</span>}
          </div>

          <div className="form-group">
            <label>New Password</label>
            <input
              type="password"
              name="newPassword"
              value={form.newPassword}
              onChange={handleChange}
              placeholder="Enter new password (min 6 characters)"
              className="input"
            />
            {errors.newPassword && <span style={{color: 'red'}}>{errors.newPassword}</span>}
          </div>

          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={form.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm new password"
              className="input"
            />
            {errors.confirmPassword && <span style={{color: 'red'}}>{errors.confirmPassword}</span>}
          </div>

          {/* it Show API or validation errors */}
          {errors.api && <div style={{color: 'red', marginBottom: '10px'}}>{errors.api}</div>}
          {/* it Show success message */}
          {success && <div style={{color: 'green', marginBottom: '10px'}}>{success}</div>}

          {/* Submit button */}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Updating...' : 'Update Password'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <span
              style={{ color: '#2E1F6F', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600, fontSize: '16px', background: 'none', border: 'none', padding: 0 }}
              onClick={() => navigate('/login')}
              tabIndex={0}
              role="button"
              onKeyPress={e => { if (e.key === 'Enter') navigate('/login'); }}
            >
              Back to Login
            </span>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
}

export default ForgotPassword;