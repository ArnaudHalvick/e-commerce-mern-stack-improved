import "./ProductDisplay.css";
import star_icon from "../assets/star_icon.png";
import star_dull_icon from "../assets/star_dull_icon.png";
import { useContext } from "react";
import { ShopContext } from "../../context/ShopContext";

const ProductDisplay = (props) => {
  const { product } = props;

  const { addToCart } = useContext(ShopContext);

  return (
    <div className="product-display">
      <div className="product-display-left">
        <div className="product-display-img-list">
          <img src={product.image} alt="" />
          <img src={product.image} alt="" />
          <img src={product.image} alt="" />
          <img src={product.image} alt="" />
        </div>
        <div className="product-display-img">
          <img
            src={product.image}
            alt=""
            className="product-display-main-img"
          />
        </div>
      </div>
      <div className="product-display-right">
        <h1>{product.name}</h1>
        <div className="product-display-right-stars">
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_icon} alt="" />
          <img src={star_dull_icon} alt="" />
          <p>(120)</p>
        </div>
        <div className="product-display-right-prices">
          <div className="product-display-right-price-old">
            ${product.old_price}
          </div>
          <div className="product-display-right-price-new">
            ${product.new_price}
          </div>
        </div>
        <div className="product-display-right-description">
          <p>
            This stylish and comfortable clothing item is perfect for any
            occasion. Made from high-quality materials, it offers both
            durability and a great fit. Available in various sizes and colors to
            suit your personal style.
          </p>
        </div>
        <div className="product-display-right-size">
          <h1>Select Size</h1>
          <div className="product-display-right-size-container">
            <div>S</div>
            <div>M</div>
            <div>L</div>
            <div>XL</div>
            <div>XXL</div>
          </div>
        </div>
        <button onClick={() => addToCart(product.id)}>Add to Cart</button>
        <p className="product-display-right-category">
          <span>Category :</span>Women, T-Shirt, Crop Top
        </p>
        <p className="product-display-right-category">
          <span>Tags :</span>Modern, Latest, Trending
        </p>
      </div>
    </div>
  );
};

export default ProductDisplay;
