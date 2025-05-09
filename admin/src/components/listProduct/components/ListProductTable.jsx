import React from "react";
import Table from "../../ui/table/Table";
import Button from "../../ui/button/Button";
import Badge from "../../ui/badge/Badge";
import Spinner from "../../ui/spinner/Spinner";
import { getImageUrl } from "../../../utils/apiUtils";
import "../styles/ListProductTable.css";

const ListProductTable = ({
  products,
  loading,
  onEdit,
  onDelete,
  onToggleAvailability,
}) => {
  if (loading) {
    return (
      <div className="list-product-table-loading">
        <Spinner size="large" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="list-product-table-empty">
        <p>No products found.</p>
      </div>
    );
  }

  // Format currency
  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="list-product-table-container">
      <Table striped hoverable>
        <Table.Head>
          <Table.Row isHeader>
            <Table.Cell isHeader>Image</Table.Cell>
            <Table.Cell isHeader>Name</Table.Cell>
            <Table.Cell isHeader>Category</Table.Cell>
            <Table.Cell isHeader>Price</Table.Cell>
            <Table.Cell isHeader>Status</Table.Cell>
            <Table.Cell isHeader>Updated</Table.Cell>
            <Table.Cell isHeader>Actions</Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {products.map((product) => (
            <Table.Row key={product._id}>
              <Table.Cell>
                <div className="list-product-image-container">
                  <img
                    src={
                      product.images && product.images.length > 0
                        ? getImageUrl(product.images[0])
                        : getImageUrl("/placeholder.jpg")
                    }
                    alt={product.name}
                    className="list-product-thumbnail"
                  />
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="list-product-name-cell">
                  <span className="list-product-name">{product.name}</span>
                  <span className="list-product-id">ID: {product._id}</span>
                </div>
              </Table.Cell>
              <Table.Cell>{product.category}</Table.Cell>
              <Table.Cell>
                <div className="list-product-price-cell">
                  {product.new_price && product.new_price > 0 ? (
                    <>
                      <span className="list-product-new-price">
                        {formatPrice(product.new_price)}
                      </span>
                      {product.old_price > product.new_price && (
                        <span className="list-product-old-price">
                          {formatPrice(product.old_price)}
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="list-product-current-price">
                      {formatPrice(product.old_price)}
                    </span>
                  )}
                </div>
              </Table.Cell>
              <Table.Cell>
                <Badge
                  variant={product.available ? "success" : "danger"}
                  onClick={() =>
                    onToggleAvailability(product._id, product.available)
                  }
                  className="list-product-status-badge"
                >
                  {product.available ? "Active" : "Inactive"}
                </Badge>
              </Table.Cell>
              <Table.Cell>{formatDate(product.date)}</Table.Cell>
              <Table.Cell>
                <div className="list-product-actions">
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => onEdit(product)}
                    aria-label="Edit product"
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="danger"
                    onClick={() => onDelete(product._id)}
                    aria-label="Delete product"
                  >
                    Delete
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};

export default ListProductTable;
