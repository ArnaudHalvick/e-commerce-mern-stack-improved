// Path: admin/src/pages/admin/Admin.jsx
import { Routes, Route, Link } from "react-router-dom";
import AddProduct from "../../pages/addProduct/";
import ListProduct from "../listProduct";
import "./Admin.css";

const Dashboard = () => {
  return (
    <div className="admin-placeholder">
      <h1 className="admin-page-title">Admin Dashboard</h1>
      <div className="admin-placeholder-message">
        This is a placeholder. Currently, only the following features are
        implemented:
      </div>
      <div className="admin-placeholder-links">
        <Link to="/admin/add-product" className="admin-placeholder-button">
          Add Product
        </Link>
        <Link to="/admin/list-product" className="admin-placeholder-button">
          List Products
        </Link>
      </div>
    </div>
  );
};

const Admin = () => {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/add-product" element={<AddProduct />} />
      <Route path="/list-product" element={<ListProduct />} />
      <Route path="*" element={<Dashboard />} />
    </Routes>
  );
};

export default Admin;
