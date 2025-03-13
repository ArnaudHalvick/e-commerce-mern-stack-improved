import Breadcrumb from "../../components/breadcrumbs/Breadcrumb";

// Component for the offers page breadcrumb
const OffersBreadcrumb = () => {
  return (
    <Breadcrumb
      routes={[
        { label: "HOME", path: "/" },
        { label: "SHOP", path: "/" },
        { label: "OFFERS" },
      ]}
    />
  );
};

export default OffersBreadcrumb;
