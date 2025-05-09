import React, { useState, useEffect } from "react";
import ListProductTable from "./components/ListProductTable";
import ListProductEditModal from "./components/ListProductEditModal";
import { useProductList } from "./hooks/useProductList";
import { Button } from "../ui/button/Button";
import { useToast } from "../ui/errorHandling/toast/ToastHooks";
import "./styles/ListProduct.css";

const ListProduct = () => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
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

  // Filter products based on search term
  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  const handleSaveProduct = async (updatedProduct) => {
    try {
      await updateProduct(updatedProduct._id, updatedProduct);
      showToast({
        type: "success",
        message: "Product updated successfully",
      });
      handleModalClose();
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
        <div className="list-product-actions">
          <div className="list-product-search-container">
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="list-product-search-input"
            />
          </div>
          <Button>Add New Product</Button>
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
