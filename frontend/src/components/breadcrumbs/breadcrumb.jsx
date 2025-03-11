// Path: frontend/src/components/breadcrumbs/breadcrumb.jsx
import "./breadcrumb.css";
import arrow_icon from "../assets/breadcrum_arrow.png";

// TODO: Fix undefined error on refresh

const Breadcrumb = (props) => {
  const { product } = props;

  return (
    <div className="breadcrumb">
      HOME <img src={arrow_icon} alt="" /> SHOP <img src={arrow_icon} alt="" />
      {product && product.category && (
        <>
          {product.category} <img src={arrow_icon} alt="" /> {product.name}
        </>
      )}
    </div>
  );
};

export default Breadcrumb;
