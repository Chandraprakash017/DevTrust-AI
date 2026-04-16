import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import "./i18n";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "react-hot-toast";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) {
      return <div style={{ padding: '20px', color: 'red' }}>🚨 Application crashed. Please refresh.</div>;
    }
    return this.props.children;
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId="812165039486-qh8m18v4lhk25nkae88l5h57k37v2v9b.apps.googleusercontent.com">
      <ErrorBoundary>
        <Suspense fallback={<div className="min-h-screen bg-[#0a0a0c] flex items-center justify-center text-white font-bold tracking-widest uppercase">Initializing DevTrust Pro...</div>}>
          <App />
          <Toaster position="top-right" />
        </Suspense>
      </ErrorBoundary>
    </GoogleOAuthProvider>
  </React.StrictMode>
);