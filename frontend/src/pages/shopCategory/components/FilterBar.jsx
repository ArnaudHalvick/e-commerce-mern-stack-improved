import React from "react";
import dropdown_icon from "../../../components/assets/dropdown_icon.png";

/**
 * Component for filter bar with product count and sorting
 *
 * @param {Object} props - Component props
 * @param {String} props.displayRange - Range of products being displayed (e.g. "1-12")
 * @param {Number} props.productCount - Total number of products
 */
const FilterBar = ({ displayRange, productCount }) => (
  <div className="product-filter-bar">
    <p>
      <span>Showing {displayRange} </span>of {productCount} products
    </p>
    <div className="sort-dropdown">
      Sort by <img src={dropdown_icon} alt="Dropdown icon" />
    </div>
  </div>
);

export default FilterBar;
