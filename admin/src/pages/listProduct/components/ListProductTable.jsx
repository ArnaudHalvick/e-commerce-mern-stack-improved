import React from "react";
import Table from "../../../components/ui/table/Table";
import Button from "../../../components/ui/button/Button";
import Badge from "../../../components/ui/badge/Badge";
import Spinner from "../../../components/ui/spinner/Spinner";
import { getImageUrl } from "../../../utils/apiUtils";
import "../styles/ListProductTable.css";

const ListProductTable = ({
  products,
  loading,
  onEdit,
  onDelete,
  onToggleAvailability,
  onHeaderClick,
  sortOption,
  sortDirection,
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
        <p className="list-product-table-empty-text">No products found.</p>
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

  // Render sort indicator
  const renderSortIndicator = (column) => {
    if (sortOption !== column) return null;
    return (
      <span className="list-product-sort-indicator">
        {sortDirection === "asc" ? " ↑" : " ↓"}
      </span>
    );
  };

  // Sortable header cell
  const SortableHeaderCell = ({ column, label, onClick }) => {
    return (
      <Table.Cell
        isHeader
        onClick={() => onClick(column)}
        className={`list-product-header-cell ${
          sortOption === column ? "sorted" : ""
        }`}
        tabIndex="0"
        onKeyDown={(e) => e.key === "Enter" && onClick(column)}
        aria-label={`Sort by ${label}`}
        aria-sort={
          sortOption === column
            ? sortDirection === "asc"
              ? "ascending"
              : "descending"
            : undefined
        }
      >
        {label} {renderSortIndicator(column)}
      </Table.Cell>
    );
  };

  // Responsive column rendering - hide less important columns on mobile
  const renderMobileResponsiveTable = () => {
    return (
      <Table striped hoverable className="list-product-table">
        <Table.Head>
          <Table.Row isHeader>
            <SortableHeaderCell
              column="name"
              label="Product"
              onClick={onHeaderClick}
            />
            <SortableHeaderCell
              column="price"
              label="Price"
              onClick={onHeaderClick}
            />
            <SortableHeaderCell
              column="status"
              label="Status"
              onClick={onHeaderClick}
            />
            <Table.Cell isHeader>Actions</Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {products.map((product) => (
            <Table.Row key={product._id}>
              <Table.Cell>
                <div className="list-product-mobile-product-cell">
                  <div className="list-product-image-container">
                    <img
                      src={
                        product.images && product.images.length > 0
                          ? getImageUrl(
                              product.images[product.mainImageIndex || 0]
                            )
                          : getImageUrl("/placeholder.jpg")
                      }
                      alt={product.name}
                      className="list-product-thumbnail"
                    />
                  </div>
                  <div className="list-product-name-cell">
                    <span className="list-product-name">{product.name}</span>
                    <span className="list-product-category">
                      {product.category}
                    </span>
                  </div>
                </div>
              </Table.Cell>
              <Table.Cell>
                <div className="list-product-price-cell">
                  {product.new_price && product.new_price > 0 ? (
                    <>
                      <span className="list-product-new-price">
                        {formatPrice(product.new_price)}
                      </span>
                      <span className="list-product-old-price">
                        {formatPrice(product.old_price)}
                      </span>
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
              <Table.Cell>
                <div className="list-product-actions">
                  <Button
                    size="small"
                    variant="outline"
                    onClick={() => onEdit(product)}
                    aria-label="Edit product"
                    className="list-product-action-button"
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="danger"
                    onClick={() => onDelete(product._id)}
                    aria-label="Delete product"
                    className="list-product-action-button"
                  >
                    Delete
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  };

  // Desktop view with all columns
  const renderDesktopTable = () => {
    return (
      <Table striped hoverable className="list-product-table">
        <Table.Head>
          <Table.Row isHeader>
            <Table.Cell isHeader>Image</Table.Cell>
            <SortableHeaderCell
              column="name"
              label="Name"
              onClick={onHeaderClick}
            />
            <SortableHeaderCell
              column="category"
              label="Category"
              onClick={onHeaderClick}
            />
            <SortableHeaderCell
              column="price"
              label="Price"
              onClick={onHeaderClick}
            />
            <SortableHeaderCell
              column="status"
              label="Status"
              onClick={onHeaderClick}
            />
            <SortableHeaderCell
              column="date"
              label="Date Added"
              onClick={onHeaderClick}
            />
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
                        ? getImageUrl(
                            product.images[product.mainImageIndex || 0]
                          )
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
                      <span className="list-product-old-price">
                        {formatPrice(product.old_price)}
                      </span>
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
                    className="list-product-action-button"
                  >
                    Edit
                  </Button>
                  <Button
                    size="small"
                    variant="danger"
                    onClick={() => onDelete(product._id)}
                    aria-label="Delete product"
                    className="list-product-action-button"
                  >
                    Delete
                  </Button>
                </div>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    );
  };

  return (
    <div className="list-product-table-container">
      {/* Use CSS media queries to show/hide appropriate tables */}
      <div className="desktop-table-view">{renderDesktopTable()}</div>
      <div className="mobile-table-view">{renderMobileResponsiveTable()}</div>
    </div>
  );
};

export default ListProductTable;
