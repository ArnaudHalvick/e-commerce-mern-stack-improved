/**
 * ProductEditModal Component Exports
 * Exports the main component and utility hooks for product management
 */

import ProductEditModal from "./components/ProductEditModal";

// Main component export
export { ProductEditModal };

// Hook exports
export { default as useProductManagement } from "./hooks/useProductManagement";
export { default as useProductForm } from "./hooks/useProductForm";
export { default as useFormValidation } from "./hooks/useFormValidation";
export { default as useImageUpload } from "./hooks/useImageUpload";
export { default as useModalManagement } from "./hooks/useModalManagement";

// Default export for convenience
export default ProductEditModal;
