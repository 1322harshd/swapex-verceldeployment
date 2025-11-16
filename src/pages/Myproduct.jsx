import React, { useEffect, useState } from 'react';
import Header from '../components/header';
import Footer from '../components/Footer';
import './Myproduct.css';
import axios from '../axiosInstance';
import { API_ENDPOINTS } from '../apiEndpoints';
import { useNavigate } from 'react-router-dom';

function MyProduct() {
  // State for user's products, loading, and error
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch user's products from backend when component mounts
  useEffect(() => {
    const fetchMyProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        // Get the user's products using access token
        const token = localStorage.getItem('access_token');
        const res = await axios.get(API_ENDPOINTS.MY_PRODUCTS, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setProducts(res.data);
      } catch (err) {
        setError('Failed to load your products.');
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchMyProducts();
  }, []);

  // Navigate to add the product page
  const handleAddProduct = () => {
    navigate('/add-product');
  };

  return (
    <div>
      <Header />
      {/* Space for navbar */}
      <div className="myproduct-navbar-space"></div>
      <main className="myproduct-main">
        <button className="add-product-btn" onClick={() => navigate('/add-product')}>
          Add Products
        </button>
        <div className="myproduct-list">
          {/* Show loading, error, empty, or product cards */}
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div className="myproduct-error">{error}</div>
          ) : products.length === 0 ? (
            <div className="myproduct-empty">No products found.</div>
          ) : (
            products.map((product) => (
              <div className="myproduct-card" key={product.id}>
                {/* Product image */}
                <div className="myproduct-img-box">
                  <img
                    src={
                      product.primary_image ||
                      product.image_url ||
                      product.image ||
                      'https://via.placeholder.com/90x90?text=No+Image'
                    }
                    alt={product.title || product.name || 'Product'}
                  />
                </div>
                {/* Product details */}
                <div className="myproduct-info">
                  <div className="myproduct-title">{product.title || product.name || 'No Name'}</div>
                  {product.brand && (
                    <div className="myproduct-brand">
                      <span>Brand:</span> <b>{product.brand}</b>
                    </div>
                  )}
                  {product.model && (
                    <div className="myproduct-model">
                      <span>Model:</span> <b>{product.model}</b>
                    </div>
                  )}
                  <div className="myproduct-price">
                    <b>${Number(product.price || 0).toFixed(2)}</b>
                  </div>
                </div>
                {/* Button to view product details */}
                <div className="myproduct-view">
                  <button
                    className="view-btn"
                    onClick={() => navigate(`/productview/${product.id}`)}
                  >
                    View
                  </button>
                </div>
                {/* Sold Out label */}
                {(product.is_sold || product.is_available === false) && (
                  <div className="soldout-label">
                    Sold Out
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default MyProduct;

