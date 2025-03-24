// Path: frontend/src/pages/shop/Shop.jsx
import Hero from "../../components/hero/Hero";
import Popular from "../../components/popular/Popular";
import Offers from "../../components/offers/Offers";
import NewCollection from "../../components/newCollections/NewCollections";
import Newsletter from "../../components/newsLetter/NewsLetter";

const Shop = () => {
  return (
    <div>
      <Hero />
      <Popular />
      <Offers />
      <NewCollection />
      <Newsletter />
    </div>
  );
};

export default Shop;
