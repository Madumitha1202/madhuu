import React from "react";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() { return { hasError: true }; }
  componentDidCatch(error, info) {
    console.error("[ERROR BOUNDARY]", error, info.componentStack);
  }
  render() {
    if (this.state.hasError) {
      return <main className="page"><h1>Something went wrong</h1><p>Please refresh and try again.</p></main>;
    }
    return this.props.children;
  }
}