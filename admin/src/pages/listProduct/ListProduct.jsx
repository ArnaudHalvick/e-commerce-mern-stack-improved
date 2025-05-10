import React, { useState, useEffect } from "react";
import ListProductTable from "./components/ListProductTable";
import ListProductEditModal from "./components/ListProductEditModal";
import { useProductList } from "./hooks/useProductList";
import Button from "../../components/ui/button/Button";
import Input from "../../components/ui/input/Input";
import Select from "../../components/ui/select/Select";
import { useToast } from "../../components/ui/errorHandling/toast/ToastHooks";
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

  // Filter products based on search term and filters
  const filteredProducts = products
    .filter((product) => {
      // Search term filter - now includes product ID
      const matchesSearch =
        searchTerm === "" ||
        product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product?.category?.toLowerCase().includes(searchTerm.toLowerCase());

      // Category filter
      const matchesCategory =
        filters.category === "" || product.category === filters.category;

      // Status filter
      const matchesStatus =
        filters.status === "" ||
        (filters.status === "active" && product.available) ||
        (filters.status === "inactive" && !product.available);

      // Discount filter
      const hasDiscount =
        product.new_price &&
        product.new_price > 0 &&
        product.new_price < product.old_price;
      const matchesDiscount =
        filters.discount === "" ||
        (filters.discount === "discounted" && hasDiscount) ||
        (filters.discount === "regular" && !hasDiscount);

      return (
        matchesSearch && matchesCategory && matchesStatus && matchesDiscount
      );
    })
    .sort((a, b) => {
      // Sort based on selected option and direction
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
    });

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
    if (window.confirm("Are you sure you want to delete this product?")) {
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
    }
  };

  if (error) {
    return (
      <div className="list-product-error">
        <h2>Error loading products</h2>
        <p>{error.message}</p>
        <Button onClick={fetchProducts}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="list-product-container">
      <div className="list-product-header">
        <h1>Products</h1>
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
            placeholder="Discount Status"
            value={filters.discount}
            onChange={(e) => handleFilterChange("discount", e.target.value)}
            options={[
              { value: "", label: "All Products" },
              { value: "discounted", label: "Discounted" },
              { value: "regular", label: "Not Discounted" },
            ]}
            className="list-product-filter-select"
          />
        </div>

        <div className="list-product-sort">
          <Select
            size="small"
            placeholder="Sort By"
            value={sortOption}
            onChange={handleSortChange}
            options={[
              { value: "name", label: "Sort by Name" },
              { value: "id", label: "Sort by ID" },
              { value: "category", label: "Sort by Category" },
              { value: "price", label: "Sort by Price" },
              { value: "status", label: "Sort by Status" },
              { value: "date", label: "Sort by Date" },
            ]}
            className="list-product-filter-select"
          />
          <Button
            size="medium"
            variant="outline"
            onClick={() =>
              setSortDirection(sortDirection === "asc" ? "desc" : "asc")
            }
            className="list-product-sort-direction"
            aria-label={`Sort ${
              sortDirection === "asc" ? "ascending" : "descending"
            }`}
          >
            {sortDirection === "asc" ? "↑ Ascending" : "↓ Descending"}
          </Button>
        </div>
      </div>

      <ListProductTable
        products={filteredProducts}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={handleDeleteProduct}
        onToggleAvailability={handleToggleAvailability}
        onHeaderClick={handleHeaderClick}
        sortOption={sortOption}
        sortDirection={sortDirection}
      />

      {selectedProduct && (
        <ListProductEditModal
          isOpen={isEditModalOpen}
          onClose={handleModalClose}
          product={selectedProduct}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};

export default ListProduct;
