// Path: admin/src/components/listProduct/ListProduct.jsx
import "./ListProduct.css";

const ListProduct = () => {
  // Placeholder data
  const products = [
    {
      id: 1,
      name: "Modern T-shirt",
      category: "Men",
      price: 29.99,
      status: "Active",
      stock: 45,
    },
    {
      id: 2,
      name: "Summer Dress",
      category: "Women",
      price: 49.99,
      status: "Active",
      stock: 32,
    },
    {
      id: 3,
      name: "Kids Sneakers",
      category: "Kids",
      price: 34.99,
      status: "Active",
      stock: 20,
    },
  ];

  return (
    <div className="admin-product-list">
      <div className="admin-page-header">
        <h1 className="admin-page-title">Product List</h1>
        <button className="admin-btn admin-btn-primary">
          <span>➕</span> Add New Product
        </button>
      </div>

      <div className="admin-card">
        <div className="admin-card-header">
          <h2>All Products</h2>
          <div className="admin-search-field">
            <input
              type="text"
              className="admin-form-input admin-search-input"
              placeholder="Search products..."
            />
          </div>
        </div>
        <div className="admin-card-body">
          <div className="admin-table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th>Stock</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <div className="admin-product-cell">
                        <div className="admin-product-image-placeholder"></div>
                        <span>{product.name}</span>
                      </div>
                    </td>
                    <td>{product.category}</td>
                    <td>${product.price.toFixed(2)}</td>
                    <td>
                      <span className="admin-status-badge">
                        {product.status}
                      </span>
                    </td>
                    <td>{product.stock} units</td>
                    <td>
                      <div className="admin-table-actions">
                        <button
                          className="admin-action-btn admin-action-btn-edit"
                          aria-label="Edit product"
                        >
                          ✏️
                        </button>
                        <button
                          className="admin-action-btn admin-action-btn-delete"
                          aria-label="Delete product"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="admin-pagination">
            <button className="admin-pagination-btn" disabled>
              Previous
            </button>
            <div className="admin-pagination-pages">
              <button className="admin-pagination-btn admin-pagination-btn-active">
                1
              </button>
              <button className="admin-pagination-btn">2</button>
              <button className="admin-pagination-btn">3</button>
            </div>
            <button className="admin-pagination-btn">Next</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListProduct;
