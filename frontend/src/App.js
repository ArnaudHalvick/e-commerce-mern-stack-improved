// Path: frontend/src/App.js

import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useRef } from "react";
import Container from "./components/container/Container";
import Navbar from "./components/navbar/";
import Footer from "./components/footer/Footer";
import ErrorBoundary from "./components/errorHandling/boundary/ErrorBoundary";
import { ToastContainer } from "./components/errorHandling";
import AuthLoadingIndicator from "./components/authLoadingIndicator/AuthLoadingIndicator.jsx";
import AuthGuard from "./components/authGuard/AuthGuard.jsx";
import EmailVerificationGuard from "./components/authGuard/EmailVerificationGuard.jsx";
import StripeProvider from "./stripe/StripeProvider";
import CheckoutPage from "./pages/checkout/CheckoutPage";
import OrderConfirmationPage from "./pages/orderConfirmation/OrderConfirmationPage";
import OrderHistoryPage from "./pages/orderHistory/OrderHistoryPage";
// Page Components
import Shop from "./pages/shop/Shop.jsx";
import ProductListingPage from "./pages/productListing";
import Product from "./pages/product";
import Cart from "./pages/cart/Cart";
import Auth from "./pages/auth";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import NotFound from "./pages/notFound";
import ErrorDemoPage from "./pages/errorDemo/errorDemo";
import {
  VerifyEmail,
  VerifyPending,
  VerifyPasswordChange,
} from "./pages/verification";
import Profile from "./pages/profile/index.jsx";

// Assets
import men_banner from "./components/assets/banner_mens.png";
import women_banner from "./components/assets/banner_women.png";
import kids_banner from "./components/assets/banner_kids.png";

// Hooks
import { useAuth } from "./hooks/state";

/**
 * Protected route component that requires authentication
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();

  // If still loading auth state, show the children with AuthGuard handling the loading state
  if (loading) {
    return <AuthGuard requireAuth>{children}</AuthGuard>;
  }

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated, show the children
  return children;
};

/**
 * Route that's only accessible when NOT authenticated
 */
const UnauthenticatedRoute = ({ children }) => {
  const { isAuthenticated, loading, initialLoadComplete } = useAuth();

  // Wait for initial authentication check to complete
  if (loading || !initialLoadComplete) {
    return <AuthGuard>{children}</AuthGuard>;
  }

  // If authenticated, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  // If not authenticated, show the children
  return children;
};

/**
 * Main App component that defines the application structure and routes
 */
function App() {
  const { fetchUserProfile } = useAuth();
  const authInitialized = useRef(false);

  useEffect(() => {
    if (!authInitialized.current) {
      authInitialized.current = true;
      const checkAuth = async () => {
        try {
          // Verify token and load user profile
          await fetchUserProfile();
        } catch (error) {
          console.error("Error initializing auth state:", error);
        }
      };

      checkAuth();
    }
  }, [fetchUserProfile]);

  return (
    <ErrorBoundary>
      {/* Auth Loading Indicator */}
      <AuthLoadingIndicator />

      {/* Fixed Header - Always visible */}
      <Container fluid={true}>
        <Navbar />
      </Container>

      {/* Main Content Area */}
      <Container>
        <Routes>
          {/* Home and Category Routes - Public */}
          <Route path="/" element={<Shop />} />
          <Route
            path="/men"
            element={
              <ProductListingPage
                pageType="category"
                category="men"
                banner={men_banner}
              />
            }
          />
          <Route
            path="/women"
            element={
              <ProductListingPage
                pageType="category"
                category="women"
                banner={women_banner}
              />
            }
          />
          <Route
            path="/kids"
            element={
              <ProductListingPage
                pageType="category"
                category="kids"
                banner={kids_banner}
              />
            }
          />

          {/* Special Offer Routes - Public */}
          <Route
            path="/shop"
            element={<ProductListingPage pageType="offers" />}
          />

          {/* Product Detail Routes - Public */}
          <Route path="/product" element={<Product />}>
            <Route path=":productId" element={<Product />} />
          </Route>
          <Route path="/products/:productSlug" element={<Product />} />

          {/* Cart - Public */}
          <Route path="/cart" element={<Cart />} />

          {/* Auth Routes - Only when NOT authenticated */}
          <Route
            path="/login"
            element={
              <UnauthenticatedRoute>
                <Auth />
              </UnauthenticatedRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <UnauthenticatedRoute>
                <Auth initialState="Signup" />
              </UnauthenticatedRoute>
            }
          />

          {/* Password Recovery Routes - Public */}
          <Route
            path="/forgot-password"
            element={
              <UnauthenticatedRoute>
                <ForgotPassword />
              </UnauthenticatedRoute>
            }
          />
          <Route
            path="/reset-password/:token"
            element={
              <UnauthenticatedRoute>
                <ResetPassword />
              </UnauthenticatedRoute>
            }
          />

          {/* Protected Routes - Only when authenticated */}
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* Verification Routes - Public */}
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-pending" element={<VerifyPending />} />
          <Route
            path="/verify-password-change"
            element={<VerifyPasswordChange />}
          />

          {/* Demo Routes - Public */}
          <Route path="/error-demo" element={<ErrorDemoPage />} />

          {/* Protected routes that also require email verification */}
          <Route
            path="/checkout"
            element={
              <ProtectedRoute>
                <EmailVerificationGuard>
                  <StripeProvider>
                    <CheckoutPage />
                  </StripeProvider>
                </EmailVerificationGuard>
              </ProtectedRoute>
            }
          />

          <Route
            path="/order-confirmation/:orderId"
            element={
              <ProtectedRoute>
                <EmailVerificationGuard>
                  <OrderConfirmationPage />
                </EmailVerificationGuard>
              </ProtectedRoute>
            }
          />

          {/* Add a route for order history */}
          <Route
            path="/account/orders"
            element={
              <ProtectedRoute>
                <OrderHistoryPage />
              </ProtectedRoute>
            }
          />

          {/* 404 Route - Public */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>

      {/* Fixed Footer - Always visible */}
      <Container fluid={true}>
        <Footer />
      </Container>

      {/* Toast Notifications */}
      <ToastContainer />
    </ErrorBoundary>
  );
}

export default App;
