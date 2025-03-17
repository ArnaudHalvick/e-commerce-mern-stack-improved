import Breadcrumb from "../../../components/breadcrumbs/Breadcrumb";

// Component for the offers page breadcrumb
const OffersBreadcrumb = () => {
  return (
    <Breadcrumb routes={[{ label: "Home", path: "/" }, { label: "Shop" }]} />
  );
};

export default OffersBreadcrumb;
