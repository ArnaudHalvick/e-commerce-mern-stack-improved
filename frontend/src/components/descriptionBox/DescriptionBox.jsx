// Path: frontend/src/components/descriptionBox/DescriptionBox.jsx
import "./DescriptionBox.css";

const DescriptionBox = ({ product }) => {
  // Get the review count
  const reviewCount = product && product.reviews ? product.reviews.length : 0;

  return (
    <div className="custom-description-box">
      <div className="custom-navigator">
        <div className="custom-nav-item">Description</div>
        <div className="custom-nav-item custom-fade">
          Reviews ({reviewCount})
        </div>
      </div>
      <div className="custom-description-content">
        {product && product.longDescription
          ? product.longDescription
          : "E-commerce websites have revolutionized the way we shop for clothing. With just a few clicks, customers can browse through a vast selection of apparel, from casual wear to formal attire. The convenience of online shopping allows users to compare prices, read reviews, and find the latest trends without leaving their homes."}
      </div>
    </div>
  );
};

export default DescriptionBox;
