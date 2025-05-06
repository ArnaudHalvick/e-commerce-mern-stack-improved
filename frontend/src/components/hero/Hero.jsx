// Path: frontend/src/components/hero/Hero.jsx
import "./Hero.css";
import arrow_icon from "../assets/arrow.png";
import hero_image from "../assets/hero_image.png";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="hero-container">
      <div className="hero-section-left">
        <h2 className="hero-heading">NEW ARRIVALS ONLY</h2>
        <div>
          <div className="hero-icon-container">
            <p className="hero-text">NEW</p>
          </div>
          <p className="hero-text">collection</p>
          <p className="hero-text">for everyone</p>
        </div>
        <Link to="/shop" className="hero-button-latest">
          <div>Latest Collection</div>
          <img src={arrow_icon} alt="Arrow" />
        </Link>
      </div>
      <div className="hero-section-right">
        <img src={hero_image} alt="Hero" className="hero-image" />
      </div>
    </div>
  );
};

export default Hero;
