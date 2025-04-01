# Models Directory

This directory contains the database models for the E-commerce MERN Stack application. Each model is implemented using Mongoose schemas to define the structure of documents within MongoDB collections.

## Overview

The application uses the following models:

| Model   | Description                                                      |
| ------- | ---------------------------------------------------------------- |
| User    | Handles user authentication, profile, and account management     |
| Product | Manages product catalog with details, pricing, and categories    |
| Order   | Tracks customer orders, payment information, and order status    |
| Review  | Stores product reviews with ratings and verified purchase status |
| Cart    | Maintains user shopping carts with selected items and quantities |

## Models in Detail

### User.js

The User model manages user accounts with authentication and profile information.

**Key features:**

- Secure password hashing with bcrypt
- JWT token generation for authentication
- Email verification system
- Password reset functionality
- Account security features (lockout after failed attempts)
- Profile information storage (name, email, address)

**Relationships:**

- Referenced by Order (one-to-many)
- Referenced by Review (one-to-many)
- Referenced by Cart (one-to-one)

### Product.js

The Product model defines the structure for product listings in the store.

**Key features:**

- Automatic slug generation for SEO-friendly URLs
- Support for multiple product images
- Pricing information with sale price support
- Product categorization (men, women, kids)
- Size availability tracking
- Tags and product type classification

**Relationships:**

- Referenced by OrderItem (one-to-many)
- Referenced by CartItem (one-to-many)
- Contains Reviews (one-to-many)

### Order.js

The Order model tracks customer purchases with shipping and payment details.

**Key features:**

- Complete order item tracking with product references
- Comprehensive shipping information
- Payment processing details and status
- Order status management (Processing, Shipped, Delivered, Cancelled)
- Price calculation including taxes and shipping

**Relationships:**

- Belongs to User (many-to-one)
- References Products through order items

### Review.js

The Review model handles product reviews and ratings from customers.

**Key features:**

- Star rating system (1-5)
- Review content with length validation
- Verified purchase indication
- Automatic product rating recalculation
- Timestamp tracking

**Relationships:**

- Belongs to User (many-to-one)
- Belongs to Product (many-to-one)
- Automatically updates Product rating

### Cart.js

The Cart model manages the user's shopping cart during their shopping session.

**Key features:**

- Shopping cart items with product reference, size, and quantity
- Automatic total price calculation
- Total items count tracking
- Timestamps for cart activity

**Relationships:**

- Belongs to User (one-to-one)
- References Products through cart items

## Database Relationship Diagram

```
User ───┬──► Order
        │
        ├──► Review ──► Product ◄─┐
        │                         │
        └──► Cart ────────────────┘
```

## Usage

These models are used by the controllers and routes in the application to interact with the MongoDB database. Import them in your controllers as needed:

```javascript
const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");
const Review = require("../models/Review");
const Cart = require("../models/Cart");
```
