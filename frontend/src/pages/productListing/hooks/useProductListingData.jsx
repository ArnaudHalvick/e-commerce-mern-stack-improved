import { useState, useEffect, useCallback, useRef } from "react";
import { productsService } from "../../../api";

/**
 * Custom hook for fetching, filtering, and sorting products on product listing pages
 * Works for both Offers and Category pages
 *
 * @param {Object} options Options object
 * @param {string} options.pageType Type of page ('offers' or 'category')
 * @param {string} options.category Category name (for category pages)
 * @returns {Object} Product listing data and functions
 */
const useProductListingData = ({ pageType, category }) => {
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

  // Track mounted state to prevent updates after unmount
  const isMounted = useRef(true);
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Wrap the filtering and sorting logic in useCallback so that its identity is stable
  const filterAndSortProducts = useCallback(
    (products) => {
      if (!isMounted.current) return;
      if (!products || products.length === 0) return;

      let filteredProducts = [...products];

      // Filter by category (only for offers page)
      if (pageType === "offers" && filters.category.length > 0) {
        filteredProducts = filteredProducts.filter((item) =>
          filters.category.some(
            (cat) => cat.toLowerCase() === (item.category || "").toLowerCase()
          )
        );
      }

      // Filter by price range
      // If max price is 0, ignore the upper limit by using Infinity
      const effectiveMax =
        filters.price.max === 0 ? Infinity : filters.price.max;
      filteredProducts = filteredProducts.filter((item) => {
        const price = item.new_price > 0 ? item.new_price : item.old_price;
        return price >= filters.price.min && price <= effectiveMax;
      });

      // Filter by discount
      if (filters.discount) {
        filteredProducts = filteredProducts.filter(
          (item) => item.new_price > 0 && item.new_price < item.old_price
        );
      }

      // Filter by rating
      if (filters.rating > 0) {
        filteredProducts = filteredProducts.filter((item) => {
          const productRating = Number(item.rating || 0);
          return productRating >= filters.rating;
        });
      }

      // Filter by tags
      if (filters.tags.length > 0) {
        filteredProducts = filteredProducts.filter(
          (item) =>
            item.tags && filters.tags.some((tag) => item.tags.includes(tag))
        );
      }

      // Filter by types
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
      if (isMounted.current) {
        setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));

        // Apply pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        setDisplayedProducts(paginatedProducts);
      }
    },
    [filters, sortBy, currentPage, itemsPerPage, pageType]
  );

  // Fetch products based on page type
  useEffect(() => {
    setLoading(true);
    setError(null);

    const fetchProducts = async () => {
      try {
        let data = [];

        if (pageType === "category" && category) {
          // For category pages, fetch products by category
          data = await productsService.getProductsByCategory(category);
        } else {
          // For offers page, fetch all products
          data = await productsService.getAllProducts();

          // For offers page, pre-filter to only show products with discounts
          data = data.filter(
            (product) =>
              product.new_price > 0 && product.new_price < product.old_price
          );
        }

        if (!Array.isArray(data)) {
          console.warn("API didn't return an array for products", data);
          if (isMounted.current) {
            setAllProducts([]);
            setDisplayedProducts([]);
          }
        } else {
          if (isMounted.current) {
            setAllProducts(data);
            setAvailableTags([
              ...new Set(data.flatMap((item) => item.tags || [])),
            ]);
            setAvailableTypes([
              ...new Set(data.flatMap((item) => item.types || [])),
            ]);
            filterAndSortProducts(data);
          }
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        if (isMounted.current) {
          setError(err.message || "Error fetching products. Please try again.");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    };

    fetchProducts();
  }, [category, filterAndSortProducts, pageType]);

  // Reapply filters and sorting whenever allProducts or filtering options change
  useEffect(() => {
    if (allProducts.length > 0) {
      filterAndSortProducts(allProducts);
    }
  }, [allProducts, filterAndSortProducts]);

  // Handle filter changes
  const handleFilterChange = useCallback((filterType, value) => {
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
          newFilters.rating = value === newFilters.rating ? 0 : value;
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

      return newFilters;
    });

    // Reset to page 1 when filters change
    setCurrentPage(1);
  }, []);

  // Handle sort change
  const handleSortChange = useCallback((sortOption) => {
    setSortBy(sortOption);
    setShowSortOptions(false);
  }, []);

  // Handle page change
  const handlePageChange = useCallback(
    (page) => {
      if (page < 1 || page > totalPages) return;
      setCurrentPage(page);

      // Scroll to top when changing pages
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    },
    [totalPages]
  );

  // Handle items per page change
  const handleItemsPerPageChange = useCallback((items) => {
    setItemsPerPage(Number(items));
    setCurrentPage(1); // Reset to page 1 when changing items per page
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
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
  }, []);

  // Calculate display range
  const totalProducts = allProducts.length;
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalProducts);
  const displayRange = totalProducts > 0 ? `${startItem}-${endItem}` : "0-0";

  return {
    // Data
    displayedProducts,
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
    displayRange,
    totalProducts,

    // Actions
    setShowSortOptions,
    handleFilterChange,
    handleSortChange,
    handlePageChange,
    handleItemsPerPageChange,
    clearAllFilters,
  };
};

export default useProductListingData;
