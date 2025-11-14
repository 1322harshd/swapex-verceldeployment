import React, { useState, useEffect } from 'react';
import Header from '../components/header';
import Footer from '../components/Footer';
import './wallet.css';
import { toast } from "react-toastify";
import { API_ENDPOINTS } from '../apiEndpoints';
import axios from "../axiosInstance";

function Wallet() {
  // State for the form fields, loading status, and wallet balance
  const [form, setForm] = useState({
    cardNumber: '',
    name: '',
    expiry: '',
    cvc: '',
    amount: ''
  });
  const [loading, setLoading] = useState(false);
  const [walletAmount, setWalletAmount] = useState(null);

  // Validation helpers for card number, CVC, and expiry date
  const isCardNumberValid = (num) => /^\d{4}-\d{4}-\d{4}-\d{4}$/.test(num);
  const isCvcValid = (cvc) => /^\d{3}$/.test(cvc);
  const isExpiryValid = (exp) => /^(0[1-9]|1[0-2])\/\d{2}$/.test(exp);

  // here fetch wallet balance 
  useEffect(() => {
    const fetchWalletAmount = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(API_ENDPOINTS.WALLET_BALANCE, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = response.data;
        setWalletAmount(data.wallet_amount);
      } catch (error) {
        setWalletAmount(null);
      }
    };
    fetchWalletAmount();
  }, []);

  // input changes and formatting for card fields
  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      // Format card number as xxxx-xxxx-xxxx-xxxx
      let digits = value.replace(/\D/g, '').slice(0, 16);
      let formatted = digits.replace(/(.{4})/g, '$1-').replace(/-$/, '');
      setForm({ ...form, cardNumber: formatted });
      return;
    }
    if (name === 'cvc') {
      // Only allow up to 3 digits for CVC
      if (!/^\d{0,3}$/.test(value)) return;
    }
    if (name === 'expiry') {
      // Auto-insert slash for expiry date
      if (
        value.length > 5 ||
        (value.length === 2 && form.expiry.length === 1 && !value.includes('/'))
      ) {
        setForm({ ...form, [name]: value + '/' });
        return;
      }
    }
    setForm({ ...form, [name]: value });
  };

  // Add money to wallet by calling backend API
  const addMoneyToWallet = async (amount) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.post(API_ENDPOINTS.WALLET_ADD, {
        amount: String(amount)
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (response.ok) {
        toast.success(`Money added! New wallet balance: $${data.wallet_amount} if you want you can leave the page for further operations or add more funds.`);
        setForm({ ...form, amount: '' });
        setWalletAmount(data.wallet_amount); 
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
    }
    setLoading(false);
  };

  //  form for submission and validate all fields
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isCardNumberValid(form.cardNumber)) {
      toast('Card number must be exactly 16 digits (xxxx-xxxx-xxxx-xxxx).');
      return;
    }
    if (!form.name.trim()) {
      toast('Please enter the name on the card.');
      return;
    }
    if (!isExpiryValid(form.expiry)) {
      toast('Expiry date must be in MM/YY format.');
      return;
    }
    if (!isCvcValid(form.cvc)) {
      toast('CVC must be exactly 3 digits.');
      return;
    }
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) {
      toast('Please enter a valid amount.');
      return;
    }
    addMoneyToWallet(form.amount);
  };

  return (
    <div>
      <Header />
      <main className="wallet-main">
        <div className="wallet-form-container">
          <h2>Payment</h2>
          <p>Add Money in Your Wallet</p>
          <p>
            <b>Available Balance:</b>{" "}
            {walletAmount !== null ? `$${walletAmount}` : "Loading..."}
          </p>
          {/* Payment form for adding money to wallet */}
          <form className="wallet-form" onSubmit={handleSubmit}>
            <label>Enter Card Number</label>
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={form.cardNumber}
              onChange={handleChange}
              autoComplete="cc-number"
              maxLength={19} 
              inputMode="numeric"
            />

            <label>Name on card</label>
            <input
              type="text"
              name="name"
              placeholder="Name on Card"
              value={form.name}
              onChange={handleChange}
              autoComplete="cc-name"
            />

            <div className="wallet-form-row">
              <div>
                <label>Expiry Date</label>
                <input
                  type="text"
                  name="expiry"
                  placeholder="MM/YY"
                  value={form.expiry}
                  onChange={handleChange}
                  autoComplete="cc-exp"
                  maxLength={5}
                  inputMode="numeric"
                />
              </div>
              <div>
                <label>CVC Number</label>
                <input
                  type="text"
                  name="cvc"
                  placeholder="CVC"
                  value={form.cvc}
                  onChange={handleChange}
                  autoComplete="cc-csc"
                  maxLength={3}
                  inputMode="numeric"
                />
              </div>
            </div>

            <label>Enter Amount</label>
            <input
              type="number"
              name="amount"
              placeholder="Amount"
              value={form.amount}
              onChange={handleChange}
              min="1"
              step="any"
              autoComplete="off"
            />

            {/* Submit button for payment */}
            <button type="submit" className="pay-btn" disabled={loading}>
              {loading ? 'Processing...' : 'Pay'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Wallet;