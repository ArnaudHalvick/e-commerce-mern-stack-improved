// Path: frontend/src/components/container/Container.jsx
import React from "react";
import "./Container.css";

const Container = ({ children, fluid = false }) => {
  return (
    <div className={fluid ? "container-fluid" : "container"}>{children}</div>
  );
};

export default Container;
