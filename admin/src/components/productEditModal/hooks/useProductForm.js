import { useState, useEffect } from "react";

const DEFAULT_PRODUCT_TEMPLATE = {
  name: "",
  shortDescription: "",
  longDescription: "",
  category: "men",
  new_price: 0,
  old_price: 0,
  available: true,
  sizes: [],
  tags: [],
  types: [],
  images: [],
  mainImageIndex: 0,
};

const useProductForm = (product) => {
  const [formData, setFormData] = useState({ ...DEFAULT_PRODUCT_TEMPLATE });
  const [errors, setErrors] = useState({});
  const [hasDiscount, setHasDiscount] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [isFormDirty, setIsFormDirty] = useState(false);
  const [isNewProduct, setIsNewProduct] = useState(true);

  // Initialize form with product data when product changes
  useEffect(() => {
    // If product is null or undefined, we're creating a new product
    if (!product || Object.keys(product).length === 0) {
      console.log("Resetting form to default template");
      // Create fresh copies to ensure no references are kept
      const defaultTemplate = JSON.parse(
        JSON.stringify(DEFAULT_PRODUCT_TEMPLATE)
      );
      setFormData(defaultTemplate);
      setOriginalFormData(defaultTemplate);
      setHasDiscount(false);
      setIsFormDirty(false);
      setIsNewProduct(true);
      // Clear any previous errors
      setErrors({});
      return;
    }

    // Otherwise, we're editing an existing product
    const hasDiscountValue = product.new_price > 0;
    const productData = {
      ...product,
      _id: product._id, // Explicitly set _id to ensure it's preserved
      sizes: product.sizes || [],
      tags: product.tags || [],
      types: product.types || [],
      images: product.images || [],
      mainImageIndex: product.mainImageIndex || 0,
    };

    console.log("Setting form data from product:", productData.name);
    setFormData(productData);
    setOriginalFormData(JSON.parse(JSON.stringify(productData)));
    setHasDiscount(hasDiscountValue);
    setIsFormDirty(false);
    setIsNewProduct(false);
  }, [product]);

  // Update form dirty state when form data changes
  useEffect(() => {
    if (originalFormData) {
      setIsFormDirty(
        JSON.stringify(formData) !== JSON.stringify(originalFormData)
      );
    }
  }, [formData, originalFormData]);

  // Debug and fix any lost ID
  useEffect(() => {
    if (!isNewProduct && product?._id && !formData._id) {
      console.log("Detected ID missing from form data, restoring...");
      setFormData((prev) => ({
        ...prev,
        _id: product._id,
      }));
    }
  }, [formData._id, isNewProduct, product, product?._id]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = "Name is required";
    if (!formData.shortDescription)
      newErrors.shortDescription = "Short description is required";
    if (!formData.longDescription)
      newErrors.longDescription = "Long description is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (formData.old_price <= 0)
      newErrors.old_price = "Original price must be greater than 0";

    // Add specific validation for images
    if (!formData.images || formData.images.length === 0) {
      newErrors.images = "At least one product image is required";
    }

    // Add validation for discounted price
    if (hasDiscount) {
      if (formData.new_price <= 0) {
        newErrors.new_price = "Discounted price must be greater than 0";
      } else if (
        parseFloat(formData.new_price) >= parseFloat(formData.old_price)
      ) {
        newErrors.new_price =
          "Discounted price must be lower than original price";
      }
    }

    // Log validation results
    const hasErrors = Object.keys(newErrors).length > 0;
    if (hasErrors) {
      console.log("Form validation failed:", {
        errors: newErrors,
        formData: {
          name: formData.name,
          shortDescription: formData.shortDescription,
          longDescription: formData.longDescription,
          category: formData.category,
          old_price: formData.old_price,
          hasCategory: !!formData.category,
          imagesCount: formData.images?.length || 0,
        },
      });
    }

    setErrors(newErrors);
    return !hasErrors;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Convert price values to numbers
    let convertedValue = value;
    if (name === "old_price" || name === "new_price") {
      convertedValue = value === "" ? 0 : parseFloat(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : convertedValue,
    }));

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleDiscountChange = (e) => {
    const { checked } = e.target;
    setHasDiscount(checked);

    // Reset new_price to 0 when discount is disabled
    if (!checked) {
      setFormData((prev) => ({
        ...prev,
        new_price: 0,
      }));
    }
  };

  const handleArrayFieldChange = (fieldName, itemValue, isChecked) => {
    setFormData((prev) => ({
      ...prev,
      [fieldName]: isChecked
        ? [...prev[fieldName], itemValue]
        : prev[fieldName].filter((item) => item !== itemValue),
    }));
  };

  const handleImageChange = (newImages) => {
    setFormData((prev) => ({ ...prev, images: newImages }));
  };

  const handleMainImageChange = (newIndex) => {
    setFormData((prev) => ({
      ...prev,
      mainImageIndex: newIndex,
    }));
  };

  // Reset form function that can be called explicitly
  const resetForm = () => {
    console.log("Explicitly resetting form to default template");
    const defaultTemplate = JSON.parse(
      JSON.stringify(DEFAULT_PRODUCT_TEMPLATE)
    );
    setFormData(defaultTemplate);
    setOriginalFormData(defaultTemplate);
    setHasDiscount(false);
    setIsFormDirty(false);
    setIsNewProduct(true);
    setErrors({});
  };

  const prepareFormDataForSubmission = () => {
    // Create a deep copy of the form data for submission
    const preparedData = JSON.parse(JSON.stringify(formData));

    // Handle discount pricing
    preparedData.new_price = hasDiscount ? preparedData.new_price : 0;

    // Enhanced ID preservation logic - first try to use the product ID
    if (product && product._id) {
      // This ensures we're getting the ID directly from the original product
      preparedData._id = product._id;
      console.log("Preserving original product ID for update:", product._id);
    } else if (formData._id) {
      // Fallback to formData._id if somehow product._id is missing
      console.log("Using formData ID as fallback:", formData._id);
    } else if (isNewProduct) {
      // We're explicitly creating a new product, make sure there's no ID
      delete preparedData._id;
      console.log("Creating new product, removing _id if exists");
    } else {
      console.warn("Warning: Editing product but no ID found!");
    }

    // Ensure name is properly set
    if (!preparedData.name && product && product.name) {
      preparedData.name = product.name;
      console.log("Restored missing name from original product");
    }

    console.log("Final prepared data:", {
      id: preparedData._id || "none",
      isNewProduct,
      name: preparedData.name || "unnamed",
    });

    return preparedData;
  };

  return {
    formData,
    setFormData,
    errors,
    hasDiscount,
    isFormDirty,
    isNewProduct,
    originalFormData,
    validateForm,
    handleChange,
    handleDiscountChange,
    handleArrayFieldChange,
    handleImageChange,
    handleMainImageChange,
    prepareFormDataForSubmission,
    resetForm,
  };
};

export default useProductForm;
