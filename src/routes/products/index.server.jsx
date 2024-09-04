// index.server.jsx
import { Suspense } from 'react';
import { useShopQuery, gql, useLocalization, Seo } from '@shopify/hydrogen';
import dynamic from 'next/dynamic';

import { PRODUCT_CARD_FRAGMENT } from '~/lib/fragments';
import { PAGINATION_SIZE } from '~/lib/const';
import { ProductGrid, PageHeader, Section } from '~/components';
import { Layout } from '~/components/index.server';

// Dynamically import ProductFilter to avoid server-side issues
const ProductFilter = dynamic(() => import('~/components/ProductFilter'), { ssr: false });

export default function AllProducts() {
  return (
    <Layout>
      <Seo type="page" data={{ title: 'All Products' }} />
      <PageHeader heading="All Products" variant="allCollections" />
      <Section>
        <Suspense fallback={<div>Loading...</div>}>
          <AllProductsGrid />
        </Suspense>
      </Section>
    </Layout>
  );
}

function AllProductsGrid() {
  const {
    language: { isoCode: languageCode },
    country: { isoCode: countryCode },
  } = useLocalization();

  const { data } = useShopQuery({
    query: ALL_PRODUCTS_QUERY,
    variables: {
      country: countryCode,
      language: languageCode,
      pageBy: PAGINATION_SIZE,
    },
    preload: true,
  });

  const [filters, setFilters] = useState({
    minPrice: '0',
    maxPrice: '4000',
    color: '',
    productType: '',
  });

  const handleFilterChange = (newFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  const filteredProducts = data.products.nodes.filter(product => {
    const price = parseFloat(product.variants.nodes[0].priceV2.amount);
    const withinPriceRange = price >= parseFloat(filters.minPrice) && price <= parseFloat(filters.maxPrice);
    const matchesColor = filters.color ? product.options.find(option => option.name === 'Color')?.values.includes(filters.color) : true;
    const matchesProductType = filters.productType ? product.productType === filters.productType : true;
    return withinPriceRange && matchesColor && matchesProductType;
  });

  return (
    <>
      <ProductFilter
        availableColors={data.products.nodes.flatMap(product => 
          product.options.find(option => option.name === 'Color')?.values || []
        )}
        availableProductTypes={[...new Set(data.products.nodes.map(product => product.productType))]}
        filters={filters}
        onFilterChange={handleFilterChange}
      />
      <ProductGrid
        key="products"
        url={`/products?country=${countryCode}`}
        collection={{ products: { nodes: filteredProducts } }}
      />
      <div className="ml-auto text-sm text-gray-500">
        {filteredProducts.length} products
      </div>
    </>
  );
}

// API to paginate products
export async function api(request, { params, queryShop }) {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    });
  }

  const url = new URL(request.url);
  const cursor = url.searchParams.get('cursor');
  const country = url.searchParams.get('country');
  const { handle } = params;

  return await queryShop({
    query: PAGINATE_ALL_PRODUCTS_QUERY,
    variables: {
      handle,
      cursor,
      pageBy: PAGINATION_SIZE,
      country,
    },
  });
}

const ALL_PRODUCTS_QUERY = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query AllProducts(
    $country: CountryCode
    $language: LanguageCode
    $pageBy: Int!
    $cursor: String
  ) @inContext(country: $country, language: $language) {
    products(first: $pageBy, after: $cursor) {
      nodes {
        ...ProductCard
        productType
        options {
          name
          values
        }
        variants {
          nodes {
            priceV2 {
              amount
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        startCursor
        endCursor
      }
    }
  }
`;

const PAGINATE_ALL_PRODUCTS_QUERY = gql`
  ${PRODUCT_CARD_FRAGMENT}
  query ProductsPage(
    $pageBy: Int!
    $cursor: String
    $country: CountryCode
    $language: LanguageCode
  ) @inContext(country: $country, language: $language) {
    products(first: $pageBy, after: $cursor) {
      nodes {
        ...ProductCard
        productType
        options {
          name
          values
        }
        variants {
          nodes {
            priceV2 {
              amount
            }
          }
        }
      }
      pageInfo {
        hasNextPage
        endCursor
      }
    }
  }
`;
