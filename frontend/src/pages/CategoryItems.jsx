// frontend/src/pages/CategoryItems.jsx
import React from "react";
import { useParams, Link } from "react-router-dom";
import { menuData } from "../data/menuData";

const CategoryItems = () => {
  const { categoryName } = useParams();
  const category = menuData.find(
    (c) => c.category === decodeURIComponent(categoryName)
  );

  if (!category) {
    return (
      <div>
        <p className="text-gray-600">No items found for “{categoryName}”.</p>
        <Link to="/" className="text-blue-600 underline">← Back</Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-semibold">{category.category}</h2>
        <Link to="/" className="text-blue-600 underline">← All categories</Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {category.items.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl border shadow-sm bg-white"
          >
            <h3 className="font-semibold text-lg">{item.name}</h3>
            {item.size && (
              <p className="text-xs text-gray-500 mb-1">Size: {item.size}</p>
            )}
            <p className="text-sm text-gray-600">{item.ingredients}</p>
            <div className="flex items-center justify-between mt-3">
              <span className="font-medium">${item.price.toFixed(2)}</span>
              {item.calories && (
                <span className="text-xs text-gray-500">{item.calories} kcal</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryItems;
