// Path: frontend/src/components/relatedProducts/RelatedProducts.jsx
import React from "react"; // 6.9k (gzipped: 2.7k)
import "./RelatedProducts.css";
import data_product from "../assets/data";
import Item from "../item/Item";

const RelatedProducts = () => {
  return (
    <div className="related-products">
      <h1>Related Products</h1>
      <hr />
      <div className="related-products-item">
        {data_product.map((item, i) => {
          // Convert legacy data format to new format if needed
          const itemImages = item.images || (item.image ? [item.image] : []);

          return (
            <Item
              key={i}
              id={item.id}
              name={item.name}
              images={itemImages}
              mainImageIndex={item.mainImageIndex || 0}
              new_price={item.new_price}
              old_price={item.old_price}
            />
          );
        })}
      </div>
    </div>
  );
};

export default RelatedProducts;
