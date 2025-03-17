import React from "react";
import star_icon from "../../assets/star_icon.png";
import star_dull_icon from "../../assets/star_dull_icon.png";

/**
 * Render stars for a product or review rating
 * @param {object} props - Component props
 * @param {number} props.rating - Rating value (1-5)
 * @param {string} props.className - Optional class name for star images
 * @returns {JSX.Element} - Star rating component
 */
const ReviewStars = ({ rating, className = "review-star" }) => {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars.push(
        <img key={i} src={star_icon} alt="star" className={className} />
      );
    } else {
      stars.push(
        <img key={i} src={star_dull_icon} alt="star" className={className} />
      );
    }
  }
  return <div className="review-rating">{stars}</div>;
};

export default ReviewStars;
