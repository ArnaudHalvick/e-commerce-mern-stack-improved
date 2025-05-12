import React from "react";
import Button from "../../../components/ui/button/Button";
import Card from "../../../components/ui/card/Card";
import Spinner from "../../../components/ui/spinner/Spinner";
import "../styles/CreateProductCard.css";

/**
 * Component for displaying the initial "Create Product" card
 *
 * @param {Object} props
 * @param {Function} props.onCreateClick - Handler for Create button click
 * @param {boolean} props.isLoading - Loading state
 * @returns {JSX.Element}
 */
const CreateProductCard = ({ onCreateClick, isLoading }) => {
  return (
    <Card className="add-product-card">
      <div className="add-product-content">
        <div className="add-product-intro">
          <h2 className="add-product-subtitle">Create a new product</h2>
          <p className="add-product-description">
            Fill in the product details including name, description, pricing,
            images, and more. All fields marked with * are required.
          </p>
        </div>

        <div className="add-product-actions">
          <Button
            variant="primary"
            size="large"
            onClick={onCreateClick}
            disabled={isLoading}
            aria-label="Create new product"
          >
            {isLoading ? <Spinner size="small" /> : "Create New Product"}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CreateProductCard;
