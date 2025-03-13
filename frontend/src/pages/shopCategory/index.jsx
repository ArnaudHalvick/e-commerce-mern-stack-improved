import React from "react";

// Components
import Item from "../../components/item/Item";
import CategoryHeader from "./components/CategoryHeader";
import FilterBar from "./components/FilterBar";
import EmptyState from "../../components/errorHandling/EmptyState";

// Hooks
import useCategoryProducts from "./hooks/useCategoryProducts";

// Styles
import "../CSS/ShopCategory.css";
import "../../components/errorHandling/LoadingIndicator.css";

/**
 * Shop category page component that displays products by category
 *
 * @param {Object} props - Component props
 * @param {String} props.category - Category name (men, women, kids)
 * @param {String} props.banner - Banner image URL for the category
 */
const ShopCategory = (props) => {
  const { products, loading, error } = useCategoryProducts(props.category);

  // Calculate the total count of products in this category
  const productCount = products.length;

  // For now we'll show a fixed range (1-12), but this could be expanded with pagination
  const displayRange = `1-${Math.min(12, productCount)}`;

  if (loading) {
    return (
      <div className="product-category-container">
        <CategoryHeader category={props.category} banner={props.banner} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="product-category-container">
        <CategoryHeader category={props.category} banner={props.banner} />
        <EmptyState
          title="Error Loading Products"
          message={`We encountered a problem loading products. ${error}`}
          icon="⚠️"
          actions={[
            {
              label: "Try Again",
              onClick: () => window.location.reload(),
              type: "primary",
            },
            {
              label: "Browse All Products",
              to: "/",
              type: "secondary",
            },
          ]}
        />
      </div>
    );
  }

  return (
    <div className="product-category-container">
      <CategoryHeader category={props.category} banner={props.banner} />

      <FilterBar displayRange={displayRange} productCount={productCount} />

      <div className="product-grid">
        {products.length > 0 ? (
          products.map((item, index) => (
            <Item
              key={item._id || item.id || index}
              id={item.id}
              _id={item._id}
              slug={item.slug}
              name={item.name}
              images={item.images}
              mainImageIndex={item.mainImageIndex}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          ))
        ) : (
          <EmptyState
            title="No Products Found"
            message={`We couldn't find any products in the ${props.category} category. Please check back later or explore other categories.`}
            icon="👕"
            actions={[
              {
                label: "Browse All Products",
                to: "/",
                type: "primary",
              },
              {
                label: "Check Offers",
                to: "/offers",
                type: "secondary",
              },
            ]}
          />
        )}
      </div>
      {products.length > 0 && (
        <div className="load-more-button">Explore more</div>
      )}
    </div>
  );
};

export default ShopCategory;
