import { useState, useEffect, useCallback } from "react";

// Import components
import OffersBreadcrumb from "./OffersBreadcrumb";
import OffersHeader from "./OffersHeader";
import FilterSidebar from "./FilterSidebar";
import ProductsContent from "./ProductsContent";

// Styles
import "../CSS/Offers.css";

const Offers = () => {
  // State for all products
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    category: [],
    price: { min: 0, max: 1000 },
    discount: false,
    rating: 0,
    tags: [],
    types: [],
  });

  // Sort state
  const [sortBy, setSortBy] = useState("newest");
  const [showSortOptions, setShowSortOptions] = useState(false);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(12);
  const [totalPages, setTotalPages] = useState(1);

  // Available filter options from the data
  const [availableTags, setAvailableTags] = useState([]);
  const [availableTypes, setAvailableTypes] = useState([]);

  // Wrap the filtering and sorting logic in useCallback so that its identity is stable
  const applyFiltersAndSort = useCallback(
    (products) => {
      let filtered = [...products];

      // Filter by category
      if (filters.category.length > 0) {
        filtered = filtered.filter((item) =>
          filters.category.some(
            (cat) => cat.toLowerCase() === (item.category || "").toLowerCase()
          )
        );
      }

      // Filter by price range
      // If max price is 0, ignore the upper limit by using Infinity
      const effectiveMax =
        filters.price.max === 0 ? Infinity : filters.price.max;
      filtered = filtered.filter((item) => {
        const price = item.new_price > 0 ? item.new_price : item.old_price;
        return price >= filters.price.min && price <= effectiveMax;
      });

      // Filter by discount
      if (filters.discount) {
        filtered = filtered.filter(
          (item) => item.new_price > 0 && item.new_price < item.old_price
        );
      }

      // Filter by rating
      if (filters.rating > 0) {
        filtered = filtered.filter((item) => {
          const productRating = Number(item.rating || 0);
          return productRating >= filters.rating;
        });
      }

      // Filter by tags
      if (filters.tags.length > 0) {
        filtered = filtered.filter(
          (item) =>
            item.tags && filters.tags.some((tag) => item.tags.includes(tag))
        );
      }

      // Filter by types
      if (filters.types.length > 0) {
        filtered = filtered.filter(
          (item) =>
            item.types &&
            filters.types.some((type) => item.types.includes(type))
        );
      }

      // Apply sorting
      switch (sortBy) {
        case "newest":
          filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
        case "price-asc":
          filtered.sort((a, b) => {
            const priceA = a.new_price > 0 ? a.new_price : a.old_price;
            const priceB = b.new_price > 0 ? b.new_price : b.old_price;
            return priceA - priceB;
          });
          break;
        case "price-desc":
          filtered.sort((a, b) => {
            const priceA = a.new_price > 0 ? a.new_price : a.old_price;
            const priceB = b.new_price > 0 ? b.new_price : b.old_price;
            return priceB - priceA;
          });
          break;
        case "discount":
          filtered.sort((a, b) => {
            const discountA = a.old_price - (a.new_price || a.old_price);
            const discountB = b.old_price - (b.new_price || b.old_price);
            return discountB - discountA;
          });
          break;
        case "rating":
          filtered.sort((a, b) => {
            const ratingA = Number(a.rating || 0);
            const ratingB = Number(b.rating || 0);
            return ratingB - ratingA;
          });
          break;
        default:
          break;
      }

      // Calculate total pages
      setTotalPages(Math.ceil(filtered.length / itemsPerPage));

      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedProducts = filtered.slice(startIndex, endIndex);

      setDisplayedProducts(paginatedProducts);
    },
    [filters, sortBy, currentPage, itemsPerPage]
  );

  // Fetch all products (runs only once)
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("http://localhost:4000/api/all-products?basicInfo=true")
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Failed to fetch products: ${res.status} ${res.statusText}`
          );
        }
        return res.json();
      })
      .then((data) => {
        if (!Array.isArray(data)) {
          console.warn("API didn't return an array for products", data);
          setAllProducts([]);
          setDisplayedProducts([]);
        } else {
          console.log("Received product data sample:", data.slice(0, 3));
          setAllProducts(data);
          setAvailableTags([
            ...new Set(data.flatMap((item) => item.tags || [])),
          ]);
          setAvailableTypes([
            ...new Set(data.flatMap((item) => item.types || [])),
          ]);
          applyFiltersAndSort(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoading(false);
      });
    // We only want this effect to run once on mount,
    // so disable exhaustive-deps warning for applyFiltersAndSort.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reapply filters and sorting whenever allProducts or filtering options change
  useEffect(() => {
    if (allProducts.length > 0) {
      applyFiltersAndSort(allProducts);
    }
  }, [allProducts, applyFiltersAndSort]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      switch (filterType) {
        case "category":
          if (newFilters.category.includes(value)) {
            newFilters.category = newFilters.category.filter(
              (cat) => cat !== value
            );
          } else {
            newFilters.category = [...newFilters.category, value];
          }
          break;
        case "price":
          newFilters.price = value;
          break;
        case "discount":
          newFilters.discount = value;
          break;
        case "rating":
          newFilters.rating = value;
          break;
        case "tag":
          if (newFilters.tags.includes(value)) {
            newFilters.tags = newFilters.tags.filter((tag) => tag !== value);
          } else {
            newFilters.tags = [...newFilters.tags, value];
          }
          break;
        case "type":
          if (newFilters.types.includes(value)) {
            newFilters.types = newFilters.types.filter(
              (type) => type !== value
            );
          } else {
            newFilters.types = [...newFilters.types, value];
          }
          break;
        default:
          break;
      }

      // Reset to first page when filters change
      setCurrentPage(1);

      return newFilters;
    });
  };

  // Handle sort change
  const handleSortChange = (sortOption) => {
    setSortBy(sortOption);
    setShowSortOptions(false);
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1);
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      category: [],
      price: { min: 0, max: 1000 },
      discount: false,
      rating: 0,
      tags: [],
      types: [],
    });
    setSortBy("newest");
    setCurrentPage(1);
  };

  // Calculate range of products shown
  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(startIndex + itemsPerPage - 1, allProducts.length);
  const displayRange = `${startIndex}-${endIndex}`;

  if (loading) {
    return <div className="loading">Loading products...</div>;
  }

  if (error) {
    return <div className="error">Error loading products: {error}</div>;
  }

  return (
    <div className="offers-container">
      <OffersBreadcrumb />
      <OffersHeader />

      <div className="offers-layout">
        <FilterSidebar
          filters={filters}
          availableTags={availableTags}
          availableTypes={availableTypes}
          handleFilterChange={handleFilterChange}
          clearAllFilters={clearAllFilters}
        />

        <ProductsContent
          displayedProducts={displayedProducts}
          totalProducts={allProducts.length}
          displayRange={displayRange}
          showSortOptions={showSortOptions}
          setShowSortOptions={setShowSortOptions}
          sortBy={sortBy}
          handleSortChange={handleSortChange}
          itemsPerPage={itemsPerPage}
          handleItemsPerPageChange={handleItemsPerPageChange}
          currentPage={currentPage}
          totalPages={totalPages}
          handlePageChange={handlePageChange}
          clearAllFilters={clearAllFilters}
        />
      </div>
    </div>
  );
};

export default Offers;
