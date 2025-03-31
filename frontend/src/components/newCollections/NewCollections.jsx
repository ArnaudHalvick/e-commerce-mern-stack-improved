// Path: frontend/src/components/newCollections/NewCollections.jsx
import React, { useState, useEffect } from "react";
import "./NewCollections.css";
import Item from "../item/Item";
import { config } from "../../api";

const NewCollection = () => {
  const [newCollection, setNewCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        const response = await fetch(
          config.getApiUrl("products?sort=newest&limit=8")
        );
        const data = await response.json();
        setNewCollection(data.products || []);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching new arrivals:", error);
        setError("Failed to load new arrivals");
        setLoading(false);
      }
    };

    fetchNewArrivals();
  }, []);

  if (loading) {
    return <div className="loading">Loading new collection...</div>;
  }

  if (error) {
    return <div className="error">Error loading new collection: {error}</div>;
  }

  return (
    <div className="new-collections">
      <h1>New Collection</h1>
      <hr />
      <div className="collections">
        {newCollection.map((item, index) => (
          <Item
            key={index}
            id={item.id}
            _id={item._id}
            slug={item.slug}
            name={item.name}
            images={item.images}
            mainImageIndex={item.mainImageIndex}
            new_price={item.new_price}
            old_price={item.old_price}
          />
        ))}
      </div>
    </div>
  );
};

export default NewCollection;
