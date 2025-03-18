// Path: admin/src/components/addProduct/AddProduct.jsx
import "./AddProduct.css";
import axios from "axios";
import upload_area from "../../assets/admin_assets/upload_area.svg";
import { useState } from "react";
import { getApiUrl } from "../../utils/apiUtils";

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
      // Create form data for image upload
      const formData = new FormData();
      formData.append("product", image);

      // Use the new utility function for proper URL construction
      const uploadUrl = getApiUrl("upload");

      // Upload image first
      const uploadResponse = await axios.post(uploadUrl, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (uploadResponse.data.success) {
        // Create product with image URL - use the relative path returned from the backend
        const productData = {
          ...product,
          image: uploadResponse.data.image_url,
        };

        // Use the new utility function for proper URL construction
        const addUrl = getApiUrl("add-product");

        // Add product to database
        const addResponse = await axios.post(addUrl, productData, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (addResponse.data.success) {
          alert("Product Added Successfully!");
          // Reset form
          setProduct({
            name: "",
            image: "",
            category: "women",
            new_price: "",
            old_price: "",
          });
          setImage(null);
        }
      }
    } catch (error) {
      console.error("Error adding product:", error);
      alert(
        error.response?.data?.message ||
          "Error adding product. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="product-form">
      <h1>Add Product</h1>
      <div className="product-form__field">
        <input
          type="text"
          name="name"
          value={product.name}
          onChange={changeHandler}
          placeholder="Product name"
          required
        />
      </div>

      <div className="product-form__field">
        <select
          name="category"
          value={product.category}
          onChange={changeHandler}
          required
        >
          <option value="women">Women</option>
          <option value="men">Men</option>
          <option value="kids">Kids</option>
        </select>
      </div>

      <div className="product-form__price-fields">
        <div className="product-form__field">
          <input
            type="number"
            name="old_price"
            value={product.old_price}
            onChange={changeHandler}
            placeholder="Old Price"
            min="0"
            step="0.01"
            required
          />
        </div>

        <div className="product-form__field">
          <input
            type="number"
            name="new_price"
            value={product.new_price}
            onChange={changeHandler}
            placeholder="New Price"
            min="0"
            step="0.01"
            required
          />
        </div>
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
