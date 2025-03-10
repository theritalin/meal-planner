import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

// React 18 yerine React 17 API'sini kullanıyoruz
ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
