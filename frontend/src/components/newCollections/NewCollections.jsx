// Path: frontend/src/components/newCollections/NewCollections.jsx
import React, { useState, useEffect } from "react";
import "./NewCollections.css";
import Item from "../item/Item";
import { productsService } from "../../api";
import axios from "axios";

const NewCollection = () => {
  const [newCollection, setNewCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNewArrivals = async () => {
      try {
        // Use the productsService to get new collection products
        const response = await productsService.getNewCollectionProducts();

        // Handle API response which is a direct array, not an object with a data property
        if (Array.isArray(response)) {
          setNewCollection(response);
        } else {
          console.error("Invalid response format:", response);
          setError("Invalid data format from server");
        }

        setLoading(false);
      } catch (error) {
        // Don't show errors for canceled requests
        if (axios.isCancel(error)) {
          console.log("Request canceled:", error.message);
        } else {
          console.error("Error fetching new arrivals:", error);
          setError("Failed to load new arrivals");
          setLoading(false);
        }
      }
    };

    fetchNewArrivals();

    // Clean up function
    return () => {
      // Component unmount - no need to do anything special
      // Requests will be canceled if needed by the API client
    };
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
            key={item._id || index}
            id={item.id}
            _id={item._id}
            slug={item.slug}
            name={item.name}
            images={item.images}
            mainImage={item.mainImage}
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
