import React from "react";
import "./SearchBar.css";

export default function SearchBar({ value = "", onChange = () => {}, onClear = () => {} }) {
  return (
    <div className="searchbar">
      <div className="search-input-wrapper">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <input
          type="search"
          placeholder="Search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="Search"
        />
        {value && (
          <button type="button" className="clear-btn" onClick={onClear} aria-label="Clear search">
          </button>
        )}
      </div>
    </div>
  );
}