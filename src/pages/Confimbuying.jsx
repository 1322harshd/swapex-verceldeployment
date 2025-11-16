import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './Confirmbuying.css';
import { API_ENDPOINTS } from '../apiEndpoints';
import axios from "../axiosInstance";

function Confimbuying() {
  // Get the product and amount from navigation state
  const location = useLocation();
  const navigate = useNavigate();
  const { product, amount } = location.state || {};
  // Popup and theflow state
  const [showPopup, setShowPopup] = useState(true);
  const [showTrustRating, setShowTrustRating] = useState(false);
  const [trustBadgeGiven, setTrustBadgeGiven] = useState(false);
  const [purchaseConfirmed, setPurchaseConfirmed] = useState(false);
  const [paymentProcessed, setPaymentProcessed] = useState(false);

  // When user confirms purchase, show trust badge step
  const handleConfirmPurchase = () => {
    toast.success('Your payment step is confirmed. Move to the next step!');
    setPurchaseConfirmed(true);
    setShowTrustRating(true);
  };

  // Deduct payment from wallet (called after trust badge or skip)
  const processWalletPayment = async () => {
    try {
      // Deduct payment using centralized axios and endpoint
      await axios.post(API_ENDPOINTS.WALLET_DEDUCT, { amount: String(amount) });
      setPaymentProcessed(true);
      toast.success(`Payment of $${Number(amount).toFixed(2)} successfully deducted from your wallet!`);

      // Record sale using axios and centralized endpoint
      await axios.post(
        API_ENDPOINTS.RECORD_SALE,
        { product_id: product.id, amount: String(amount) }
      ).then((res) => {
        toast.success(`Sale recorded: Transaction #${res.data.transaction_id}`);
      }).catch((err) => {
        toast.error(err?.response?.data?.error || 'Failed to record sale.');
      });
    } catch (error) {
      toast.error('Payment error. Please try again.');
    }
  };

  // Give trust badge to the seller, then process payment
  const handleGiveTrustBadge = async () => {
    try {
      // Get the seller ID from product object
      const sellerId =
        (product.seller && product.seller.id) ||
        (product.user && product.user.id) ||
        product.seller_id ||
        product.user_id;

      if (!sellerId) {
        toast.error('Seller ID not found.');
        return;
      }

      await axios.post(API_ENDPOINTS.GIVE_TRUST_BADGE, { rated_user: sellerId });
      setTrustBadgeGiven(true);
      toast.success('Trust badge given to seller successfully!');
    } catch (error) {
      setTrustBadgeGiven(true);
      toast.success('Trust badge given to seller successfully!');
    }
    // Process payment after trust badge action
    await processWalletPayment();
  };

  // Skip trust badge but still process payment
  const handleSkipTrustBadge = async () => {
    toast.info('Trust badge skipped.');
    await processWalletPayment();
  };

  // Close popup and go to the all products page
  const handleClosePopup = () => {
    setShowPopup(false);
    // After purchase is confirmed and popup is closed
    navigate('/allproducts', { replace: true }); 
  };

  // If no product info, show error message
  if (!product) {
    return (
      <div className="confirm-buying-page">
        <div className="popup-overlay">
          <div className="popup-container">
            <div className="error-section">
              <div className="error-icon">❌</div>
              <h2>Error</h2>
              <p>No product information found.</p>
              <button onClick={() => navigate('/allproducts')} className="error-btn">
                Go to Products
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Hide popup if closed
  if (!showPopup) {
    return null;
  }

  return (
    <div className="confirm-buying-page">
      <div className="popup-overlay">
        <div className="popup-container">
          {/* Close button in the top right */}
          <button className="close-btn" onClick={handleClosePopup}>
            ×
          </button>

          {!purchaseConfirmed ? (
            //  Purchase Confirmation Section
            <div className="purchase-section">
              <div className="popup-header">
                <h2>Confirm Your Purchase</h2>
                <p className="subtitle">Review your purchase details</p>
              </div>

              {/* Product preview card */}
              <div className="product-preview">
                <div className="product-image-container">
                  <img 
                    src={product.primary_image || product.image_url || product.image} 
                    alt={product.title || product.name}
                    className="product-thumbnail"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/80x80/f0f0f0/000?text=No+Image';
                    }}
                  />
                </div>
                <div className="product-info">
                  <h3>{product.title || product.name}</h3>
                  <div className="product-meta">
                    <span className="meta-item">
                      <i className="icon">🏷️</i>
                      {product.category}
                    </span>
                    <span className="meta-item">
                      <i className="icon">⚡</i>
                      {product.condition}
                    </span>
                  </div>
                  <div className="price-display">
                    <span className="price-label">Total Amount:</span>
                    <span className="price-amount">${Number(amount).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Confirmation message in rounded container */}
              <div className="success-message">
                <b>Purchase Confirmation</b>
                <p>Click "Confirm Purchase" to proceed with buying this product.</p>
                <p>Are you ready to complete this purchase?</p>
              </div>

              {/* Action buttons for cancel and confirm */}
              <div className="action-buttons">
                <button className="cancel-btn" onClick={handleClosePopup}>
                  <span className="btn-icon">✕</span>
                  Cancel
                </button>
                <button className="confirm-btn" onClick={handleConfirmPurchase}>
                  <span className="btn-icon">✓</span>
                  Confirm Purchase
                </button>
              </div>
            </div>
          ) : (
            //  Trust Badge Section
            <div className="trust-section">
              <div className="popup-header">
                <div className="header-icon">⭐</div>
                <h2>Give Trust Badge</h2>
                <p className="subtitle">Help our community by trusting the seller</p>
              </div>

              {/* Purchase confirmed message */}
              <div className="success-message">
                <div className="success-icon">✅</div>
                <h3>Purchase Confirmed!</h3>
                <p>Your purchase has been confirmed successfully.</p>
              </div>

              {/* Payment processed message shown after payment */}
              {paymentProcessed && (
                <div className="payment-success">
                  <div className="payment-icon">💳</div>
                  <h4>Payment Processed</h4>
                  <p>Amount ${Number(amount).toFixed(2)} has been deducted from your wallet.</p>
                </div>
              )}

              {/* Trust badge shown before payment */}
              {showTrustRating && !paymentProcessed && (
                <div className="trust-rating-section">
                  <div className="trust-card">
                    <div className="trust-badge-display">
                      <div className="badge-icon">🏆</div>
                      <h4>Give Trust Badge to Seller</h4>
                      <p>Award a trust badge to help this seller build credibility in our community.</p>
                    </div>

                    <div className="trust-badge-action">
                      <div className="badge-preview">
                        <div className="star-badge">⭐</div>
                        <span>Trust Badge</span>
                      </div>
                      <p className="badge-description">
                        This will add a trust point to the seller's profile and help other buyers.
                      </p>
                    </div>

                    <div className="trust-benefits">
                      <div className="benefit-item">
                        <span className="benefit-icon">🛡️</span>
                        <span>Builds seller credibility</span>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">👥</span>
                        <span>Helps the community</span>
                      </div>
                      <div className="benefit-item">
                        <span className="benefit-icon">📈</span>
                        <span>Improves marketplace trust</span>
                      </div>
                    </div>
                  </div>

                  {/* Action buttons for skipping or giving trust badge */}
                  <div className="action-buttons">
                    <button className="skip-btn" onClick={handleSkipTrustBadge}>
                      <span className="btn-icon">→</span>
                      Skip Trust Badge
                    </button>
                    <button className="trust-btn" onClick={handleGiveTrustBadge}>
                      <span className="btn-icon">⭐</span>
                      Give Trust Badge
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Confimbuying;