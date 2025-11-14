import React from "react";
import "./SidebarCategories.css";

function SidebarCategories({ categories = [], selected, onSelect }) {
  return (
    <div className="sidebar-cats">
      <nav>
        <ul>
          {categories.map((c) => (
            <li
              key={c}
              className={c === selected ? "active" : ""}
              onClick={() => onSelect(c)}
            >
              {c === "all" ? "All" : c}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
}

export default SidebarCategories;