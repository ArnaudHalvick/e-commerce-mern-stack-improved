import { useEffect, useCallback, useRef, useReducer } from "react";
import { config, productsService } from "../../../api";

// Initial state for filters
const initialFiltersState = {
  category: [], // This will be empty since we're already filtering by category
  price: { min: 0, max: 1000 },
  discount: false,
  rating: 0,
  tags: [],
  types: [],
};

// Action types
const ACTIONS = {
  SET_CATEGORY_DATA: "SET_CATEGORY_DATA",
  SET_LOADING: "SET_LOADING",
  SET_ERROR: "SET_ERROR",
  UPDATE_FILTER: "UPDATE_FILTER",
  CLEAR_FILTERS: "CLEAR_FILTERS",
  SET_SORT: "SET_SORT",
  SET_PAGE: "SET_PAGE",
  SET_ITEMS_PER_PAGE: "SET_ITEMS_PER_PAGE",
  SET_SHOW_SORT_OPTIONS: "SET_SHOW_SORT_OPTIONS",
  APPLY_FILTERS: "APPLY_FILTERS",
};

// Reducer function for state management
const categoryReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.SET_CATEGORY_DATA:
      return {
        ...state,
        allProducts: action.payload.products,
        displayedProducts: action.payload.filtered,
        availableTags: action.payload.tags,
        availableTypes: action.payload.types,
        totalPages: Math.ceil(
          action.payload.filtered.length / state.itemsPerPage
        ),
        loading: false,
      };
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, loading: false };
    case ACTIONS.UPDATE_FILTER:
      const { filterType, value } = action.payload;
      const newFilters = { ...state.filters };

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

      return {
        ...state,
        filters: newFilters,
        currentPage: 1, // Reset to first page when filters change
      };
    case ACTIONS.CLEAR_FILTERS:
      return {
        ...state,
        filters: initialFiltersState,
        sortBy: "newest",
        currentPage: 1,
      };
    case ACTIONS.SET_SORT:
      return {
        ...state,
        sortBy: action.payload,
        showSortOptions: false,
      };
    case ACTIONS.SET_PAGE:
      return { ...state, currentPage: action.payload };
    case ACTIONS.SET_ITEMS_PER_PAGE:
      return {
        ...state,
        itemsPerPage: action.payload,
        currentPage: 1,
      };
    case ACTIONS.SET_SHOW_SORT_OPTIONS:
      return { ...state, showSortOptions: action.payload };
    case ACTIONS.APPLY_FILTERS: {
      if (!state.allProducts || state.allProducts.length === 0) {
        return state;
      }

      let filteredProducts = [...state.allProducts];

      // Apply price filter
      const maxPrice =
        state.filters.price.max === 0 ? Infinity : state.filters.price.max;
      filteredProducts = filteredProducts.filter((item) => {
        const price = item.new_price > 0 ? item.new_price : item.old_price;
        return price >= state.filters.price.min && price <= maxPrice;
      });

      // Apply discount filter
      if (state.filters.discount) {
        filteredProducts = filteredProducts.filter(
          (item) => item.new_price > 0 && item.new_price < item.old_price
        );
      }

      // Apply rating filter
      if (state.filters.rating > 0) {
        filteredProducts = filteredProducts.filter((item) => {
          const productRating = Number(item.rating || 0);
          return productRating >= state.filters.rating;
        });
      }

      // Apply tags filter
      if (state.filters.tags.length > 0) {
        filteredProducts = filteredProducts.filter(
          (item) =>
            item.tags &&
            state.filters.tags.some((tag) => item.tags.includes(tag))
        );
      }

      // Apply types filter
      if (state.filters.types.length > 0) {
        filteredProducts = filteredProducts.filter(
          (item) =>
            item.types &&
            state.filters.types.some((type) => item.types.includes(type))
        );
      }

      // Apply sorting
      switch (state.sortBy) {
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
      const totalPages = Math.ceil(
        filteredProducts.length / state.itemsPerPage
      );

      // Apply pagination
      const startIndex = (state.currentPage - 1) * state.itemsPerPage;
      const endIndex = startIndex + state.itemsPerPage;
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

      return {
        ...state,
        displayedProducts: paginatedProducts,
        totalPages,
      };
    }
    default:
      return state;
  }
};

/**
 * Custom hook for fetching and filtering products by category
 *
 * @param {String} category - Category name to fetch products for
 * @returns {Object} Products data, filtering options, and actions
 */
