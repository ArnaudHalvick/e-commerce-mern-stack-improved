// Path: frontend/src/pages/shop/Shop.jsx
import Hero from "../../components/hero/Hero";
import Popular from "../../components/popular/Popular";
import Shop from "../../components/shop/Shop";
import NewCollection from "../../components/newCollections/NewCollections";
import Newsletter from "../../components/newsLetter/NewsLetter";

const ShopPage = () => {
  return (
    <div>
      <Hero />
      <Popular />
      <Shop />
      <NewCollection />
      <Newsletter />
    </div>
  );
};

export default ShopPage;
