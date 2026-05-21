# SwapEx

SwapEx is a Vite-powered React application for a marketplace-style product swap/buy experience.

## Overview

- Built with React 19 and Vite
- Uses React Router DOM for routing
- Includes authentication, product browsing, payment flow, chat, wallet, and favorites
- Uses Axios with central token handling and refresh logic
- Uses React Toastify for user notifications
- Includes a Vercel rewrite configuration for SPA deployment

## Main features

- Welcome, login, signup, and forgot password flows
- Product listing and detailed product view
- Add product and seller dashboard pages
- Favorite products page
- Chat page for product conversations
- Wallet page and purchase confirmation page
- Centralized API endpoints and authenticated Axios instance

## Project structure

- `src/main.jsx` — app bootstrap and root render
- `src/App.jsx` — routes and page wiring
- `src/apiEndpoints.js` — centralized backend endpoint definitions
- `src/axiosInstance.js` — Axios instance with authorization and refresh token handling
- `src/components/` — reusable UI components
- `src/pages/` — application pages

## Routes included in `src/App.jsx`

- `/` — `WelcomePage`
- `/login` — `LoginPage`
- `/forgot-password` — `ForgotPassword`
- `/signup` — `SignupPage`
- `/productview/:productId` — `ProductView`
- `/allproducts` — `AllProducts`
- `/product-buypage` and `/product/:id` / `/product/:productId` — `ProductBuyPage`
- `/product/:id/chat` — `ProductChat`
- `/my-products` — `MyProduct`
- `/add-products` and `/add-product` — `AddProduct`
- `/favourite` — `Favouritepage`
- `/confirm-buying` — `Confimbuying`
- `/wallet` — `Wallet`

## Dependencies

- `react`, `react-dom`
- `react-router-dom`
- `axios`
- `bootstrap`, `react-bootstrap`
- `react-toastify`
- `socket.io-client`
- `react-multi-carousel`

## Dev dependencies

- `vite`
- `@vitejs/plugin-react`
- `eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`
- `@types/react`, `@types/react-dom`

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```
2. Run development server:
   ```bash
   npm run dev
   ```
3. Build for production:
   ```bash
   npm run build
   ```
4. Preview production build:
   ```bash
   npm run preview
   ```

## Environment variables

- `VITE_API_BASE_URL` — optional base URL for backend API requests

## Deployment

- `vercel.json` is configured to rewrite all routes to `index.html`, supporting SPA routing on Vercel.

## Notes

- The `axiosInstance.js` file automatically attaches stored access tokens and attempts refresh on 401 responses.
- The app assumes a backend API supporting authentication, wallet, and product endpoints.
