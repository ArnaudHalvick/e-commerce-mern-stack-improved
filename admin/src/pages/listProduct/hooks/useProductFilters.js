import { useState, useMemo, useCallback } from "react";

/**
 * Custom hook for managing product filtering and sorting
 * @param {Array} products - The list of products to filter and sort
 * @returns {Object} Filtering and sorting functions and state
 */
const useProductFilters = (products = []) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    discount: "",
  });
  const [sortOption, setSortOption] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");

  // Extract unique categories from products
  const categories = useMemo(() => {
    return [...new Set(products.map((product) => product.category))];
  }, [products]);

  /**
   * Checks if a product matches the current search term
   */
  const matchesSearchTerm = useCallback(
    (product) => {
      if (!searchTerm) return true;

      const searchLower = searchTerm.toLowerCase();
      return (
        product?.name?.toLowerCase().includes(searchLower) ||
        product?._id?.toLowerCase().includes(searchLower) ||
        product?.category?.toLowerCase().includes(searchLower)
      );
    },
    [searchTerm]
  );

  /**
   * Checks if a product matches the category filter
   */
  const matchesCategoryFilter = useCallback(
    (product) => {
      if (!filters.category) return true;
      return product.category === filters.category;
    },
    [filters.category]
  );

  /**
   * Checks if a product matches the status filter
   */
  const matchesStatusFilter = useCallback(
    (product) => {
      if (!filters.status) return true;

      return (
        (filters.status === "active" && product.available) ||
        (filters.status === "inactive" && !product.available)
      );
    },
    [filters.status]
  );

  /**
   * Checks if a product matches the discount filter
   */
  const matchesDiscountFilter = useCallback(
    (product) => {
      if (!filters.discount) return true;

      const hasDiscount =
        product.new_price &&
        product.new_price > 0 &&
        product.new_price < product.old_price;

      return (
        (filters.discount === "discounted" && hasDiscount) ||
        (filters.discount === "regular" && !hasDiscount)
      );
    },
    [filters.discount]
  );

  /**
   * Sort comparator function for products
   */
  const sortProducts = useCallback(
    (a, b) => {
      let result = 0;

      switch (sortOption) {
        case "name":
          result = a.name.localeCompare(b.name);
          break;
        case "id":
          result = a._id.localeCompare(b._id);
          break;
        case "date":
          result = new Date(a.date) - new Date(b.date);
          break;
        case "category":
          result = a.category.localeCompare(b.category);
          break;
        case "price":
          result = (a.new_price || a.old_price) - (b.new_price || b.old_price);
          break;
        case "status":
          result = a.available === b.available ? 0 : a.available ? 1 : -1;
          break;
        default:
          result = a.name.localeCompare(b.name);
      }

      // Apply sort direction
      return sortDirection === "asc" ? result : -result;
    },
    [sortOption, sortDirection]
  );

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          matchesSearchTerm(product) &&
          matchesCategoryFilter(product) &&
          matchesStatusFilter(product) &&
          matchesDiscountFilter(product)
      )
      .sort(sortProducts);
  }, [
    products,
    matchesSearchTerm,
    matchesCategoryFilter,
    matchesStatusFilter,
    matchesDiscountFilter,
    sortProducts,
  ]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSortChange = (e) => {
    setSortOption(e.target.value);
  };

  const handleHeaderClick = (columnName) => {
    // Don't sort by actions column
    if (columnName === "actions") return;

    if (sortOption === columnName) {
      // Toggle direction if same column clicked
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to ascending for most columns, but descending for date
      setSortOption(columnName);
      setSortDirection(columnName === "date" ? "desc" : "asc");
    }
  };

  const toggleSortDirection = () => {
    setSortDirection(sortDirection === "asc" ? "desc" : "asc");
  };

  /**
   * Clears all filters but keeps sort settings
   */
  const clearFilters = useCallback(() => {
    setSearchTerm("");
    setFilters({
      category: "",
      status: "",
      discount: "",
    });
  }, []);

  return {
    searchTerm,
    filters,
    sortOption,
    sortDirection,
    categories,
    filteredProducts,
    handleSearchChange,
    handleFilterChange,
    handleSortChange,
    handleHeaderClick,
    toggleSortDirection,
    clearFilters,
  };
};

export default useProductFilters;
