// Path: frontend/src/components/offers/Offers.jsx

import React from "react";
import "./Offers.css";
import exclusive_image from "../assets/exclusive_image.png";
import { Link } from "react-router-dom";

const Offers = () => {
  return (
    <div className="offers">
      <div className="offers-left">
        <h1>Exclusive Deals</h1>
        <h1>Just for You</h1>
        <p>ONLY TOP SELLING PRODUCTS</p>
        <Link to="/offers?discount=true">
          <button>Discover Now</button>
        </Link>
      </div>
      <div className="offers-right">
        <img src={exclusive_image} alt="" />
      </div>
    </div>
  );
};

export default Offers;
