// Path: frontend/src/components/newsLetter/NewsLetter.jsx
import "./NewsLetter.css";

const Newsletter = () => {
  return (
    <div className="newsletter-container">
      <h1>Get Exclusive Offers</h1>
      <p>Subscribe to our newsletter and stay informed</p>
      <div className="newsletter-input-container">
        <input type="email" placeholder="Enter Your Email" />
        <button className="newsletter-button">Subscribe Now</button>
      </div>
    </div>
  );
};

export default Newsletter;
