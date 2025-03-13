import Breadcrumb from "../../components/breadcrumbs/breadcrumb";

// Modified version of Breadcrumb for the offers page
const OffersBreadcrumb = () => {
  // Create a simplified object with just category and name for the breadcrumb component
  const offerPage = {
    category: "SHOP",
    name: "OFFERS",
  };

  return <Breadcrumb product={offerPage} />;
};

export default OffersBreadcrumb;
