import React from "react";
import HookTestComponent from "../../components/HookTestComponent";
import ProductHookTest from "../../components/ProductHookTest";

const TestPage = () => {
  return (
    <div className="test-page">
      <h1>Hook Refactoring Test Page</h1>
      <p>This page helps verify that our hooks refactoring works correctly.</p>

      <div
        style={{
          marginBottom: "40px",
          borderBottom: "2px solid #eee",
          paddingBottom: "20px",
        }}
      >
        <h2>General Hook Test (Auth, Cart, Products)</h2>
        <HookTestComponent />
      </div>

      <div style={{ marginTop: "40px" }}>
        <h2>Product Hook Specific Test</h2>
        <ProductHookTest />
      </div>
    </div>
  );
};

export default TestPage;
