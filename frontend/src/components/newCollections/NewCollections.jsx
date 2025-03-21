// Path: frontend/src/components/newCollections/NewCollections.jsx
import "./NewCollections.css";
import Item from "../item/Item";
import { useState, useEffect } from "react";
import { getApiUrl } from "../../utils/apiUtils";

const NewCollection = () => {
  const [newCollection, setNewCollection] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch(getApiUrl("products/newcollection"))
      .then((res) => {
        if (!res.ok) {
          throw new Error(
            `Failed to fetch new collection: ${res.status} ${res.statusText}`
          );
        }
        return res.json();
      })
      .then((data) => {
        // Validate and log data for debugging
        if (!Array.isArray(data)) {
          console.warn("API didn't return an array for new collection", data);
          setNewCollection([]);
        } else {
          setNewCollection(data);
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching new collection:", err);
        setError(err.message);
        setLoading(false);
      });
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
