import { useState, useEffect, useCallback, useRef, useContext } from "react";
import { productsService } from "../../../api";
import { ShopContext } from "../../../context/ShopContext";
import { scrollToElement } from "../../../utils/scrollHelpers";

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
  // Get access to the ShopContext for category pages
  const {
    all_product,
    loading: contextLoading,
    isInitialized,
    fetchProducts: fetchGlobalProducts,
  } = useContext(ShopContext);

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
  // Track if the request is in progress to prevent duplicate fetches (StrictMode issue)
  const isRequestInProgress = useRef(false);
  // Track component initialization to prevent duplicate fetch on remount
  const isInitialFetchDone = useRef(false);

  useEffect(() => {
    // Reset isMounted on component mount
    isMounted.current = true;

    return () => {
      isMounted.current = false;
    };
  }, []);

  // Function to filter and sort products
  const filterAndSortProducts = useCallback(
    (products) => {
      if (!isMounted.current) return;
      if (!products || products.length === 0) {
        setDisplayedProducts([]);
        return;
      }

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

      // Set the total pages based on filtered products and items per page
      if (isMounted.current) {
        setTotalPages(Math.ceil(filteredProducts.length / itemsPerPage));

        // Apply pagination
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

        // Update displayed products
        setDisplayedProducts(paginatedProducts);
      }
    },
    [filters, sortBy, currentPage, itemsPerPage, pageType]
  );

  // Store the previous category value to detect changes
  const prevCategoryRef = useRef();
  const prevPageTypeRef = useRef();
  const offersLoadedRef = useRef(false);

  // Fetch products based on page type - only run on first mount or when params change
  useEffect(() => {
    // Only fetch if:
    // 1. Category or pageType has changed, OR
    // 2. This is the initial mount of the component AND we haven't fetched yet
    const categoryChanged = prevCategoryRef.current !== category;
    const pageTypeChanged = prevPageTypeRef.current !== pageType;
    const initialRender = !isInitialFetchDone.current;

    // Update refs for next comparison
    prevCategoryRef.current = category;
    prevPageTypeRef.current = pageType;

    // Exit if already fetching or if no need to fetch
    if (isRequestInProgress.current) {
      return;
    }

    if (!categoryChanged && !pageTypeChanged && !initialRender) {
      return;
    }

    // Set initialization flag
    isInitialFetchDone.current = true;

    // Start fetch process
    setLoading(true);
    setError(null);
    isRequestInProgress.current = true;

    const fetchPageProducts = async () => {
      try {
        let data = [];

        if (pageType === "category" && category) {
          // For category pages, fetch products by category
          const response = await productsService.getProductsByCategory(
            category
          );

          if (Array.isArray(response)) {
            data = response;
          } else {
            data = [];
          }
        } else if (pageType === "offers") {
          // For offers page, check if we need to load global products first
          if (!isInitialized && !offersLoadedRef.current) {
            offersLoadedRef.current = true; // Prevent infinite recursion
            fetchGlobalProducts(); // Trigger global product loading
            isRequestInProgress.current = false;
            return; // We'll wait for context to update
          }

          // Once global products are loaded, filter them for offers
          if (all_product && all_product.length > 0) {
            data = all_product.filter(
              (product) =>
                product.new_price > 0 && product.new_price < product.old_price
            );
          }
        }

        if (!Array.isArray(data)) {
          if (isMounted.current) {
            setAllProducts([]);
            setDisplayedProducts([]);
            isRequestInProgress.current = false;
            setLoading(false);
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
            isRequestInProgress.current = false;
            setLoading(false);
          }
        }
      } catch (err) {
        if (isMounted.current) {
          setError("Failed to load products. Please try again later.");
          isRequestInProgress.current = false;
          setLoading(false);
        }
      }
    };

    fetchPageProducts();
  }, [
    pageType,
    category,
    isInitialized,
    all_product,
    fetchGlobalProducts,
    filterAndSortProducts,
  ]);

  // Check if we need to update from context when it changes
  useEffect(() => {
    // Only for offers page and only when context has products
    if (
      pageType === "offers" &&
      isInitialized &&
      all_product &&
      all_product.length > 0 &&
      !isRequestInProgress.current
    ) {
      // Prevent duplicate updates
      if (loading === false && allProducts.length > 0) {
        return;
      }

      const offersData = all_product.filter(
        (product) =>
          product.new_price > 0 && product.new_price < product.old_price
      );

      if (isMounted.current) {
        setAllProducts(offersData);
        setAvailableTags([
          ...new Set(offersData.flatMap((item) => item.tags || [])),
        ]);
        setAvailableTypes([
          ...new Set(offersData.flatMap((item) => item.types || [])),
        ]);
        filterAndSortProducts(offersData);
        setLoading(false);
      }
    }
  }, [
    pageType,
    isInitialized,
    all_product,
    filterAndSortProducts,
    loading,
    allProducts.length,
  ]);

  // Apply filters and sorting when filter states change
  useEffect(() => {
    if (allProducts.length > 0) {
      filterAndSortProducts(allProducts);
    }
  }, [
    filters,
    sortBy,
    currentPage,
    itemsPerPage,
    allProducts,
    filterAndSortProducts,
  ]);

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

      // Scroll to product listing content instead of top
      scrollToElement(".product-listing-products-content", {
        behavior: "smooth",
        block: "start",
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

    // If we're on the offers page and have no products showing,
    // try to trigger a reload of the data
    if (pageType === "offers" && displayedProducts.length === 0) {
      if (all_product && all_product.length > 0) {
        const offersData = all_product.filter(
          (product) =>
            product.new_price > 0 && product.new_price < product.old_price
        );
        setAllProducts(offersData);
        filterAndSortProducts(offersData);
      } else if (!contextLoading && isInitialized) {
        // If context is loaded but we have no products, try fetching again
        fetchGlobalProducts();
      }
    }
  }, [
    pageType,
    displayedProducts.length,
    all_product,
    contextLoading,
    isInitialized,
    fetchGlobalProducts,
    filterAndSortProducts,
  ]);

  // Calculate display range
  const totalProducts = allProducts.length;
  const startItem =
    totalProducts > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0;
  const endItem = Math.min(startItem + itemsPerPage - 1, totalProducts);
  const displayRange = totalProducts > 0 ? `${startItem}-${endItem}` : "0-0";

  return {
    // Data
    displayedProducts,
    loading: loading || (pageType === "offers" && contextLoading),
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
