// allproducts.jsx - Displays all products with category, search, and sorting
// Fetches products from backend API and handles authentication
// Groups products by category and renders them with ProductCard
// Includes sidebar, search bar, and mobile category navigation
// Shows loading and error states

import React, { useEffect, useMemo, useState } from "react";
import axios from "../axiosInstance";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/Footer";
import ProductCard from "../components/ProductCard";
import SidebarCategories from "../components/SidebarCategories";
import SearchBar from "../components/SearchBar";
import "./allproducts.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const BASE = import.meta.env.VITE_API_PRODUCTS_URL || "http://127.0.0.1:8000";
const API = `${BASE}/api/products/`;

function AllProducts() {
  //navigate function for routing
  const navigate = useNavigate();
  //state for components
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("all");
  const [ordering, setOrdering] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // redirect to login if no token or token expired with toast explanation
    const token = localStorage.getItem("access_token");
    if (!token) {
      toast.info("Please login to continue", { position: "top-right", autoClose: 1000, closeOnClick: true});
      navigate("/login", { replace: true });
      return;
    }

    //401 interceptor to redirect on token expiry server-side and show toast
    const interceptor = axios.interceptors.response.use(
      (resp) => resp,
      (error) => {
        const status = error?.response?.status;
        if (status === 401) {
          localStorage.removeItem("access_token");
          toast.error("Authentication failed — please login again", { position: "top-right", autoClose: 4000 });
          navigate("/login", { replace: true });
        }
        return Promise.reject(error);//passing error down to promise chain so that any catch block can be triggered
      }
    );

    return () => {
      axios.interceptors.response.eject(interceptor);//when component is unmounted interceptor is removed
    };
  }, [navigate]);

  useEffect(() => {//component for loading product information
    let cancelled = false;//flag for avoiding state loading if component unmounted
    setLoading(true);
    const params = {};//setting parameters for request
    if (category && category !== "all") params.category = category;
    if (ordering) params.ordering = ordering;
    if (search) params.search = search;

    //creating and handling request
    axios
      .get(API, { params })
      .then((res) => {
        if (cancelled) return;//flag if component is unmounted then no states are loaded from the current request
        const data = res.data?.results ?? res.data ?? [];
        setProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setProducts([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [category, ordering, search]);// re-running component every time these change

  const categories = useMemo(() => {
    const setCat = new Set();//instantiating new set
    let hasUncategorized = false;//setting unCategorize flag
    products.forEach((p) => {//loop for adding categories to setCat set
      if (p.category) setCat.add(p.category);
      else hasUncategorized = true;
    });
    const cats = ["all", ...Array.from(setCat).sort()];//turning set into an array
    if (hasUncategorized) cats.push("Uncategorized");//adding uncategorized to products which has no category
    return cats;
  }, [products]);

  //grouping prouducts based on categories
  const groupedProducts = useMemo(() => {
    const map = {};//instantiating a map
    products.forEach((p) => {//looping over products to set key as category for 
      const key = p.category && p.category.trim() ? p.category : "Uncategorized";//checking if category exists
      if (!map[key]) map[key] = [];//creating new array if category doesnot exist in map
      map[key].push(p);//pusing product into array created in map
    });
    Object.keys(map).forEach((k) =>//sorting products in arrays inside map based on time they are uploaded
      map[k].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    );
    return map;
  }, [products]);

  // decide which groups to render based on selected category
  const visibleGroups = useMemo(() => {
    if (category === "all") {
      const order = categories.filter((c) => c !== "all");
      const groups = order.reduce((acc, c) => {
        const key = c === "Uncategorized" ? "Uncategorized" : c;
        if (groupedProducts[key] && groupedProducts[key].length) acc[key] = groupedProducts[key];
        return acc;
      }, {});
      Object.keys(groupedProducts).forEach((k) => {
        if (!groups[k]) groups[k] = groupedProducts[k];
      });
      return groups;
    } else {
      const key = category === "Uncategorized" ? "Uncategorized" : category;
      return groupedProducts[key] ? { [key]: groupedProducts[key] } : {};
    }
  }, [category, categories, groupedProducts]);

  return (
    <>
      <Header />
      <ToastContainer />
      <div className="all-products-page">
        {/* sidebar overlay for small screens */}
        <div
          className={`left-sidebar ${sidebarOpen ? "open" : ""}`}
          aria-hidden={!sidebarOpen && window.innerWidth < 900}
        >
          <SidebarCategories
            categories={categories}
            selected={category}
            onSelect={(c) => { setCategory(c); setSidebarOpen(false); }}
          />
        </div>

        {/* overlay backdrop for drawer */}
        {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

        <main className="products-main">
          <div className="top-row">
            <button
              className="sidebar-toggle"
              aria-label="Open categories"
              onClick={() => setSidebarOpen((s) => !s)}
            >
              ☰
            </button>

            <SearchBar value={search} onChange={setSearch} onClear={() => setSearch("")} />
          </div>

          {/* mobile horizontal categories (visible on small screens) */}
          <div className="mobile-cats" role="tablist" aria-label="Categories">
            {categories.map((c) => (
              <button
                key={c}
                className={`mobile-cat-btn ${c === category ? "active" : ""}`}
                onClick={() => setCategory(c)}
              >
                {c === "all" ? "All" : c}
              </button>
            ))}
          </div>

          <div className="top-controls">
            <div className="results-count">
              {loading ? "Loading..." : `${products.length} results`}
            </div>
            <div className="ordering">
              <label>
                Sort:
                <select value={ordering} onChange={(e) => setOrdering(e.target.value)}>
                  <option value="">Newest</option>
                  <option value="price">Price ↑</option>
                  <option value="-price">Price ↓</option>
                </select>
              </label>
            </div>
          </div>

          {loading ? (
            <div className="loader">Loading products…</div>
          ) : Object.keys(visibleGroups).length === 0 ? (
            <div className="empty">No products found</div>
          ) : (
            Object.entries(visibleGroups).map(([catName, items]) => (
              <section key={catName} className="category-section">
                <div className="products-grid">
                  <h2 className="category-title">{catName}</h2>
                  {items.map((p) => (
                    <ProductCard key={p.id} product={p} base={BASE} />
                  ))}
                </div>
              </section>
            ))
          )}
        </main>
      </div>

      <Footer />
    </>
  );
}

export default AllProducts;