// Path: admin/src/components/addProduct/AddProduct.jsx
import "./AddProduct.css";
import upload_area from "../../assets/admin_assets/upload_area.svg";
import { useState } from "react";
import { productApi } from "../../services/api";

const AddProduct = () => {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState({
    name: "",
    image: "",
    category: "women",
    new_price: "",
    old_price: "",
  });

  const changeHandler = (e) => {
    setProduct({ ...product, [e.target.name]: e.target.value });
  };

  const imageHandler = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image/")) {
      setImage(file);
    } else {
      alert("Please upload an image file");
    }
  };

  const validateForm = () => {
    if (!product.name.trim()) {
      alert("Please enter a product name");
      return false;
    }
    if (!product.new_price || product.new_price <= 0) {
      alert("Please enter a valid new price");
      return false;
    }
    if (!product.old_price || product.old_price <= 0) {
      alert("Please enter a valid old price");
      return false;
    }
    if (!image) {
      alert("Please upload a product image");
      return false;
    }
    return true;
  };

  const addProduct = async () => {
    if (!validateForm()) return;

    try {
      setLoading(true);

      // Upload image using our API service
      const uploadResponse = await productApi.uploadImage(image);

      if (uploadResponse.success) {
        // Create product with image URL
        const productData = {
          ...product,
          image: uploadResponse.image_url,
        };

        // Add product to database using our API service
        const addResponse = await productApi.addProduct(productData);

        if (addResponse.success) {
          alert("Product Added Successfully");

          // Reset form
          setProduct({
            name: "",
            image: "",
            category: "women",
            new_price: "",
            old_price: "",
          });
          setImage(null);
        } else {
          alert(
            `Failed to add product: ${addResponse.message || "Unknown error"}`
          );
        }
      } else {
        alert(
          `Failed to upload image: ${uploadResponse.message || "Unknown error"}`
        );
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert(`Error adding product: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form">
      <div className="product-form__field">
        <p>Product Name</p>
        <input
          type="text"
          name="name"
          placeholder="Enter Product Name"
          value={product.name}
          onChange={changeHandler}
          required
        />
      </div>
      <div className="product-form__price-container">
        <div className="product-form__field">
          <p>Original Price</p>
          <input
            type="number"
            name="old_price"
            placeholder="Enter Original Price"
            value={product.old_price}
            onChange={changeHandler}
            min="0"
            step="0.01"
            required
          />
        </div>
        <div className="product-form__field">
          <p>Offer Price</p>
          <input
            type="number"
            name="new_price"
            placeholder="Enter Offer Price"
            value={product.new_price}
            onChange={changeHandler}
            min="0"
            step="0.01"
            required
          />
        </div>
      </div>
      <div className="product-form__field">
        <p>Product Category</p>
        <select
          name="category"
          className="product-form__category-select"
          value={product.category}
          onChange={changeHandler}
          required
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kids">Kids</option>
        </select>
      </div>
      <div className="product-form__field">
        <label htmlFor="file-input" className="product-form__upload-label">
          <img
            src={image ? URL.createObjectURL(image) : upload_area}
            alt={image ? "Product preview" : "Upload area"}
            className="product-form__upload-image"
          />
          <p>{image ? "Click to change image" : "Click to upload image"}</p>
        </label>
        <input
          type="file"
          id="file-input"
          name="image"
          hidden
          accept="image/*"
          onChange={imageHandler}
          required
        />
      </div>
      <button
        onClick={addProduct}
        className="product-form__submit-button"
        disabled={loading}
      >
        {loading ? "Adding Product..." : "Add Product"}
      </button>
    </div>
  );
};

export default AddProduct;