const useCategoryProducts = (category) => {
  // Create a ref to track category changes
  const prevCategoryRef = useRef(null);

  // Use useReducer for more predictable state updates
  const [state, dispatch] = useReducer(categoryReducer, {
    // Products data
    allProducts: [],
    displayedProducts: [],
    loading: true,
    error: null,

    // Filter state
    filters: initialFiltersState,

    // Sort state
    sortBy: "newest",
    showSortOptions: false,

    // Pagination state
    currentPage: 1,
    itemsPerPage: 12,
    totalPages: 1,

    // Available filter options
    availableTags: [],
    availableTypes: [],
  });

  // Memoized function for applying filters
  const applyFilters = useCallback(() => {
    dispatch({ type: ACTIONS.APPLY_FILTERS });
  }, []);

  // Handle reset when category changes
  useEffect(() => {
    // Check if category has changed (not on first render)
    if (prevCategoryRef.current && prevCategoryRef.current !== category) {
      // Reset filters when navigating between categories
      dispatch({ type: ACTIONS.CLEAR_FILTERS });
    }

    // Update the ref with current category
    prevCategoryRef.current = category;
  }, [category]);

  // Fetch products by category
  useEffect(() => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true });

    const fetchCategoryProducts = async () => {
      try {
        // Use the productsService to get products by category
        const data = await productsService.getProductsByCategory(category);

        if (!Array.isArray(data)) {
          console.warn("API didn't return an array for products", data);
          dispatch({
            type: ACTIONS.SET_CATEGORY_DATA,
            payload: {
              products: [],
              filtered: [],
              tags: [],
              types: [],
            },
          });
        } else {
          // Extract available tags and types
          const tags = [...new Set(data.flatMap((item) => item.tags || []))];
          const types = [...new Set(data.flatMap((item) => item.types || []))];

          dispatch({
            type: ACTIONS.SET_CATEGORY_DATA,
            payload: {
              products: data,
              filtered: data,
              tags,
              types,
            },
          });
        }
      } catch (err) {
        console.error("Error fetching products:", err);
        dispatch({
          type: ACTIONS.SET_ERROR,
          payload: err.message,
        });
      }
    };

    fetchCategoryProducts();
  }, [category, dispatch]);

  // Apply filters whenever filters, sorting, or pagination changes
  useEffect(() => {
    if (state.allProducts.length > 0) {
      applyFilters();
    }
  }, [
    state.allProducts,
    state.filters,
    state.sortBy,
    state.currentPage,
    state.itemsPerPage,
    applyFilters,
  ]);

  // Filter change handler
  const handleFilterChange = useCallback((filterType, value) => {
    dispatch({
      type: ACTIONS.UPDATE_FILTER,
      payload: { filterType, value },
    });
  }, []);

  // Sort change handler
  const handleSortChange = useCallback((sortOption) => {
    dispatch({ type: ACTIONS.SET_SORT, payload: sortOption });
  }, []);

  // Page change handler
  const handlePageChange = useCallback((page) => {
    dispatch({ type: ACTIONS.SET_PAGE, payload: page });

    // Find the target element on the page
    const targetElement = document.querySelector(".category-main-content");
    if (targetElement) {
      // Smoothly scroll the target element into view
      targetElement.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  // Items per page change handler
  const handleItemsPerPageChange = useCallback((items) => {
    dispatch({ type: ACTIONS.SET_ITEMS_PER_PAGE, payload: items });
  }, []);

  // Clear all filters
  const clearAllFilters = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_FILTERS });
  }, []);

  // Set show sort options handler
  const setShowSortOptions = useCallback((show) => {
    dispatch({ type: ACTIONS.SET_SHOW_SORT_OPTIONS, payload: show });
  }, []);

  // Calculate display range for products
  const displayRange = `${Math.min(
    (state.currentPage - 1) * state.itemsPerPage + 1,
    state.allProducts.length
  )}-${Math.min(
    state.currentPage * state.itemsPerPage,
    state.allProducts.length
  )}`;

  return {
    // Data
    allProducts: state.allProducts,
    displayedProducts: state.displayedProducts,
    loading: state.loading,
    error: state.error,
    totalPages: state.totalPages,
    currentPage: state.currentPage,
    itemsPerPage: state.itemsPerPage,
    sortBy: state.sortBy,
    showSortOptions: state.showSortOptions,
    filters: state.filters,
    availableTags: state.availableTags,
    availableTypes: state.availableTypes,

    // Display info
    displayRange,
    totalProducts: state.allProducts.length,

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
