// Create an Axios instance for API requests
// Automatically attaches access token from localStorage to requests
// Handles token refresh on 401 errors and redirects to login if refresh fails
// Shows toast notifications for session/authentication errors
// Exports the configured Axios instance for use throughout the app

import axios from "axios";
import { toast } from "react-toastify";
import { API_ENDPOINTS } from "./apiEndpoints";

const instance = axios.create(); // Create a reusable Axios instance

// Attach access token to every request if available
instance.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle responses and errors globally
instance.interceptors.response.use(
  (response) => response, // Pass successful responses through
  async (error) => {
    const originalRequest = error.config;
    const status = error?.response?.status;
    // If unauthorized and not already retried, try to refresh token
    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          // Attempt to refresh access token
          const res = await axios.post(API_ENDPOINTS.TOKEN_REFRESH, { refresh: refreshToken });
          const newAccess = res.data.access;
          localStorage.setItem("access_token", newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return instance(originalRequest); // Retry original request with new token
        } catch (err) {
          // If refresh fails, clear tokens and redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          toast.error("Session expired — please login again", { position: "top-right", autoClose: 4000 });
          window.location.href = "/login";
        }
      } else {
        // No refresh token, clear tokens and redirect to login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        toast.error("Authentication failed — please login again", { position: "top-right", autoClose: 4000 });
        window.location.href = "/login";
      }
    }
    return Promise.reject(error); // Pass other errors down the chain
  }
);

export default instance; // Export the configured Axios instance
