// Path: frontend/src/components/breadcrumbs/breadcrumb.jsx
import "./breadcrumb.css";
import arrow_icon from "../assets/breadcrum_arrow.png";
import { Link } from "react-router-dom";

// TODO: Fix undefined error on refresh

const Breadcrumb = (props) => {
  const { product } = props;

  return (
    <div className="breadcrumb">
      <Link to="/" className="breadcrumb-link">
        HOME
      </Link>
      <img src={arrow_icon} alt="" />
      <Link to="/" className="breadcrumb-link">
        SHOP
      </Link>
      <img src={arrow_icon} alt="" />
      {product && product.category && (
        <>
          <Link
            to={`/${product.category.toLowerCase()}`}
            className="breadcrumb-link"
          >
            {product.category}
          </Link>
          <img src={arrow_icon} alt="" />
          <span className="breadcrumb-current">{product.name}</span>
        </>
      )}
    </div>
  );
};

export default Breadcrumb;
