import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import WelcomePage from "./pages/Welcome_page";
import LoginPage from "./pages/login_page";
import ForgotPassword from "./pages/Forgot_password";
import SignupPage from "./pages/signup_page.jsx";

import AllProducts from "./pages/allproducts.jsx";
import Favouritepage from "./pages/Favouritepage";
import AddProduct from "./pages/AddProduct.jsx";
import ProductBuyPage from "./pages/Product_buypage.jsx";
import ProductChat from "./pages/productchat";

import Confimbuying from "./pages/Confimbuying.jsx";
import MyProduct from "./pages/Myproduct.jsx";

import Wallet from "./pages/wallet.jsx";
import ProductView from "./pages/ProductView.jsx";

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        <Route path="/" element={<WelcomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/productview/:productId" element={<ProductView />} />

        {/* Products / Buy page routes */}
        <Route path="/allproducts" element={<AllProducts />} />
        <Route path="/product-buypage" element={<ProductBuyPage />} />
        <Route path="/product/:id" element={<ProductBuyPage />} />
        <Route path="/product/:productId" element={<ProductBuyPage />} />

        {/* Chat / Conversation */}
        <Route path="/product/:id/chat" element={<ProductChat />} />
      
  

        {/* Seller / account pages */}
        <Route path="/my-products" element={<MyProduct />} />
        <Route path="/add-products" element={<AddProduct />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/favourite" element={<Favouritepage />} />

        {/* Checkout / wallet */}
        <Route path="/confirm-buying" element={<Confimbuying />} />
        <Route path="/wallet" element={<Wallet />} />
      </Routes>
    </Router>
  );
}

export default App;
