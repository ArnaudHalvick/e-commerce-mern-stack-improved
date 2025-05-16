import React, { useEffect } from "react";
import ListProductTable from "./ListProductTable";
import { useProductList } from "../hooks/useProductList";
import useProductFilters from "../hooks/useProductFilters";
import useProductActions from "../hooks/useProductActions";
import {
  Button,
  Input,
  Select,
  DeleteProductModal,
} from "../../../components/ui";
import { ProductEditModal } from "../../../components/productEditModal";
import "../styles/ListProduct.css";

const ListProduct = () => {
  // Fetch products using the product list hook
  const { products, loading, error, fetchProducts } = useProductList();

  // Debug log products when they change
  useEffect(() => {
    console.log("Products loaded:", products.length);
    // Check if any products are missing IDs
    const missingIds = products.filter((p) => !p._id);
    if (missingIds.length > 0) {
      console.warn("Products missing IDs:", missingIds);
    }
  }, [products]);

  // Filter and sort products
  const {
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
  } = useProductFilters(products);

  // Product actions (edit, delete, toggle availability) using our shared hook
  const {
    // Edit modal
    isEditModalOpen,
    selectedProduct,
    handleEditClick,
    handleModalClose,
    handleSaveProduct,
    handleToggleAvailability,

    // Delete modal
    isDeleteModalOpen,
    productToDelete,
    isDeleting,
    handleOpenDeleteModal,
    handleCloseDeleteModal,
    handleConfirmDelete,
  } = useProductActions({
    fetchProducts,
  });

  // Debug log when selectedProduct changes
  useEffect(() => {
    if (selectedProduct) {
      console.log("Selected product for editing:", {
        id: selectedProduct._id,
        name: selectedProduct.name,
        hasAllFields:
          !!selectedProduct.name &&
          !!selectedProduct.shortDescription &&
          !!selectedProduct.longDescription &&
          !!selectedProduct.category,
      });
    }
  }, [selectedProduct]);

  // Fetch products on component mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Show error UI if there's an error
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
        <h1 className="admin-page-title">Products</h1>
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

          <Button
            variant="outline"
            size="small"
            onClick={clearFilters}
            className="list-product-clear-filters"
          >
            Clear Filters
          </Button>
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
            onClick={toggleSortDirection}
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
            onDelete={handleOpenDeleteModal}
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

      {/* Delete Product Modal */}
      <DeleteProductModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
        productName={productToDelete?.name}
        isProcessing={isDeleting}
      />
    </div>
  );
};

export default ListProduct;
