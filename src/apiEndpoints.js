// Centralized API endpoints for authentication and wallet features
// Uses environment variable for base URL
// Provides all backend endpoint URLs for use throughout the frontend

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

export const API_ENDPOINTS = {
  SIGNUP: `${API_BASE_URL}/signup/`,
  TOKEN: `${API_BASE_URL}/token/`,
  TOKEN_REFRESH: `${API_BASE_URL}/token/refresh/`,
  FORGOT_PASSWORD: `${API_BASE_URL}/forgot-password/`,
  GIVE_TRUST_BADGE: `${API_BASE_URL}/give-trust-badge/`,
  CURRENT_USER_PROFILE: `${API_BASE_URL}/auth/me/`,
  WALLET_DEDUCT: `${API_BASE_URL}/wallet/deduct/`,
  WALLET_ADD: `${API_BASE_URL}/wallet/add/`,
  WALLET_BALANCE: `${API_BASE_URL}/wallet/`,
  MY_PRODUCTS: `${API_BASE_URL}/products/my/`,
  RECORD_SALE: `${API_BASE_URL}/products/record-sale/`,
};

// Usage example:
// import { API_ENDPOINTS } from './apiEndpoints';
// fetch(API_ENDPOINTS.SIGNUP, { ... })
