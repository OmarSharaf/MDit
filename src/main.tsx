import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";

try {
  const saved = localStorage.getItem("mdit-settings");
  const theme = saved ? JSON.parse(saved).theme : "light";
  document.documentElement.setAttribute(
    "data-theme",
    theme === "dark" ? "dark" : "light"
  );
} catch {
  document.documentElement.setAttribute("data-theme", "light");
}

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
