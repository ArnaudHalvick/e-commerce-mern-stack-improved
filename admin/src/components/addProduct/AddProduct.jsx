// Path: admin/src/components/addProduct/AddProduct.jsx
import "./AddProduct.css";

const AddProduct = () => {
  return (
    <div className="admin-add-product">
      <h1 className="admin-page-title">Add Product</h1>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>Product Information</h2>
        </div>
        <div className="admin-card-body">
          <div className="admin-form-group">
            <label htmlFor="product-name" className="admin-form-label">
              Product Name
            </label>
            <input
              type="text"
              id="product-name"
              className="admin-form-input"
              placeholder="Enter product name"
            />
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="product-category" className="admin-form-label">
                Category
              </label>
              <select id="product-category" className="admin-form-input">
                <option value="">Select a category</option>
                <option value="women">Women</option>
                <option value="men">Men</option>
                <option value="kids">Kids</option>
              </select>
            </div>

            <div className="admin-form-group">
              <label htmlFor="product-status" className="admin-form-label">
                Status
              </label>
              <select id="product-status" className="admin-form-input">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="admin-form-row">
            <div className="admin-form-group">
              <label htmlFor="product-price" className="admin-form-label">
                Regular Price
              </label>
              <input
                type="number"
                id="product-price"
                className="admin-form-input"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>

            <div className="admin-form-group">
              <label htmlFor="product-sale-price" className="admin-form-label">
                Sale Price
              </label>
              <input
                type="number"
                id="product-sale-price"
                className="admin-form-input"
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="product-description" className="admin-form-label">
              Description
            </label>
            <textarea
              id="product-description"
              className="admin-form-input admin-form-textarea"
              placeholder="Enter product description"
              rows="4"
            ></textarea>
          </div>

          <div className="admin-form-group">
            <label className="admin-form-label">Product Images</label>
            <div className="admin-image-upload-area">
              <div className="admin-image-upload-placeholder">
                <span className="admin-image-upload-icon">➕</span>
                <p>
                  Drop your image here, or <span>browse</span>
                </p>
                <p className="admin-image-upload-hint">
                  Supports JPG, PNG, GIF up to 5MB
                </p>
              </div>
            </div>
          </div>

          <div className="admin-form-actions">
            <button className="admin-btn admin-btn-outline">Cancel</button>
            <button className="admin-btn admin-btn-primary">
              Save Product
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
