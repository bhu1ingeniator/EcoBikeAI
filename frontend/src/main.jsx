import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { setToken } from "./api";

// Handle the return from Google sign-in: /#token=... or /#error=google
const params = new URLSearchParams(window.location.hash.slice(1));
const googleToken = params.get("token");
if (googleToken) {
  setToken(googleToken);
  window.history.replaceState(null, "", window.location.pathname);
} else if (params.get("error") === "google") {
  window.alert("Google sign-in failed. Please try again.");
  window.history.replaceState(null, "", window.location.pathname);
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);