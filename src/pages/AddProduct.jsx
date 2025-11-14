import React, { useRef, useState } from "react";
import axios from "../axiosInstance";
import Header from "../components/header";
import Footer from "../components/Footer";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddProduct.css";

// Get API base URL from environment or fallback
const BASE = import.meta.env.VITE_API_PRODUCTS_URL || "http://127.0.0.1:8000";
const API = `${BASE}/api/products/`;

// Handles product upload form and image preview
// Uses local state for form fields and image preview
// Submits product data to backend API with authentication
// Shows status messages for upload and price estimate
// Includes a placeholder price estimate function
function AddProduct() {
  // State for form fields and UI feedback
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("new");
  const [imageFile, setImageFile] = useState(null); // Stores uploaded image file
  const [preview, setPreview] = useState(null); // Stores preview URL for image
  const [submitting, setSubmitting] = useState(false); // Submission loading state
  const [msg, setMsg] = useState(null); // Status message for user
  const fileRef = useRef(null); // Ref for file input
  const [manufactureDate, setManufactureDate] = useState("");
  const [brand, setBrand] = useState("");

  // Handle image file selection and preview
  function handleImageChange(e) {
    const f = e.target.files?.[0] ?? null;
    setImageFile(f);
    if (!f) {
      setPreview(null);
      return;
    }
    // Show image preview
    const url = URL.createObjectURL(f);
    setPreview(url);
  }

  // Handle form submission to upload product
  async function handleSubmit(e) {
    e.preventDefault();
    setMsg(null);
    
    if (!title.trim()) { setMsg("Title is required"); return; }
    if (!price) { setMsg("Price is required"); return; }

    // Prepare form data for API
    const token = localStorage.getItem("access_token");
    const fd = new FormData();
    fd.append("title", title);
    fd.append("description", description);
    if (category) fd.append("category", category);
    fd.append("price", price);
    fd.append("condition", condition);
    if (imageFile) fd.append("primary_image", imageFile);
    fd.append("manufacture_date", manufactureDate ?? "");
    fd.append("brand", brand ?? "");

    setSubmitting(true);
    try {
      // Send product data to backend
      const res = await axios.post(API, fd, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // Show message based on approval status
      const created = res.data;
      if (created && created.is_active) {
        setMsg("Product uploaded and is live now.");
        toast.success("Product uploaded and is live now.");
      } else {
        setMsg("Product submitted — awaiting admin approval.");
        toast.info("Product sent for admin approval.");
      }
      // Reset form after successful upload
      setTitle("");
      setDescription("");
      setCategory("");
      setPrice("");
      setCondition("new");
      setImageFile(null);
      setPreview(null);
      setManufactureDate("");
      setBrand("");
      if (fileRef.current) fileRef.current.value = "";
    } catch (err) {
      // Show error message if upload fails
      console.error(err);
      setMsg(err?.response?.data?.detail ?? "Upload failed — check console");
    } finally {
      setSubmitting(false);
    }
  }

  // Suggest a price based on entered price (simple logic)
  function handleEstimate() {
    if (!price) { setMsg("Set a price first to estimate"); return; }
    const p = Number(price);
    if (Number.isNaN(p)) { setMsg("Invalid price"); return; }
    const suggested = (p * 0.9).toFixed(2); // Suggest 10% lower
    setMsg(`Suggested listing price: $${suggested}`);
  }

  return (
    <>
      <Header />
      <div className="add-product-page">

        {/* Product add form */}
        <form className="add-product-form" onSubmit={handleSubmit} encType="multipart/form-data">
          {/* Left side Image upload and preview */}
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

          {/* Rightside Product details form fields */}
          <div className="right-col">
            <div className="card">
              <h3>Product Details</h3>

              <label className="field">
                <div className="label">Product Name:</div>
                <input value={title} onChange={(e) => setTitle(e.target.value)} />
              </label>

              <label className="field">
                <div className="label">Manufacture Date:</div>
                <input type="date" className="small" value={manufactureDate} onChange={e => setManufactureDate(e.target.value)} />
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

          {/* Action buttons for estimate and upload */}
          <div className="page-actions">
            <button type="button" className="btn estimate" onClick={handleEstimate} disabled={submitting}>Price Estimate</button>
            <button type="submit" className="btn upload" disabled={submitting}>{submitting ? "Uploading..." : "Upload"}</button>
          </div>
        </form>
      </div>

      <Footer />
    </>
  );
}

export default AddProduct;