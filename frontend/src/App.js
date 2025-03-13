// Path: frontend/src/App.js

import { Routes, Route } from "react-router-dom"; // Removed BrowserRouter

import Container from "./components/container/Container";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";
import ErrorBoundary from "./components/errorHandling/ErrorBoundary";

// Page Components
import Shop from "./pages/Shop";
import ShopCategory from "./pages/shopCategory";
import Product from "./pages/product";
import Cart from "./pages/Cart";
import Auth from "./pages/auth";
import Offers from "./pages/offers";
import NotFound from "./pages/NotFound";
import VerifyEmail from "./pages/VerifyEmail";
import Profile from "./pages/Profile";
import VerifyPending from "./pages/VerifyPending";

// Assets
import men_banner from "./components/assets/banner_mens.png";
import women_banner from "./components/assets/banner_women.png";
import kids_banner from "./components/assets/banner_kids.png";

/**
 * Main App component that defines the application structure and routes
 */
function App() {
  return (
    <ErrorBoundary>
      {/* Fixed Header */}
      <Container fluid={true}>
        <Navbar />
      </Container>

      {/* Main Content Area */}
      <Container>
        <Routes>
          {/* Home and Category Routes */}
          <Route path="/" element={<Shop />} />
          <Route
            path="/men"
            element={<ShopCategory category="men" banner={men_banner} />}
          />
          <Route
            path="/women"
            element={<ShopCategory category="women" banner={women_banner} />}
          />
          <Route
            path="/kids"
            element={<ShopCategory category="kids" banner={kids_banner} />}
          />

          {/* Special Offer Routes */}
          <Route path="/offers" element={<Offers />} />

          {/* Product Detail Routes */}
          {/* Legacy ID-based routes (for backward compatibility) */}
          <Route path="/product" element={<Product />}>
            <Route path=":productId" element={<Product />} />
          </Route>
          {/* New slug-based routes (preferred for SEO) */}
          <Route path="/products/:productSlug" element={<Product />} />

          {/* User Account Routes */}
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-pending" element={<VerifyPending />} />

          {/* 404 Route - Must be the last route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>

      {/* Fixed Footer */}
      <Container fluid={true}>
        <Footer />
      </Container>
    </ErrorBoundary>
  );
}

export default App;
