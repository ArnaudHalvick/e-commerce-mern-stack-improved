// Path: frontend/src/components/hero/Hero.jsx
import "./Hero.css";
import arrow_icon from "../assets/arrow.png";
import hero_image from "../assets/hero_image.png";
import { Link } from "react-router-dom";

const Hero = () => {
  return (
    <div className="hero-container">
      <div className="hero-section-left">
        <h2>NEW ARRIVALS ONLY</h2>
        <div>
          <div className="hero-icon-container">
            <p>NEW</p>
          </div>
          <p>collection</p>
          <p>for everyone</p>
        </div>
        <Link to="/offers" className="hero-button-latest">
          <div>Latest Collection</div>
          <img src={arrow_icon} alt="" />
        </Link>
      </div>
      <div className="hero-section-right">
        <img src={hero_image} alt="" />
      </div>
    </div>
  );
};

export default Hero;
