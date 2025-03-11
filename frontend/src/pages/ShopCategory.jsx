import { useContext } from "react";
import { ShopContext } from "../context/ShopContext";
import dropdown_icon from "../components/assets/dropdown_icon.png";
import Item from "../components/item/Item";
import "./CSS/ShopCategory.css";

const ShopCategory = (props) => {
  const context = useContext(ShopContext);
  const { all_product } = context || {};

  return (
    <div className="product-category-container">
      <img className="category-banner" src={props.banner} alt="" />
      <div className="product-filter-bar">
        <p>
          <span>Showing 1-12 </span>of 36 products
        </p>
        <div className="sort-dropdown">
          Sort by <img src={dropdown_icon} alt="" />
        </div>
      </div>
      <div className="product-grid">
        {all_product && all_product.length > 0 ? (
          all_product.map((item, index) => {
            if (item.category === props.category) {
              return (
                <Item
                  key={index}
                  id={item.id}
                  name={item.name}
                  image={item.image}
                  new_price={item.new_price}
                  old_price={item.old_price}
                />
              );
            } else {
              return null;
            }
          })
        ) : (
          <p>No products available.</p>
        )}
      </div>
      <div className="load-more-button">Explore more</div>
    </div>
  );
};

export default ShopCategory;
