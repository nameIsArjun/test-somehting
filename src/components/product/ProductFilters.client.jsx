// ProductFilter.client.jsx
import { useState, useEffect } from 'react';

export default function ProductFilter({
  availableColors,
  availableProductTypes,
  filters,
  onFilterChange,
}) {
  const [minPrice, setMinPrice] = useState(filters.minPrice);
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice);
  const [color, setColor] = useState(filters.color);
  const [productType, setProductType] = useState(filters.productType);

  useEffect(() => {
    onFilterChange({ minPrice, maxPrice, color, productType });
  }, [minPrice, maxPrice, color, productType]);

  const handlePriceChange = (e) => {
    if (e.target.name === 'minPrice') setMinPrice(e.target.value);
    if (e.target.name === 'maxPrice') setMaxPrice(e.target.value);
  };

  return (
    <div className="p-4 bg-white text-black">
      <div className="flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <span className="font-semibold text-gray-700">Price Range:</span>
          <input
            type="text"
            name="minPrice"
            value={minPrice}
            onChange={handlePriceChange}
            className="px-4 py-2 border rounded"
            placeholder="Min Price"
          />
          <input
            type="text"
            name="maxPrice"
            value={maxPrice}
            onChange={handlePriceChange}
            className="px-4 py-2 border rounded"
            placeholder="Max Price"
          />
        </div>
        <div>
          <span className="font-semibold text-gray-700">Color:</span>
          <select
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Colors</option>
            {availableColors.map((color, index) => (
              <option key={index} value={color}>
                {color}
              </option>
            ))}
          </select>
        </div>
        <div>
          <span className="font-semibold text-gray-700">Product Type:</span>
          <select
            value={productType}
            onChange={(e) => setProductType(e.target.value)}
            className="px-4 py-2 border rounded"
          >
            <option value="">All Types</option>
            {availableProductTypes.map((type, index) => (
              <option key={index} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
