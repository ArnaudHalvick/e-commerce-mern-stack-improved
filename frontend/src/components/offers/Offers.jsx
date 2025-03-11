// Path: frontend/src/components/offers/Offers.jsx

import React from "react";
import "./Offers.css";
import exclusive_image from "../assets/exclusive_image.png";

const Offers = () => {
  return (
    <div className="offers">
      <div className="offers-left">
        <h1>Exclusive Deals</h1>
        <h1>Just for You</h1>
        <p>ONLY TOP SELLING PRODUCTS</p>
        <button>Discover Now</button>
      </div>
      <div className="offers-right">
        <img src={exclusive_image} alt="" />
      </div>
    </div>
  );
};

export default Offers;
