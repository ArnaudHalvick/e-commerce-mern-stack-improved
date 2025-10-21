// Path: frontend/src/components/footer/Footer.jsx
import "./Footer.css";
import footer_logo from "../assets/logo_big.png";
import { Link } from "react-router-dom";
import instagram_icon from "../assets/instagram_icon.png";
import pinterest_icon from "../assets/pinterest_icon.png";
import whatsapp_icon from "../assets/whatsapp_icon.png";

const Footer = () => {
  return (
    <div className="footer-container">
      <div className="footer-brand">
        <img src={footer_logo} alt="" />
        <p>SHOPPER</p>
      </div>
      <ul className="footer-navigation" aria-label="Footer navigation">
        <li>
          <Link to="/shop" aria-label="Shop all products">
            Products
          </Link>
        </li>
        <li>
          <Link to="/men" aria-label="Men collection">
            Men
          </Link>
        </li>
        <li>
          <Link to="/women" aria-label="Women collection">
            Women
          </Link>
        </li>
        <li>
          <Link to="/kids" aria-label="Kids collection">
            Kids
          </Link>
        </li>
        <li>
          <Link to="/shop?discount=true" aria-label="Special offers">
            Offers
          </Link>
        </li>
      </ul>
      <div className="footer-social-links">
        <div className="footer-icon-wrapper">
          <img src={instagram_icon} alt="" />{" "}
        </div>
        <div className="footer-icon-wrapper">
          <img src={pinterest_icon} alt="" />
        </div>
        <div className="footer-icon-wrapper">
          <img src={whatsapp_icon} alt="" />
        </div>
      </div>
      <div className="footer-legal">
        <hr />
        <p>Copyright 2025 @ Shopper - All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Footer;
