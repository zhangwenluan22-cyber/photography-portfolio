import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { getRouterBasename } from "./lib/image-utils";
import { PortfolioProvider } from "./lib/portfolio-context";
import "./styles/global.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={getRouterBasename()}>
      <PortfolioProvider>
        <App />
      </PortfolioProvider>
    </BrowserRouter>
  </React.StrictMode>
);
