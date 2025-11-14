import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from "../axiosInstance";
import { API_ENDPOINTS } from "../apiEndpoints";
import './Product_buypage.css';
import Header from '../components/header'; 
import Footer from '../components/Footer';

const BASE = import.meta.env.VITE_API_PRODUCTS_URL || "http://127.0.0.1:8000";
const API = `${BASE}/api/products/`;

function Product_buypage(props) {
  // support :productId, :id or :product_id route param names
  const params = useParams();
  const productId = params.productId ?? params.id ?? params.product_id;
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [sellerDetails, setSellerDetails] = useState(null);
  const [favoriteId, setFavoriteId] = useState(null);

  // Fetch product only (seller is nested)
  useEffect(() => {
    console.log("ProductBuyPage mounted, params productId:", productId);
    const token = localStorage.getItem("access_token");
    console.log("access_token present:", !!token);

    const fetchProduct = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('access_token');
        const productResponse = await axios.get(`${API}${productId}/`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setProduct(productResponse.data);
        setSellerDetails(productResponse.data.seller || null);
        setError(null);
      } catch (err) {
        setError('Product not found');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchProduct();
    } else {
      setError('Invalid product ID');
      setLoading(false);
    }
  }, [productId]);

  // Check if product is already in favorites
  useEffect(() => {
    if (!product) return;
    const favorites = JSON.parse(localStorage.getItem('favoriteProducts') || '[]');
    const isProductFavorite = favorites.some(fav => fav.id === product.id);
    setIsFavorite(isProductFavorite);
  }, [product]);
 
  // Get current logged-in user
  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.CURRENT_USER_PROFILE);
        setUser(response.data);
      } catch (err) {
        // Ignore user fetch error
      }
    };

    getCurrentUser();
  }, []);

  // Load favorite status from server
  useEffect(() => {
    const loadFavoriteStatus = async () => {
      try {
        const res = await axios.get(`${API_ENDPOINTS.WALLET_BALANCE.replace('/wallet/', '/favorites/')}`);
        const fav = res.data.find(f => f.product && (f.product.id === product?.id));
        if (fav) {
          setIsFavorite(true);
          setFavoriteId(fav.id);
        } else {
          setIsFavorite(false);
          setFavoriteId(null);
        }
      } catch (err) {
        // Ignore favorite status load error
      }
    };

    if (product) loadFavoriteStatus();
  }, [product]);

  // Handle adding/removing from favorites
  const handleFavoriteClick = async () => {
    try {
      if (isFavorite && favoriteId) {
        await axios.delete(`${API_ENDPOINTS.WALLET_BALANCE.replace('/wallet/', '/favorites/')}${favoriteId}/`);
        setIsFavorite(false);
        setFavoriteId(null);
      } else {
        const res = await axios.post(`${API_ENDPOINTS.WALLET_BALANCE.replace('/wallet/', '/favorites/')}`, { product_id: product.id });
        setIsFavorite(true);
        setFavoriteId(res.data.id);
      }
      window.dispatchEvent(new Event('favoritesUpdated'));
    } catch (err) {
      // Ignore favorite toggle error
    }
  };
 
  // Loading state
  if (loading) {
    return (
      <div className="product-buy-page">
        <Header />
        <div className="loading-container">
          <p>Loading product details...</p>
        </div>
        <Footer />
      </div>
    );
  }

  // Error state
  if (error || !product) {
    return (
      <div className="product-buy-page">
        <Header />
        <div className="error-container">
          <p>{error || 'Product not found'}</p>
          <button onClick={() => navigate('/allproducts')}>Back to Products</button>
        </div>
        <Footer />
      </div>
    );
  }

  // Handle Buy button 
  const handleBuyClick = () => {
    navigate('/confirm-buying', {
      state: { 
        product: product,
        action: 'purchase',
        amount: product.price
      }
    });
  };

  // Dummy handlers for disabled functionality
  const handleChatClick = () => {
    if (!product) return;
    // navigate to the chat page for this product (pass product in state)
    navigate(`/product/${product.id}/chat`, { state: { product } });
  };

  // Handle field names from Django API
  const productName = product?.title || product?.name || 'Unknown Product';
  const productImage = product?.primary_image || product?.image_url || product?.image;
  const productPrice = product?.price || 0;
  const productBrand = product?.brand;
  const productModel = product?.model;

  return (
    <div className="product-buy-page">
      <Header />
      <main className="main-content">
        <div className="product-container">
          <div className="product-image-box">
            <img 
              src={productImage} 
              alt={productName}
              onError={(e) => {
                e.target.src = 'https://via.placeholder.com/240x240/f0f0f0/000?text=No+Image';
              }}
            />
          </div>

          <div className="product-info-box">
            <h3 className="product-info-heading">Product Information</h3>
            <div className="product-info">
              <p>
                <span className="label">Product Name:</span> {productName}
              </p>
              {productBrand && productBrand.trim() !== '' && (
                <p>
                  <span className="label">Brand:</span> {productBrand}
                </p>
              )}
              {productModel && productModel.trim() !== '' && (
                <p>
                  <span className="label">Model:</span> {productModel}
                </p>
              )}
              {product?.category && (
                <p>
                  <span className="label">Category:</span> {product.category}
                </p>
              )}
              {product?.condition && (
                <p>
                  <span className="label">Condition:</span> {product.condition}
                </p>
              )}
              {product?.description && (
                <p>
                  <span className="label">Description:</span> {product.description}
                </p>
              )}
            </div>
            <div className="bottom-section">
              <div className="favorite-container">
                <button 
                  type="button"
                  className={`favorite-btn ${isFavorite ? 'favorited' : ''}`}
                  onClick={handleFavoriteClick}
                  title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <span className="star-icon">
                    {isFavorite ? '★' : '☆'}
                  </span>
                  <span className="favorite-text">
                    {isFavorite ? 'Favorited' : 'Add to Favorites'}
                  </span>
                </button>
              </div>
              <div className="product-price">
                <span className="label">Price:</span> 
                <span className="price">${Number(productPrice).toFixed(2)}</span>
              </div>
            </div>
            <div className="availability-status">
              <span className={`status ${product.is_available !== false ? 'available' : 'unavailable'}`}>
                {product.is_available !== false ? 'Available' : 'Sold Out'}
              </span>
            </div>
            
            
          </div>
        </div>

        <div className="seller-section">
          <div className="seller-details">
            <h3>Seller Details</h3>
            <div className="seller-info">
              <p>
                <span className="label">Name:</span> 
                {sellerDetails?.first_name
                  ? sellerDetails.first_name
                  : product.seller_name || 'Unknown Seller'}
              </p>
              <p>
                <span className="label">Email:</span> 
                {sellerDetails?.email || product.seller_email || 'Not provided'}
              </p>
              <p>
                <span className="label">Phone:</span>
                {sellerDetails?.phone_number || 'Not provided'}
              </p>
              <p>
                <span className="label">Member Since:</span> 
                {sellerDetails?.joined_at
                  ? new Date(sellerDetails.joined_at).toLocaleDateString()
                  : product.created_at
                    ? new Date(product.created_at).toLocaleDateString()
                    : 'Unknown'}
              </p>
            </div>
          </div>
          <div className="trust-badge">
            <h3>Trust Badge</h3>
            <div className="trust-display">
              <div className="trust-item">
                <span className="trust-icon">⭐</span>
                <span className="trust-text">
                  {sellerDetails?.trust_badge ?? 0} Trust Badges Received
                </span>
              </div>
              
            </div>
          </div>
        </div>

        <div className="action-buttons">
          <button 
            className="buy-btn"
            onClick={handleBuyClick}
            disabled={product.is_available === false}
          >
            Buy
          </button>
          <button 
            className="chat-btn"
            onClick={handleChatClick}
            aria-disabled={!product}
          >
            Chat
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Product_buypage;