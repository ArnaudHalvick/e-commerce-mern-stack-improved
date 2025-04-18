import React from "react";
import "./Shop.css";
import exclusive_image from "../assets/exclusive_image.png";
import { Link } from "react-router-dom";

const Shop = () => {
  return (
    <div className="shop-container">
      <div className="shop-left">
        <h1 className="shop-title">Exclusive Deals</h1>
        <h1 className="shop-title">Just for You</h1>
        <p className="shop-subtitle">ONLY TOP SELLING PRODUCTS</p>
        <Link to="/shop?discount=true">
          <button className="shop-cta-button">Discover Now</button>
        </Link>
      </div>
      <div className="shop-right">
        <img
          src={exclusive_image}
          alt="Exclusive offer"
          className="shop-image"
        />
      </div>
    </div>
  );
};

export default Shop;
