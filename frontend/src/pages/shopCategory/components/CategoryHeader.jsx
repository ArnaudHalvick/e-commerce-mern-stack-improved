import React from "react";
import Breadcrumb from "../../../components/breadcrumbs/Breadcrumb";

/**
 * Component for category header with banner and breadcrumbs
 *
 * @param {Object} props - Component props
 * @param {String} props.category - Category name
 * @param {String} props.banner - Banner image URL
 */
const CategoryHeader = ({ category, banner }) => (
  <>
    <Breadcrumb routes={[{ label: "Home", path: "/" }, { label: category }]} />
    <img
      className="category-banner"
      src={banner}
      alt={`${category} category banner`}
    />
  </>
);

export default CategoryHeader;
