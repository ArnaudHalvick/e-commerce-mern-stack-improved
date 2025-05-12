import React, { useState, useEffect } from "react";
import ListProductTable from "./components/ListProductTable";
import { useProductList } from "./hooks/useProductList";
import Button from "../../components/ui/button/Button";
import Input from "../../components/ui/input/Input";
import Select from "../../components/ui/select/Select";
import { useToast } from "../../components/ui/errorHandling/toast/ToastHooks";
import { ProductEditModal } from "../../components/productEditModal";
import "./styles/ListProduct.css";

const ListProduct = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    discount: "",
  });
  const [sortOption, setSortOption] = useState("date");
  const [sortDirection, setSortDirection] = useState("desc");
  const { showToast } = useToast();

  const {
    products,
    loading,
    error,
    fetchProducts,
    updateProduct,
    deleteProduct,
    toggleProductAvailability,
  } = useProductList();

  // Extract unique categories from products
  const categories = [...new Set(products.map((product) => product.category))];

  /**
   * Checks if a product matches the current search term
   */
  const matchesSearchTerm = (product) => {
    if (!searchTerm) return true;

    const searchLower = searchTerm.toLowerCase();
    return (
      product?.name?.toLowerCase().includes(searchLower) ||
      product?._id?.toLowerCase().includes(searchLower) ||
      product?.category?.toLowerCase().includes(searchLower)
    );
  };

  /**
   * Checks if a product matches the category filter
   */
  const matchesCategoryFilter = (product) => {
    if (!filters.category) return true;
    return product.category === filters.category;
  };

  /**
   * Checks if a product matches the status filter
   */
  const matchesStatusFilter = (product) => {
    if (!filters.status) return true;

    return (
      (filters.status === "active" && product.available) ||
      (filters.status === "inactive" && !product.available)
    );
  };

  /**
   * Checks if a product matches the discount filter
   */
  const matchesDiscountFilter = (product) => {
    if (!filters.discount) return true;

    const hasDiscount =
      product.new_price &&
      product.new_price > 0 &&
      product.new_price < product.old_price;

    return (
      (filters.discount === "discounted" && hasDiscount) ||
      (filters.discount === "regular" && !hasDiscount)
    );
  };

  /**
   * Sort comparator function for products
   */
  const sortProducts = (a, b) => {
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
  };

  // Filter and sort products
  const filteredProducts = products
    .filter(
      (product) =>
        matchesSearchTerm(product) &&
        matchesCategoryFilter(product) &&
        matchesStatusFilter(product) &&
        matchesDiscountFilter(product)
    )
    .sort(sortProducts);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleEditClick = (product) => {
    setSelectedProduct(product);
    setIsEditModalOpen(true);
  };

  const handleModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedProduct(null);
  };

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

  const handleSaveProduct = async (updatedProduct) => {
    try {
      await updateProduct(updatedProduct._id, updatedProduct);
      showToast({
        type: "success",
        message: "Product updated successfully",
      });
      handleModalClose();
      // Refresh the product list after update
      fetchProducts();
    } catch (error) {
      showToast({
        type: "error",
        message: `Failed to update product: ${error.message}`,
      });
    }
  };

  const handleToggleAvailability = async (productId, currentStatus) => {
    try {
      await toggleProductAvailability(productId, !currentStatus);
      showToast({
        type: "success",
        message: `Product ${
          !currentStatus ? "activated" : "deactivated"
        } successfully`,
      });
      // Refresh the product list after toggling availability
      fetchProducts();
    } catch (error) {
      showToast({
        type: "error",
        message: `Failed to update product availability: ${error.message}`,
      });
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await deleteProduct(productId);
      showToast({
        type: "success",
        message: "Product deleted successfully",
      });
    } catch (error) {
      showToast({
        type: "error",
        message: `Failed to delete product: ${error.message}`,
      });
    }
  };

  if (error) {
    return (
      <div className="list-product-error">
        <h2 className="list-product-error-title">Error loading products</h2>
        <p className="list-product-error-message">{error.message}</p>
        <Button onClick={fetchProducts}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="list-product-container">
      <div className="list-product-header">
        <h1 className="list-product-header-title">Products</h1>
      </div>

      <div className="list-product-filter-section">
        <div className="list-product-filters">
          <Input
            type="text"
            placeholder="Search by name or ID..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="list-product-filter-input"
            size="small"
          />

          <Select
            size="small"
            placeholder="Select Category"
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            options={[
              { value: "", label: "All Categories" },
              ...categories.map((category) => ({
                value: category,
                label: category.charAt(0).toUpperCase() + category.slice(1),
              })),
            ]}
            className="list-product-filter-select"
          />

          <Select
            size="small"
            placeholder="Product Status"
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            options={[
              { value: "", label: "All Status" },
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
            className="list-product-filter-select"
          />

          <Select
            size="small"
            placeholder="Discount"
            value={filters.discount}
            onChange={(e) => handleFilterChange("discount", e.target.value)}
            options={[
              { value: "", label: "All Products" },
              { value: "discounted", label: "Discounted" },
              { value: "regular", label: "Regular Price" },
            ]}
            className="list-product-filter-select"
          />
        </div>

        <div className="list-product-sort">
          <label htmlFor="sort-select" className="list-product-sort-label">
            Sort by:
          </label>
          <Select
            id="sort-select"
            size="small"
            value={sortOption}
            onChange={handleSortChange}
            options={[
              { value: "date", label: "Date" },
              { value: "name", label: "Name" },
              { value: "id", label: "ID" },
              { value: "price", label: "Price" },
              { value: "category", label: "Category" },
              { value: "status", label: "Status" },
            ]}
            className="list-product-sort-select"
          />
          <Button
            variant="text"
            size="small"
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
            className="list-product-sort-direction"
          >
            {sortDirection === "asc" ? "↑" : "↓"}
          </Button>
        </div>
      </div>

      <div className="list-product-table-container">
        {loading ? (
          <div className="list-product-loading">Loading products...</div>
        ) : (
          <ListProductTable
            products={filteredProducts}
            onEdit={handleEditClick}
            onDelete={handleDeleteProduct}
            onToggleAvailability={handleToggleAvailability}
            sortOption={sortOption}
            sortDirection={sortDirection}
            onHeaderClick={handleHeaderClick}
          />
        )}
      </div>

      {/* Product Edit Modal */}
      {selectedProduct && (
        <ProductEditModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          product={selectedProduct}
          onSave={handleSaveProduct}
          title={`Edit Product: ${selectedProduct.name}`}
        />
      )}
    </div>
  );
};

export default ListProduct;
