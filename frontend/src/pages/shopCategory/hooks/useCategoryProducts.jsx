import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from "../../../utils/imageUtils";

/**
 * Custom hook for fetching and filtering products by category
 *
 * @param {String} category - Category name to fetch products for
 * @returns {Object} Products data, filtering options, and actions
 */
const useCategoryProducts = (category) => {
  // State for all products
  const [allProducts, setAllProducts] = useState([]);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [filters, setFilters] = useState({
    category: [], // This will be empty since we're already filtering by category
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

  // Wrap the filtering and sorting logic in useCallback
  const filterAndSortProducts = useCallback(
    (products) => {
      if (!products || products.length === 0) return;

      let filteredProducts = [...products];

      // Apply price filter
      const maxPrice = filters.price.max === 0 ? Infinity : filters.price.max;
      filteredProducts = filteredProducts.filter((item) => {
        const price = item.new_price > 0 ? item.new_price : item.old_price;
        return price >= filters.price.min && price <= maxPrice;
      });

      // Apply discount filter
      if (filters.discount) {
        filteredProducts = filteredProducts.filter(
          (item) => item.new_price > 0 && item.new_price < item.old_price
        );
      }

      // Apply rating filter
      if (filters.rating > 0) {
        filteredProducts = filteredProducts.filter((item) => {
          const productRating = Number(item.rating || 0);
          return productRating >= filters.rating;
        });
      }

      // Apply tags filter
      if (filters.tags.length > 0) {
        filteredProducts = filteredProducts.filter(
          (item) =>
            item.tags && filters.tags.some((tag) => item.tags.includes(tag))
        );
      }

      // Apply types filter
      if (filters.types.length > 0) {
        filteredProducts = filteredProducts.filter(
          (item) =>
            item.types &&
            filters.types.some((type) => item.types.includes(type))
        );
      }

      // Apply sorting
      switch (sortBy) {
        case "newest":
          filteredProducts.sort((a, b) => new Date(b.date) - new Date(a.date));
          break;
        case "price-asc":
          filteredProducts.sort((a, b) => {
            const priceA = a.new_price > 0 ? a.new_price : a.old_price;
            const priceB = b.new_price > 0 ? b.new_price : b.old_price;
            return priceA - priceB;
          });
          break;
        case "price-desc":
          filteredProducts.sort((a, b) => {
            const priceA = a.new_price > 0 ? a.new_price : a.old_price;
            const priceB = b.new_price > 0 ? b.new_price : b.old_price;
            return priceB - priceA;
          });
          break;
        case "discount":
          filteredProducts.sort((a, b) => {
            const discountA = a.old_price - (a.new_price || a.old_price);
            const discountB = b.old_price - (b.new_price || b.old_price);
            return discountB - discountA;
          });
          break;
        case "rating":
          filteredProducts.sort((a, b) => {
            const ratingA = Number(a.rating || 0);
            const ratingB = Number(b.rating || 0);
            return ratingB - ratingA;
          });
          break;
        default:
          break;
      }

      // Calculate total pages
      setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));

      // Apply pagination
      const startIndex = (currentPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      setDisplayedProducts(paginatedProducts);
    },
    [filters, sortBy, currentPage, itemsPerPage]
  );

  // Fetch products by category
  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(`${API_BASE_URL}/api/products/category/${category}?basicInfo=true`)
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
          setAllProducts(data);

          // Extract available tags and types
          setAvailableTags([
            ...new Set(data.flatMap((item) => item.tags || [])),
          ]);
          setAvailableTypes([
            ...new Set(data.flatMap((item) => item.types || [])),
          ]);

          // Apply initial filters
          filterAndSortProducts(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [category, filterAndSortProducts]);

  // Reapply filters when they change
  useEffect(() => {
    if (allProducts.length > 0) {
      filterAndSortProducts(allProducts);
    }
  }, [allProducts, filterAndSortProducts]);

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      switch (filterType) {
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

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
    // Find the target element on the page
    const targetElement = document.querySelector(".category-main-content");
    if (targetElement) {
      // Smoothly scroll the target element into view
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Handle items per page change
  const handleItemsPerPageChange = (items) => {
    setItemsPerPage(items);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Clear all filters
  const clearAllFilters = () => {
    setFilters({
      category: [], // Keep empty since we're already filtering by category
      price: { min: 0, max: 1000 },
      discount: false,
      rating: 0,
      tags: [],
      types: [],
    });
    setSortBy("newest");
    setCurrentPage(1);
  };

  return {
    // Data
    allProducts,
    displayedProducts, // This now contains the filtered products
    loading,
    error,
    totalPages,
    currentPage,
    itemsPerPage,
    sortBy,
    showSortOptions,
    filters,
    availableTags,
    availableTypes,

    // Display info
    displayRange: `${Math.min(
      (currentPage - 1) * itemsPerPage + 1,
      allProducts.length
    )}-${Math.min(currentPage * itemsPerPage, allProducts.length)}`,
    totalProducts: allProducts.length,

    // Actions
    setShowSortOptions,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    handleItemsPerPageChange,
    clearAllFilters,
  };
};

export default useCategoryProducts;
