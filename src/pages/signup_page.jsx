import React, { useState } from 'react';
import axios from "../axiosInstance";
import logo from '../assets/logo.png';
import '../index.css'; 
import './login_page.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { API_ENDPOINTS } from '../apiEndpoints';
import { useNavigate } from 'react-router-dom';

// Handles user signup form and validation
// Uses local state for form fields, image preview, and errors
// Validates input and submits signup data to backend API
// Displays error and success messages, including duplicate email/phone
// Includes navigation to login page

function SignupPage(){
    const navigate = useNavigate();
    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        studentIdImage: null,
        phone: '',
    });
    const [preview, setPreview] = useState(null);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        setForm({ ...form, studentIdImage: file });
        setPreview(file ? URL.createObjectURL(file) : null);
    };
    const validate = () => {
        const newErrors = {};
        if (!form.name.trim()) newErrors.name = "Name is required";
        if (!form.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) newErrors.email = "Invalid email";
        if (!form.studentIdImage) newErrors.studentIdImage = "Student ID image required";
        if (!form.phone.match(/^\d{10}$/)) newErrors.phone = "Enter a valid 10-digit phone number";
        if (form.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (form.password !== form.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
        return newErrors;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        setErrors(validationErrors);

        if (Object.keys(validationErrors).length === 0) {
            setLoading(true);
            toast.info('Signing up...', { position: "top-center", autoClose: 2000, hideProgressBar: true});
            setSuccess('');
            try {
                const formData = new FormData();
                formData.append('first_name', form.name); 
                formData.append('email', form.email);
                formData.append('password', form.password);
                formData.append('phone_number', form.phone);
                formData.append('student_id_image', form.studentIdImage);

                const response = await axios.post(API_ENDPOINTS.SIGNUP, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                });
                toast.success('Signup successful!', { position: "top-center",hideProgressBar: true});
                setSuccess('Signup successful!');
                setForm({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    studentIdImage: null,
                    phone: '',
                });
                setPreview(null);
            } catch (error) {
                let errorMsg = 'Signup failed. Please try again.';
                if (error.response?.data) {
                    if (error.response.data.email) {
                        errorMsg = 'An account with this email already exists.';
                        setErrors({ email: errorMsg });
                    } else if (error.response.data.phone_number) {
                        errorMsg = 'This phone number is already registered.';
                        setErrors({ phone: errorMsg });
                    } else {
                        errorMsg = error.response.data.message || errorMsg;
                        setErrors({ api: errorMsg });
                    }
                } else {
                    setErrors({ api: errorMsg });
                }
                toast.error(errorMsg, { position: "top-center",hideProgressBar: true});
                console.log(error.response);
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="login-page">
            <ToastContainer />
            <div className='logo'>
                <img src={logo} alt="SwapEx Logo" className="logo" />
            </div>
            <div className="login-content">
                <h1>Sign Up</h1>
                <form className="login-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Name</label>
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            className="input"
                            placeholder="Enter your name"
                        />
                        {errors.name && <span style={{color: 'red'}}>{errors.name}</span>}
                    </div>
                    <div className="form-group">
                        <label>Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            className="input"
                            placeholder="Enter your email"
                        />
                        {errors.email && <span style={{color: 'red'}}>{errors.email}</span>}
                    </div>
                    <div className="form-group">
                        <label>Student ID (Upload Image)</label>
                        <input
                            type="file"
                            name="studentIdImage"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="input"
                            placeholder="Upload your student ID image"
                        />
                        {preview && (
                            <img src={preview} alt="Student ID Preview" style={{width: '220px', marginTop: '8px', borderRadius: '4px'}} />
                        )}
                        {errors.studentIdImage && <span style={{color: 'red'}}>{errors.studentIdImage}</span>}
                    </div>
                    <div className="form-group">
                        <label>Phone Number</label>
                        <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            className="input"
                            placeholder="Enter your 10-digit phone number"
                        />
                        {errors.phone && <span style={{color: 'red'}}>{errors.phone}</span>}
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            className="input"
                            placeholder="Enter your password"
                        />
                        {errors.password && <span style={{color: 'red'}}>{errors.password}</span>}
                    </div>
                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            className="input"
                            placeholder="Re-enter your password"
                        />
                        {errors.confirmPassword && <span style={{color: 'red'}}>{errors.confirmPassword}</span>}
                    </div>
                    <button type="submit" className="btn" >
                        Sign Up
                    </button>
                </form>
                <p style={{ textAlign: 'center', marginTop: '18px' }}>
                    Already have an account?{' '}
                    <span
                        style={{ color: '#2E1F6F', cursor: 'pointer', textDecoration: 'underline', fontWeight: 600 }}
                        onClick={() => navigate('/login')}
                        tabIndex={0}
                        role="button"
                        onKeyPress={e => { if (e.key === 'Enter') navigate('/login'); }}
                    >
                        Login
                    </span>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;