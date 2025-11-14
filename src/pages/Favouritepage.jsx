import React, { useState, useEffect } from 'react';
import axios from "../axiosInstance";
import './Favouritepage.css';
import Header from '../components/header';
import Footer from '../components/Footer';
import { useNavigate } from 'react-router-dom';

const BASE = import.meta.env.VITE_API_PRODUCTS_URL || "http://127.0.0.1:8000";
const API = `${BASE}/api/`;

function Favouritepage() {
  // State to store the user's favourite products
  const [favouriteProducts, setFavouriteProducts] = useState([]);
  const navigate = useNavigate();

  // Load favourites from the backend when the page loads
  useEffect(() => {
    const loadFavorites = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          setFavouriteProducts([]);
          return;
        }
        const res = await axios.get(`${API}favorites/`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        //  the response to get product info and favoriteId
        const products = res.data.map(f => ({ ...f.product, favoriteId: f.id }));
        setFavouriteProducts(products);
      } catch (err) {
        console.error('Load favorites error', err);
        setFavouriteProducts([]);
      }
    };

    loadFavorites();

    //  for custom event to reload favourites if it updated elsewhere
    const onFavsUpdated = () => {
      loadFavorites();
    };
    window.addEventListener('favoritesUpdated', onFavsUpdated);

    // Clean up event listener on unmount
    return () => {
      window.removeEventListener('favoritesUpdated', onFavsUpdated);
    };
  }, []);

  // Navigate to the product detail page
  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Remove a product from favourites
  const handleRemoveFavorite = async (favoriteId) => {
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${API}favorites/${favoriteId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setFavouriteProducts(prev =>
        prev.filter(product => product.favoriteId !== favoriteId)
      );
    } catch (err) {
      console.error('Remove favorite error', err);
    }
  };

  return (
    <div className="favourite-page">
      <Header />
      <div className="page-container">
        <div className="products-container">
          {/* Show favourite products if any, otherwise show empty message */}
          {favouriteProducts.length > 0 ? (
            favouriteProducts.map(product => (
              <div key={product.id} className="product-card">
                {/* Remove from favourites button */}
                <button
                  className="remove-fav-btn top-right"
                  onClick={() => handleRemoveFavorite(product.favoriteId)}
                  title="Remove from favourites"
                >
                  &#10006;
                </button>
                {/* Sold Out label below the cross */}
                {(product.is_sold || product.is_available === false) && (
                  <div className="soldout-label below-cross">
                    Sold Out
                  </div>
                )}
                {/* Product image */}
                <div className="product-image">
                  <img
                    src={product.primary_image || product.image_url || product.image || 'https://via.placeholder.com/120x120?text=No+Image'}
                    alt={product.title || product.name || 'Product'}
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/120x120?text=No+Image';
                    }}
                  />
                </div>
                {/* Product details and actions */}
                <div className="product-content">
                  <div className="product-info">
                    <h3 className="product-name">{product.title || product.name || 'No Name'}</h3>
                    {product.brand && (
                      <p className="product-brand">
                        <span className="brand-label">Brand: </span>
                        <span className="brand-value">{product.brand}</span>
                      </p>
                    )}
                    {product.model && (
                      <p className="product-model">{product.model}</p>
                    )}
                    <p className="product-price">${Number(product.price || 0).toFixed(2)}</p>
                  </div>
                  <div className="product-actions">
                    {/* Button to view product details */}
                    <button
                      className="view-btn"
                      onClick={() => handleViewProduct(product.id)}
                    >
                      View
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            //  display the message when no favourites are found
            <div className="empty-favourites">
              <p>No favourite products found.</p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default Favouritepage;