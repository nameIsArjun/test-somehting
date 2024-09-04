import { useState, useEffect } from 'react';
import { ProductGrid, ProductFilter } from '~/components';

export function AllProductsGrid({
  initialProducts,
  availableColors,
  availableProductTypes,
}) {
  const [filters, setFilters] = useState({
    minPrice: '0',
    maxPrice: '4000',
    color: '',
    productType: '',
  });

  const [filteredProducts, setFilteredProducts] = useState(initialProducts);

  useEffect(() => {
    const filtered = initialProducts.filter((product) => {
      const matchesPrice =
        parseFloat(product.variants.nodes[0].priceV2.amount) >=
          parseFloat(filters.minPrice) &&
        parseFloat(product.variants.nodes[0].priceV2.amount) <=
          parseFloat(filters.maxPrice);

      const matchesColor = filters.color
        ? product.options
            .find((opt) => opt.name === 'Color')
            ?.values.includes(filters.color)
        : true;

      const matchesProductType = filters.productType
        ? product.productType === filters.productType
        : true;

      return matchesPrice && matchesColor && matchesProductType;
    });

    setFilteredProducts(filtered);
  }, [filters, initialProducts]);

  const handleFilterChange = (newFilters) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      ...newFilters,
    }));
  };

  return (
    <>
      <ProductFilter
        availableColors={availableColors}
        availableProductTypes={availableProductTypes}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      <ProductGrid collection={{ products: filteredProducts }} />
    </>
  );
}
