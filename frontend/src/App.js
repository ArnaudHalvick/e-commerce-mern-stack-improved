// Path: frontend/src/App.js

import { Routes, Route } from "react-router-dom"; // Removed BrowserRouter

import Container from "./components/container/Container";
import Navbar from "./components/navbar/Navbar";
import Footer from "./components/footer/Footer";

import Shop from "./pages/Shop";
import ShopCategory from "./pages/ShopCategory";
import Product from "./pages/Product";
import Cart from "./pages/Cart";
import Auth from "./pages/Auth";

import men_banner from "./components/assets/banner_mens.png";
import women_banner from "./components/assets/banner_women.png";
import kids_banner from "./components/assets/banner_kids.png";

function App() {
  return (
    <>
      <Container fluid={true}>
        <Navbar />
      </Container>

      <Container>
        <Routes>
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
          <Route path="/product" element={<Product />}>
            <Route path=":productId" element={<Product />} />
          </Route>
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Auth />} />
        </Routes>
      </Container>

      <Container fluid={true}>
        <Footer />
      </Container>
    </>
  );
}

export default App;
