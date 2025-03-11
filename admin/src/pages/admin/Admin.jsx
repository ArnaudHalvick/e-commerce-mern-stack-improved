import "./Admin.css";
import Sidebar from "../../components/sidebar/Sidebar";
import { Routes, Route } from "react-router-dom";
import AddProduct from "../../components/addProduct/AddProduct";
import ListProduct from "../../components/listProduct/ListProduct";

const Admin = () => {
  return (
    <div className="admin">
      <Sidebar />
      <Routes>
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/list-product" element={<ListProduct />} />
      </Routes>
    </div>
  );
};

export default Admin;
