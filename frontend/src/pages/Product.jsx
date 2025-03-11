// Path: frontend/src/pages/Product.jsx
import { useParams } from "react-router-dom";
import { ShopContext } from "../context/ShopContext";
import { useContext, useEffect, useState } from "react";

import Breadcrumb from "../components/breadcrumbs/breadcrumb";
import ProductDisplay from "../components/productDisplay/ProductDisplay";
import DescriptionBox from "../components/descriptionBox/DescriptionBox";
import RelatedProducts from "../components/relatedProducts/RelatedProducts";

const Product = () => {
  const { all_product } = useContext(ShopContext);
  const { productId } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Find the product when all_product changes or productId changes
    if (all_product && all_product.length > 0) {
      const foundProduct = all_product.find((e) => e.id === Number(productId));
      setProduct(foundProduct);
      setLoading(false);
    }
  }, [all_product, productId]);

  if (loading) {
    return <div className="loading">Loading product details...</div>;
  }

  return (
    <div>
      <Breadcrumb product={product} />
      <ProductDisplay product={product} />
      <DescriptionBox />
      <RelatedProducts />
    </div>
  );
};

export default Product;
