// Path: frontend/src/components/offers/Offers.jsx

import React from "react";
import "./Offers.css";
import exclusive_image from "../assets/exclusive_image.png";
import { Link } from "react-router-dom";

const Offers = () => {
  return (
    <div className="offers">
      <div className="offers-left">
        <h1 className="offers-title">Exclusive Deals</h1>
        <h1 className="offers-title">Just for You</h1>
        <p className="offers-subtitle">ONLY TOP SELLING PRODUCTS</p>
        <Link to="/offers?discount=true">
          <button className="offers-cta-button">Discover Now</button>
        </Link>
      </div>
      <div className="offers-right">
        <img
          src={exclusive_image}
          alt="Exclusive offer"
          className="offers-image"
        />
      </div>
    </div>
  );
};

export default Offers;
