// Path: frontend/src/components/footer/Footer.jsx
import "./Footer.css";
import footer_logo from "../assets/logo_big.png";
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
      <ul className="footer-navigation">
        <li>Company</li>
        <li>Products</li>
        <li>Offices</li>
        <li>About</li>
        <li>Contact</li>
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
        <p>Copyright 2025 @ ShopSite - All Rights Reserved</p>
      </div>
    </div>
  );
};

export default Footer;
