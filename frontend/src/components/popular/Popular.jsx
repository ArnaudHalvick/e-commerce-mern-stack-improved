// Path: frontend/src/components/popular/Popular.jsx
import "./Popular.css";
import Item from "../item/Item";
import { useState, useEffect } from "react";

const Popular = () => {
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    fetch("http://localhost:4000/api/featured-women")
      .then((res) => res.json())
      .then((data) => setPopular(data));
  }, []);

  return (
    <div className="popular-container">
      <h1>Popular For Women</h1>
      <hr />
      <div className="popular-items">
        {popular &&
          popular.length > 0 &&
          popular.map((item) => (
            <Item
              key={item.id}
              id={item.id}
              images={item.images}
              mainImageIndex={item.mainImageIndex}
              name={item.name}
              new_price={`$${item.new_price}`}
              old_price={`$${item.old_price}`}
            />
          ))}
      </div>
    </div>
  );
};

export default Popular;
