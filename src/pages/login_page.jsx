import React, { useState } from 'react';
import axios from "../axiosInstance";
import './login_page.css';
import logo from '../assets/logo.png';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify'; 
import 'react-toastify/dist/ReactToastify.css'; 
import { API_ENDPOINTS } from '../apiEndpoints';

function LoginPage() {
  const navigate = useNavigate();

  // State for form fields and UI feedback
  const [form, setForm] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');

  // Handle input changes for all form fields
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Validate form fields before submitting
  const validate = () => {
    const newErrors = {};
    if (!form.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) {
      newErrors.email = "Invalid email";
    }
    if (form.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    return newErrors;
  };

  // Handle form submission for login
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);
    
    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      setSuccess('');

      // Show loading toast while logging in
      toast.info('Logging in...', { 
        position: "top-center", 
        autoClose: 2000, 
        hideProgressBar: true 
      });
      
      try {
        console.log('🔍 Attempting login for:', form.email);
        
        const res = await axios.post(API_ENDPOINTS.TOKEN, { 
          email: form.email, 
          password: form.password 
        });
        
        console.log('✅ SUCCESS! Backend response:', res.data);
        console.log('✅ Status:', res.status);
        
        if (res.status === 200 && res.data) {
          const { access, refresh } = res.data;
          
          // it will Store the tokens in localStorage
          localStorage.setItem("access_token", access);
          localStorage.setItem("refresh_token", refresh);
          localStorage.setItem("user_info", JSON.stringify({ email: form.email }));

          // Show the success toast and redirect
          toast.success('🎉 Login successful!', { 
            position: "top-center", 
            hideProgressBar: true 
          });
          
          setSuccess("✅ Login successful!");
          setErrors({});

          // Redirect to all products page after login
          setTimeout(() => {
            navigate("/allproducts");
          }, 1000);
        }
        
      } catch (err) {
        console.log('❌ Frontend error:', err);
        console.log('🔍 Error response:', err.response?.data);
        console.log('🔍 Error status:', err.response?.status);
        
        //  Added error toasts
        if (err.response) {
          if (err.response.status === 403) {
            toast.warn('⏳ Account not approved by admin yet.', { 
              position: "top-center", 
              hideProgressBar: true 
            });
            setErrors({ api: "⏳ Account not approved by admin yet." });
          } else if (err.response.status === 401) {
            toast.error('❌ Invalid email or password!', { 
              position: "top-center", 
              hideProgressBar: true 
            });
            setErrors({ api: "❌ Invalid email or password!" });
          } else {
            toast.error('❌ Login failed!', { 
              position: "top-center", 
              hideProgressBar: true 
            });
            setErrors({ api: `❌ Error: ${err.response.data?.error || 'Login failed'}` });
          }
        } else {
          toast.error('❌ Cannot connect to server!', { 
            position: "top-center", 
            hideProgressBar: true 
          });
          setErrors({ api: "❌ Cannot connect to server. Please try again later." });
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="login-page">
      <ToastContainer /> {/* Toast notifications  */}
      <div className='logo'>
        <img src={logo} alt="SwapEx Logo" className="logo" />
      </div>
      <div className="login-content">
        <h1>Login to SwapEx</h1>
        {/* Login form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email ID</label>
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
            <label>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="input"
            />
            {errors.password && <span style={{color: 'red'}}>{errors.password}</span>}
          </div>

          {/* Show API or validation errors */}
          {errors.api && <div style={{color: 'red', marginBottom: '10px'}}>{errors.api}</div>}
          {/* Show success message */}
          {success && <div style={{color: 'green', marginBottom: '10px'}}>{success}</div>}

          {/* Submit button */}
          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          {/* Forgot password link */}
          <a href="forgot-password" className="forgot-password" onClick={(e) => {e.preventDefault(); navigate('/forgot-password');}}>
            Forgot Password?
          </a>
        </form>
        <p style={{ textAlign: 'center', marginTop: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          Don't have an account?
          <span
            style={{ color: '#2E1F6F', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600, fontSize: '16px', background: 'none', border: 'none', padding: 0, marginTop: 0, display: 'inline' }}
            onClick={() => navigate('/signup')}
            tabIndex={0}
            role="button"
            onKeyPress={e => { if (e.key === 'Enter') navigate('/signup'); }}
          >
            Sign Up
          </span>
        </p>
      </div>
      <Footer />
    </div>
  );
}

export default LoginPage;