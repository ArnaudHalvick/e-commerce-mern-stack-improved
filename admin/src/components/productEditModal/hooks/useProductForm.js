import { useState, useEffect } from "react";

const useProductForm = (product) => {
  const [formData, setFormData] = useState({
    name: "",
    shortDescription: "",
    longDescription: "",
    category: "",
    new_price: 0,
    old_price: 0,
    available: true,
    sizes: [],
    tags: [],
    types: [],
    images: [],
    mainImageIndex: 0,
  });
  const [errors, setErrors] = useState({});
  const [hasDiscount, setHasDiscount] = useState(false);
  const [originalFormData, setOriginalFormData] = useState(null);
  const [isFormDirty, setIsFormDirty] = useState(false);

  // Initialize form with product data when product changes
  useEffect(() => {
    if (product) {
      const hasDiscountValue = product.new_price > 0;
      const productData = {
        ...product,
        sizes: product.sizes || [],
        tags: product.tags || [],
        types: product.types || [],
        images: product.images || [],
        mainImageIndex: product.mainImageIndex || 0,
      };

      setFormData(productData);
      setOriginalFormData(JSON.parse(JSON.stringify(productData)));
      setHasDiscount(hasDiscountValue);
      setIsFormDirty(false);
    }
  }, [product]);

  // Update form dirty state when form data changes
  useEffect(() => {
    if (originalFormData) {
      setIsFormDirty(
        JSON.stringify(formData) !== JSON.stringify(originalFormData)
      );
    }
  }, [formData, originalFormData]);

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

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
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

  const prepareFormDataForSubmission = () => {
    return {
      ...formData,
      _id: product?._id, // Ensure ID is preserved if it exists
      new_price: hasDiscount ? formData.new_price : 0,
    };
  };

  return {
    formData,
    errors,
    hasDiscount,
    isFormDirty,
    originalFormData,
    validateForm,
    handleChange,
    handleDiscountChange,
    handleArrayFieldChange,
    handleImageChange,
    handleMainImageChange,
    prepareFormDataForSubmission,
  };
};

export default useProductForm;
