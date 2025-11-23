// frontend/src/pages/Categories.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { menuData } from "../data/menuData";

const Categories = () => {
  const navigate = useNavigate();

  return (
    <>
      <h1 className="text-2xl font-semibold mb-4">Categories</h1>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {menuData.map((cat) => (
          <button
            key={cat.category}
            onClick={() => navigate(`/category/${encodeURIComponent(cat.category)}`)}
            className="bg-orange-100 hover:bg-orange-200 rounded-2xl p-6 text-center font-medium shadow-sm transition"
          >
            {cat.category}
          </button>
        ))}
      </div>
    </>
  );
};

export default Categories;
