import React, { useState, useEffect } from "react";
import ListProductTable from "./components/ListProductTable";
import ListProductEditModal from "./components/ListProductEditModal";
import { useProductList } from "./hooks/useProductList";
import Button from "../ui/button/Button";
import Input from "../ui/input/Input";
import Select from "../ui/select/Select";
import { useToast } from "../ui/errorHandling/toast/ToastHooks";
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
  const [sortOption, setSortOption] = useState("name");
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
      // Sort based on selected option
      switch (sortOption) {
        case "name":
          return a.name.localeCompare(b.name);
        case "id":
          return a._id.localeCompare(b._id);
        case "date":
          return new Date(b.date) - new Date(a.date);
        case "priceAsc":
          return (a.new_price || a.old_price) - (b.new_price || b.old_price);
        case "priceDesc":
          return (b.new_price || b.old_price) - (a.new_price || a.old_price);
        default:
          return a.name.localeCompare(b.name);
      }
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
              { value: "date", label: "Sort by Date Added" },
              { value: "priceAsc", label: "Price: Low to High" },
              { value: "priceDesc", label: "Price: High to Low" },
            ]}
            className="list-product-filter-select"
          />
        </div>
      </div>

      <ListProductTable
        products={filteredProducts}
        loading={loading}
        onEdit={handleEditClick}
        onDelete={handleDeleteProduct}
        onToggleAvailability={handleToggleAvailability}
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
