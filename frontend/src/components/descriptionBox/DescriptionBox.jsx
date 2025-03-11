import "./DescriptionBox.css";

const DescriptionBox = () => {
  return (
    <div className="custom-description-box">
      <div className="custom-navigator">
        <div className="custom-nav-item">Description</div>
        <div className="custom-nav-item custom-fade">Reviews (120)</div>
      </div>
      <div className="custom-description-content">
        E-commerce websites have revolutionized the way we shop for clothing.
        With just a few clicks, customers can browse through a vast selection of
        apparel, from casual wear to formal attire. The convenience of online
        shopping allows users to compare prices, read reviews, and find the
        latest trends without leaving their homes. As technology advances, the
        integration of virtual fitting rooms and personalized recommendations
        enhances the shopping experience, making it easier than ever to find the
        perfect outfit.
      </div>
    </div>
  );
};

export default DescriptionBox;
