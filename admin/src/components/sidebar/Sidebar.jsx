import "./Sidebar.css";
import { Link } from "react-router-dom";
import add_product_icon from "../../assets//admin_assets/Product_Cart.svg";
import list_product_icon from "../../assets//admin_assets/Product_list_icon.svg";

const Sidebar = () => {
  return (
    <div className="sidebar">
      <Link to="/add-product">
        <div className="sidebar-item">
          <img src={add_product_icon} alt="add-product" />
          <p>Add Product</p>
        </div>
      </Link>
      <Link to="/list-product">
        <div className="sidebar-item">
          <img src={list_product_icon} alt="list-product" />
          <p>Product List</p>
        </div>
      </Link>
    </div>
  );
};

export default Sidebar;
