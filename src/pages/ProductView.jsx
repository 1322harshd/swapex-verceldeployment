import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import Header from "../components/header";
import Footer from "../components/Footer";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "./AddProduct.css";

const BASE = import.meta.env.VITE_API_PRODUCTS_URL || "http://127.0.0.1:8000";
const API = `${BASE}/api/products/`;

// Fix CONVO_BASE to always use HTTPS in production
const rawConvoBase = import.meta.env.VITE_API_CONVO_URL || "http://127.0.0.1:3000";
const CONVO_BASE = rawConvoBase.startsWith('http') 
  ? rawConvoBase 
  : `https://${rawConvoBase}`;

// Create separate axios instance for products backend  
const productsAxios = axios.create({
  baseURL: BASE,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add token interceptor
productsAxios.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

function ProductView() {
  const { productId } = useParams();
  const navigate = useNavigate();

  // State for product fields 
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("new");
  const [manufactureDate, setManufactureDate] = useState("");
  const [brand, setBrand] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [convos, setConvos] = useState([]);
  const [convosLoading, setConvosLoading] = useState(false);
  const [convosError, setConvosError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const fileRef = useRef(null);

  // load product details from backend
  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await productsAxios.get(`/api/products/${productId}/`);
        const p = res.data;
        setTitle(p.title || "");
        setDescription(p.description || "");
        setCategory(p.category || "");
        setPrice(p.price || "");
        setCondition(p.condition || "new");
        setManufactureDate(p.manufacture_date || "");
        setBrand(p.brand || "");
        setPreview(p.primary_image || null);
      } catch (err) {
        toast.error("Failed to load product details.");
      }
    }
    fetchProduct();
  }, [productId]);

  // load conversations for this product
  useEffect(() => {
    async function fetchConversations() {
      setConvosLoading(true);
      setConvosError(null);
      try {
        // Create axios instance for conversation backend
        const conversationAxios = axios.create({
          baseURL: CONVO_BASE,
          headers: {
            'Content-Type': 'application/json',
          }
        });

        // Add token interceptor
        conversationAxios.interceptors.request.use((config) => {
          const token = localStorage.getItem("access_token");
          if (token) config.headers.Authorization = `Bearer ${token}`;
          return config;
        });

        const res = await conversationAxios.get(`/conversation?product=${productId}`);
        setConvos(res.data || []);
      } catch (err) {
        console.error("Failed to load conversations:", err);
        setConvosError("Failed to load conversations");
      } finally {
        setConvosLoading(false);
      }
    }
    if (productId) {
      fetchConversations();
    }
  }, [productId]);

  // handle image file selection and preview
  function handleImageChange(e) {
    const f = e.target.files?.[0] ?? null;
    setImageFile(f);
    if (!f) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  // handle form submission to update product
  async function handleSubmit(e) {
    e.preventDefault();
    if (!title.trim()) { toast.error("Title is required"); return; }
    if (!price) { toast.error("Price is required"); return; }

    // Prepare form data for API
    const token = localStorage.getItem("access_token");
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    if (category) fd.append("category", category);
    fd.append("price", price);
    fd.append("condition", condition);
    fd.append("manufacture_date", manufactureDate ?? "");
    fd.append("brand", brand ?? "");
    if (imageFile) fd.append("primary_image", imageFile);

    setSubmitting(true);
    try {
      await productsAxios.patch(
        `/api/products/${productId}/custom-update/`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      window.toast && window.toast.success('Product sent for admin approval!', { position: "top-center", autoClose: 2500 });
      // Optionally, refresh data or navigate away
    } catch (err) {
      toast.error(err?.response?.data?.detail ?? "Update failed — check console");
    } finally {
      setSubmitting(false);
    }
  }

  function handleEstimate() {
    if (!price) { toast.info("Set a price first to estimate"); return; }
    const p = Number(price);
    if (Number.isNaN(p)) { toast.error("Invalid price"); return; }
    const suggested = (p * 0.9).toFixed(2);
    toast.info(`Suggested listing price: $${suggested}`);
  }

  return (
    <>
      <Header />
      <div className="add-product-page">
        {/* Product update form */}
        <form className="add-product-form" onSubmit={handleSubmit} encType="multipart/form-data">
          <div className="left-col">
            <label className="image-drop" htmlFor="primary_image">
              {preview ? (
                <img src={preview} alt="preview" className="preview-img" />
              ) : (
                <div className="placeholder">
                  <div className="plus">+</div>
                  <div>Add Images Here</div>
                </div>
              )}
              <input
                id="primary_image"
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="visually-hidden"
              />
            </label>
            <div className="hint">Recommended: square images, &lt; 5MB</div>
          </div>

          <div className="right-col">
            <div className="card">
              <h3>Product Details</h3>

              <label className="field">
                <div className="label">Product Name:</div>
                <input value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>

              <label className="field">
                <div className="label">Manufacture Date:</div>
                <input
                  type="date"
                  className="small"
                  value={manufactureDate}
                  onChange={e => setManufactureDate(e.target.value)}
                />
              </label>

              <label className="field">
                <div className="label">Quality / Condition:</div>
                <select value={condition} onChange={(e) => setCondition(e.target.value)}>
                  <option value="new">New</option>
                  <option value="used_like_new">Like New</option>
                  <option value="used_good">Good</option>
                  <option value="used_fair">Fair</option>
                </select>
              </label>

              <label className="field">
                <div className="label">Product Description:</div>
                <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
              </label>

              <label className="field">
                <div className="label">Brand:</div>
                <input className="small" value={brand} onChange={e => setBrand(e.target.value)} />
              </label>

              <label className="field">
                <div className="label">Price:</div>
                <input value={price} onChange={(e) => setPrice(e.target.value)} />
              </label>

              <label className="field">
                <div className="label">Category:</div>
                <input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Books, Electronics, ..." />
              </label>
            </div>
          </div>

          <div className="page-actions">
            <button type="button" className="btn estimate" onClick={handleEstimate} disabled={submitting}>Price Estimate</button>
            <button type="submit" className="btn upload" disabled={submitting}>{submitting ? "Updating..." : "Update"}</button>
          </div>
        </form>
      </div>
      {/* Interested buyers / chats for this product */}
      <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", padding: 16, marginTop: 20 }}>
        <div style={{ width: "100%", maxWidth: 420 }}>
          <h3>Interested Buyers</h3>
          {convosLoading ? (
            <div>Loading…</div>
          ) : convosError ? (
            <div style={{ color: "red" }}>{convosError}</div>
          ) : convos.length === 0 ? (
            <div>No one has started a chat for this product yet.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {convos.map((c) => {
                const convoId = c._id ?? c.id ?? Math.random().toString(36).slice(2);
                const buyerObj = typeof c.buyer === "object" ? c.buyer : { id: c.buyer };
                const buyerLabel = buyerObj.name ?? buyerObj.username ?? buyerObj.id;
                return (
                  <div key={convoId} style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    background: "#fff",
                    borderRadius: 12,
                    boxShadow: "0 2px 10px rgba(60,30,80,0.08)",
                    padding: "18px 22px",
                    border: "1px solid #f0f0f0"
                  }}>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      <span style={{ fontWeight: 700, fontSize: 17, color: "#7a3540" }}>{buyerLabel}</span>
                      <span style={{ fontSize: 13, color: "#888", marginTop: 2 }}>Buyer ID: {buyerObj.id}</span>
                    </div>
                    <button
                      onClick={() => navigate(`/product/${productId}/chat`, {
                        state: { product: { id: productId, title }, convoId, buyer: buyerObj }
                      })}
                      style={{
                        padding: "10px 22px",
                        borderRadius: 8,
                        background: "linear-gradient(90deg, #7a3540 60%, #b97a95 100%)",
                        color: "#fff",
                        border: "none",
                        fontWeight: 600,
                        fontSize: 16,
                        boxShadow: "0 2px 8px #7a354022",
                        cursor: "pointer",
                        transition: "background 0.2s"
                      }}
                    >
                      Chat
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}

export default ProductView;