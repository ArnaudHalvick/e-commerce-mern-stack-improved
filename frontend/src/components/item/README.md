# Item Component

A reusable product item component used to display products in grids, lists, and collections throughout the e-commerce application.

## Features

- Displays product images with appropriate fallbacks
- Shows product name and prices
- Handles price display logic for regular and discounted prices
- Links directly to the product detail page
- Responsive design

## Usage

```jsx
import Item from "../components/item/Item";

// In a product listing component
const ProductGrid = ({ products }) => {
  return (
    <div className="products-container">
      {products.map((product) => (
        <Item
          key={product._id}
          _id={product._id}
          name={product.name}
          slug={product.slug}
          old_price={product.price}
          new_price={product.discountedPrice}
          mainImage={product.mainImage}
          images={product.images}
        />
      ))}
    </div>
  );
};
```

## Props

| Prop             | Type   | Description                                         |
| ---------------- | ------ | --------------------------------------------------- |
| `name`           | string | Product name                                        |
| `slug`           | string | URL-friendly product identifier (preferred for SEO) |
| `_id` or `id`    | string | Product ID (fallback if slug not available)         |
| `old_price`      | number | Original price of the product                       |
| `new_price`      | number | Discounted price (if applicable)                    |
| `mainImage`      | string | Primary product image path                          |
| `images`         | array  | Array of product image paths                        |
| `mainImageIndex` | number | Index of the main image in the images array         |
| `image`          | string | Legacy image path (fallback)                        |

## Styling

The component uses `Item.css` for styling and follows the application's design system. The CSS classes include:

- `product-item`: Container for the entire product item
- `product-item-image`: Product image styling
- `product-item-name`: Product name styling
- `product-item-prices`: Container for price elements
- `product-item-price-current`: Regular price styling
- `product-item-price-discounted`: Discounted price styling
- `product-item-price-previous`: Original price styling when discounted
