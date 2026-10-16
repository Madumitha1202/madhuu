import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { AuthProvider } from "./context/AuthContext";
import { BookingProvider } from "./context/BookingContext";
import ErrorBoundary from "./components/ErrorBoundary";
import App from "./App";
import "./styles.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <Provider store={store}>
        <AuthProvider>
          <BookingProvider>
            <BrowserRouter>
              <App />
            </BrowserRouter>
          </BookingProvider>
        </AuthProvider>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>
);