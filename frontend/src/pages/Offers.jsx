// Path: frontend/src/pages/Offers.jsx

// External Libraries
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

// Internal Components
import Item from "../components/item/Item";

// Styles and Assets
import "./CSS/Offers.css";
import arrow_icon from "../components/assets/breadcrum_arrow.png";
import dropdown_icon from "../components/assets/dropdown_icon.png";
import "../components/breadcrumbs/breadcrumb.css";

// Simple breadcrumb component for the offers page
const OffersBreadcrumb = () => {
  return (
    <div className="breadcrumb">
      <Link to="/" className="breadcrumb-link">
        HOME
      </Link>
      <img src={arrow_icon} alt="" />
      <span className="breadcrumb-current">OFFERS</span>
    </div>
  );
};

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

  // Fetch all products
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
          // Log sample of the product data to debug
          console.log("Received product data sample:", data.slice(0, 3));
          console.log("Product categories:", [
            ...new Set(data.map((p) => p.category)),
          ]);
          console.log(
            "Product ratings distribution:",
            data.reduce((acc, p) => {
              const rating = Math.floor(p.rating || 0);
              acc[rating] = (acc[rating] || 0) + 1;
              return acc;
            }, {})
          );

          setAllProducts(data);

          // Extract unique tags and types for filters
          const tags = [...new Set(data.flatMap((item) => item.tags || []))];
          const types = [...new Set(data.flatMap((item) => item.types || []))];

          setAvailableTags(tags);
          setAvailableTypes(types);

          // Initial filtering and sorting
          applyFiltersAndSort(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // Apply filters and sorting whenever filters or sort option changes
  useEffect(() => {
    if (allProducts.length > 0) {
      applyFiltersAndSort(allProducts);
    }
  }, [filters, sortBy, currentPage, itemsPerPage]);

  // Function to apply filters and sorting
  const applyFiltersAndSort = (products) => {
    // Apply filters
    let filtered = [...products];

    // Filter by category
    if (filters.category.length > 0) {
      console.log("Filtering by categories:", filters.category);
      console.log(
        "First few products' categories:",
        filtered.slice(0, 3).map((item) => item.category)
      );

      filtered = filtered.filter((item) => {
        // Ensure case-insensitive comparison
        return filters.category.some(
          (cat) => cat.toLowerCase() === (item.category || "").toLowerCase()
        );
      });
    }

    // Filter by price range
    filtered = filtered.filter((item) => {
      const price = item.new_price > 0 ? item.new_price : item.old_price;
      return price >= filters.price.min && price <= filters.price.max;
    });

    // Filter by discount
    if (filters.discount) {
      filtered = filtered.filter(
        (item) => item.new_price > 0 && item.new_price < item.old_price
      );
    }

    // Filter by rating
    if (filters.rating > 0) {
      console.log("Filtering by rating:", filters.rating);
      console.log(
        "Sample product ratings:",
        filtered.slice(0, 5).map((item) => ({
          name: item.name,
          rating: item.rating || 0,
        }))
      );

      filtered = filtered.filter((item) => {
        // Ensure rating is a number, default to 0 if undefined/null
        const productRating = Number(item.rating || 0);
        return productRating >= filters.rating;
      });
      console.log("Products after rating filter:", filtered.length);
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
          item.types && filters.types.some((type) => item.types.includes(type))
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
        console.log("Sorting by rating");
        // Log a few products before sorting
        const sampleBefore = filtered.slice(0, 5).map((p) => ({
          name: p.name,
          rating: p.rating || 0,
        }));
        console.log("Sample before sort:", sampleBefore);

        filtered.sort((a, b) => {
          // Ensure we're comparing numbers and handling null/undefined ratings
          const ratingA = Number(a.rating || 0);
          const ratingB = Number(b.rating || 0);
          return ratingB - ratingA;
        });

        // Log products after sorting
        const sampleAfter = filtered.slice(0, 5).map((p) => ({
          name: p.name,
          rating: p.rating || 0,
        }));
        console.log("Sample after sort:", sampleAfter);
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
  };

  // Handle filter changes
  const handleFilterChange = (filterType, value) => {
    setFilters((prev) => {
      const newFilters = { ...prev };

      switch (filterType) {
        case "category":
          // Toggle category selection
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
          // Toggle tag selection
          if (newFilters.tags.includes(value)) {
            newFilters.tags = newFilters.tags.filter((tag) => tag !== value);
          } else {
            newFilters.tags = [...newFilters.tags, value];
          }
          break;
        case "type":
          // Toggle type selection
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

      <div className="offers-header">
        <h1>Exclusive Deals Just for You</h1>
        <p>Discover our best deals and special offers curated just for you</p>
      </div>

      <div className="offers-layout">
        {/* Filter Sidebar */}
        <div className="filter-sidebar">
          <div className="filter-section">
            <h3>Filters</h3>
            <button className="clear-filters" onClick={clearAllFilters}>
              Clear All
            </button>
          </div>

          {/* Category Filter */}
          <div className="filter-section">
            <h4>Category</h4>
            <div className="filter-options">
              {["men", "women", "kids"].map((category) => (
                <label key={category} className="filter-checkbox">
                  <input
                    type="checkbox"
                    checked={filters.category.includes(category)}
                    onChange={() => handleFilterChange("category", category)}
                  />
                  <span className="checkmark"></span>
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-inputs">
              <input
                type="number"
                min="0"
                max={filters.price.max}
                value={filters.price.min}
                onChange={(e) =>
                  handleFilterChange("price", {
                    ...filters.price,
                    min: Number(e.target.value),
                  })
                }
                placeholder="Min"
              />
              <span>-</span>
              <input
                type="number"
                min={filters.price.min}
                value={filters.price.max}
                onChange={(e) =>
                  handleFilterChange("price", {
                    ...filters.price,
                    max: Number(e.target.value),
                  })
                }
                placeholder="Max"
              />
            </div>
          </div>

          {/* Discount Filter */}
          <div className="filter-section">
            <label className="filter-checkbox">
              <input
                type="checkbox"
                checked={filters.discount}
                onChange={() =>
                  handleFilterChange("discount", !filters.discount)
                }
              />
              <span className="checkmark"></span>
              Discounted Items Only
            </label>
          </div>

          {/* Rating Filter */}
          <div className="filter-section">
            <h4>Rating</h4>
            <div className="rating-filter">
              {[5, 4, 3, 2, 1].map((star) => (
                <div
                  key={star}
                  className={`star-rating ${
                    filters.rating === star ? "active" : ""
                  }`}
                  onClick={() =>
                    handleFilterChange(
                      "rating",
                      filters.rating === star ? 0 : star
                    )
                  }
                >
                  {star}★ & Up {filters.rating === star && "✓"}
                </div>
              ))}
            </div>
          </div>

          {/* Tags Filter */}
          {availableTags.length > 0 && (
            <div className="filter-section">
              <h4>Tags</h4>
              <div className="filter-options">
                {availableTags.map((tag) => (
                  <label key={tag} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.tags.includes(tag)}
                      onChange={() => handleFilterChange("tag", tag)}
                    />
                    <span className="checkmark"></span>
                    {tag}
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Types Filter */}
          {availableTypes.length > 0 && (
            <div className="filter-section">
              <h4>Product Types</h4>
              <div className="filter-options">
                {availableTypes.map((type) => (
                  <label key={type} className="filter-checkbox">
                    <input
                      type="checkbox"
                      checked={filters.types.includes(type)}
                      onChange={() => handleFilterChange("type", type)}
                    />
                    <span className="checkmark"></span>
                    {type}
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Products Content */}
        <div className="products-content">
          <div className="offers-filter-bar">
            <p>
              <span>Showing {displayRange} </span>of {allProducts.length}{" "}
              products
            </p>

            <div className="controls-container">
              {/* Items per page selector */}
              <div className="items-per-page">
                Show:
                <select
                  value={itemsPerPage}
                  onChange={(e) =>
                    handleItemsPerPageChange(Number(e.target.value))
                  }
                >
                  <option value={12}>12</option>
                  <option value={24}>24</option>
                  <option value={48}>48</option>
                </select>
              </div>

              {/* Sort dropdown */}
              <div
                className="sort-dropdown"
                onClick={() => setShowSortOptions(!showSortOptions)}
              >
                Sort by:{" "}
                {sortBy === "newest"
                  ? "Newest"
                  : sortBy === "price-asc"
                  ? "Price: Low to High"
                  : sortBy === "price-desc"
                  ? "Price: High to Low"
                  : sortBy === "discount"
                  ? "Biggest Discount"
                  : sortBy === "rating"
                  ? "Highest Rating"
                  : "Newest"}
                <img src={dropdown_icon} alt="" />
                {showSortOptions && (
                  <div className="sort-options">
                    <div onClick={() => handleSortChange("newest")}>Newest</div>
                    <div onClick={() => handleSortChange("price-asc")}>
                      Price: Low to High
                    </div>
                    <div onClick={() => handleSortChange("price-desc")}>
                      Price: High to Low
                    </div>
                    <div onClick={() => handleSortChange("discount")}>
                      Biggest Discount
                    </div>
                    <div onClick={() => handleSortChange("rating")}>
                      Highest Rating
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Product Grid */}
          <div className="product-grid">
            {displayedProducts.length > 0 ? (
              displayedProducts.map((item, index) => (
                <Item
                  key={item._id || item.id || index}
                  id={item.id}
                  _id={item._id}
                  slug={item.slug}
                  name={item.name}
                  images={item.images}
                  mainImageIndex={item.mainImageIndex}
                  new_price={item.new_price}
                  old_price={item.old_price}
                />
              ))
            ) : (
              <div className="no-products">
                <p>No products match your filters.</p>
                <button onClick={clearAllFilters}>Clear Filters</button>
              </div>
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                className={`page-btn ${currentPage === 1 ? "disabled" : ""}`}
                onClick={() =>
                  currentPage > 1 && handlePageChange(currentPage - 1)
                }
                disabled={currentPage === 1}
              >
                Previous
              </button>

              <div className="page-numbers">
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;

                  // Show ellipsis for large page counts
                  if (totalPages > 7) {
                    // Always show first and last pages
                    if (pageNumber === 1 || pageNumber === totalPages) {
                      return (
                        <button
                          key={pageNumber}
                          className={`page-number ${
                            currentPage === pageNumber ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    }

                    // Show pages around current page
                    if (
                      pageNumber === currentPage ||
                      pageNumber === currentPage - 1 ||
                      pageNumber === currentPage + 1
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          className={`page-number ${
                            currentPage === pageNumber ? "active" : ""
                          }`}
                          onClick={() => handlePageChange(pageNumber)}
                        >
                          {pageNumber}
                        </button>
                      );
                    }

                    // Show ellipsis
                    if (
                      (pageNumber === 2 && currentPage > 3) ||
                      (pageNumber === totalPages - 1 &&
                        currentPage < totalPages - 2)
                    ) {
                      return (
                        <span key={pageNumber} className="ellipsis">
                          ...
                        </span>
                      );
                    }

                    return null;
                  }

                  // Show all pages for small page counts
                  return (
                    <button
                      key={pageNumber}
                      className={`page-number ${
                        currentPage === pageNumber ? "active" : ""
                      }`}
                      onClick={() => handlePageChange(pageNumber)}
                    >
                      {pageNumber}
                    </button>
                  );
                })}
              </div>

              <button
                className={`page-btn ${
                  currentPage === totalPages ? "disabled" : ""
                }`}
                onClick={() =>
                  currentPage < totalPages && handlePageChange(currentPage + 1)
                }
                disabled={currentPage === totalPages}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Offers;
