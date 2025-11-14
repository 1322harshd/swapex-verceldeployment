import React from "react";
import { useNavigate } from "react-router-dom"; 
import "./ProductCard.css";

function ProductCard({ product, base }) {
  const navigate = useNavigate(); 
  
  const img = product.primary_image
    ? product.primary_image.startsWith("http")
      ? product.primary_image
      : `${base}${product.primary_image.startsWith("/") ? "" : "/"}${product.primary_image}`
    : null;

  const conditionLabel = {
    new: "New",
    used_like_new: "Like New",
    used_good: "Good",
    used_fair: "Fair",
  }[product.condition] ?? product.condition;

  //  click handler for navigation
  const handleCardClick = () => {
    console.log("ProductCard click → id:", product?.id);
    navigate(`/product/${product.id}`);
  };

  return (
    <article className="product-card horizontal" onClick={handleCardClick} style={{ cursor: 'pointer' }}>
      <div className="thumb-horizontal">
        {img ? (
          <img src={img} alt={product.title} />
        ) : (
          <div className="no-img">No image</div>
        )}
      </div>
      <div className="card-body-horizontal">
        <div className="card-header-row">
          <h3 className="title-horizontal">{product.title}</h3>
        </div>
        {product.description ? (
          <p className="subtitle-horizontal">{product.description}</p>
        ) : null}
        <div className="meta-row-horizontal">
          <div className="price-horizontal">${Number(product.price).toFixed(2)}</div>
          <div className={`condition-badge-horizontal`}>{conditionLabel}</div>
        </div>
      </div>
    </article>
  );
}

export default ProductCard;