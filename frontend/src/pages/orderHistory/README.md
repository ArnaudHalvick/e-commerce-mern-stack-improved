# OrderHistory Component

A comprehensive order history module for the e-commerce application that displays a user's past orders with advanced filtering, sorting, and pagination capabilities.

## Features

- Complete order history display
- Advanced filtering options:
  - Order status filter
  - Date range filter
- Sorting capabilities:
  - By date
  - By order total
  - By status
- Pagination with customizable items per page
- Responsive order cards
- Loading and error states
- Order status tracking
- Quick navigation to order details

## Component Structure

```
orderHistory/
├── components/                  # Sub-components
│   ├── ErrorState.jsx          # Error display component
│   ├── LoadingState.jsx        # Loading indicator
│   ├── NoOrders.jsx            # Empty state display
│   ├── OrderCard.jsx           # Individual order display
│   ├── OrderFilters.jsx        # Filter controls
│   ├── OrderList.jsx           # Main order list container
│   ├── OrderPagination.jsx     # Pagination controls
│   ├── OrderStatusBadge.jsx    # Status indicator
│   └── index.js               # Components export file
├── hooks/                      # Custom hooks
│   ├── useOrderFormatting.js  # Order data formatting
│   ├── useOrderHistory.js     # Main order management
│   └── index.js               # Hooks export file
├── styles/                     # Component styles
│   ├── ErrorState.css         # Error styles
│   ├── LoadingState.css       # Loading styles
│   ├── NoOrders.css           # Empty state styles
│   ├── OrderCard.css          # Order card styles
│   ├── OrderFilters.css       # Filter styles
│   ├── OrderHistoryPage.css   # Main page styles
│   ├── OrderPagination.css    # Pagination styles
│   ├── OrderStatusBadge.css   # Status badge styles
│   └── index.css              # Main stylesheet
└── OrderHistoryPage.jsx       # Main component
```

## Usage

```jsx
import OrderHistoryPage from "../pages/orderHistory/OrderHistoryPage";
import { Route, Routes } from "react-router-dom";

// Inside your router component
const AppRouter = () => {
  return (
    <Routes>
      <Route
        path="/account/orders"
        element={
          <ProtectedRoute>
            <OrderHistoryPage />
          </ProtectedRoute>
        }
      />
      {/* Other routes */}
    </Routes>
  );
};
```

## Features Detail

### Filtering

- Status filter options:
  - All orders
  - Processing
  - Shipped
  - Delivered
  - Cancelled
- Date range filter:
  - Custom date range picker
  - Preset ranges (Last 30 days, Last 3 months, etc.)
- Clear all filters option

### Sorting

- Sort orders by:
  - Order date (newest/oldest)
  - Order total (high/low)
  - Status (alphabetical)
- Persistent sort preferences

### Pagination

- Customizable items per page
- Page navigation controls
- Total items counter
- Current page indicator

## State Management

The component uses the following hooks for state management:

- `useOrderHistory`: Main hook managing:
  - Order data fetching
  - Filtering logic
  - Sorting logic
  - Pagination state
- `useOrderFormatting`: Handles:
  - Date formatting
  - Price formatting
  - Status display formatting

## Error Handling

- Network request errors
- Empty state handling
- Loading state management
- Filter/Sort error recovery
- Retry mechanisms

## Order Card Display

Each order card shows:

- Order ID
- Order date
- Total amount
- Status badge
- Number of items
- Primary shipping address
- Quick action buttons

## Related Components

- OrderConfirmation (detailed order view)
- Profile (contains order history link)
- Cart (order creation source)
- Checkout (order creation process)

## Props

### OrderList Component

```typescript
interface OrderListProps {
  orders: Order[];
  filteredOrdersCount: number;
  totalOrdersCount: number;
  sortBy: string;
  handleSortChange: (sort: string) => void;
  statusFilter: string;
  dateRangeFilter: DateRange;
  handleStatusFilterChange: (status: string) => void;
  handleDateRangeFilterChange: (range: DateRange) => void;
  clearAllFilters: () => void;
  currentPage: number;
  totalPages: number;
  itemsPerPage: number;
  handlePageChange: (page: number) => void;
  handleItemsPerPageChange: (items: number) => void;
}
```

### Order Object Structure

```javascript
{
  _id: String,           // Order ID
  createdAt: Date,       // Order creation date
  items: Array,          // Array of ordered items
  orderStatus: String,   // Current order status
  paymentInfo: Object,   // Payment details
  shippingInfo: Object,  // Shipping information
  totals: {
    subtotal: Number,    // Order subtotal
    shipping: Number,    // Shipping cost
    tax: Number,         // Tax amount
    total: Number        // Total amount
  }
}
```
