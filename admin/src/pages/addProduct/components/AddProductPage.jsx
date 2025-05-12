import React from "react";
import { useAddProduct } from "../hooks";
import { CreateProductCard, ProductCreatedSuccess } from "./index";
import { ProductEditModal } from "../../../components/productEditModal";
import "../styles/AddProductPage.css";

/**
 * Add Product Page
 * Allows admins to create new products
 *
 * @returns {JSX.Element}
 */
const AddProductPage = () => {
  const {
    isModalOpen,
    isLoading,
    recentlyCreatedProduct,
    newProductTemplate,
    handleOpenModal,
    handleCloseModal,
    handleSaveProduct,
    handleViewProduct,
    handleCreateAnother,
  } = useAddProduct();

  return (
    <div className="add-product-container">
      <h1 className="add-product-title">Add New Product</h1>

      {!recentlyCreatedProduct ? (
        <CreateProductCard
          onCreateClick={handleOpenModal}
          isLoading={isLoading}
        />
      ) : (
        <ProductCreatedSuccess
          product={recentlyCreatedProduct}
          onCreateAnother={handleCreateAnother}
          onViewProduct={handleViewProduct}
        />
      )}

      <ProductEditModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        product={newProductTemplate}
        onSave={handleSaveProduct}
        title="Create New Product"
      />
    </div>
  );
};

export default AddProductPage;
