import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import ErrorBoundary from "../ErrorBoundary";

// A component that throws an error on render
const CrashingComponent = () => {
  throw new Error("Test crash");
};

describe("ErrorBoundary", () => {
  it("renders children when no error occurs", () => {
    render(
      <ErrorBoundary>
        <div data-testid="safe-child">Safe Content</div>
      </ErrorBoundary>
    );
    expect(screen.getByTestId("safe-child")).toBeDefined();
    expect(screen.getByText("Safe Content")).toBeDefined();
  });

  it("renders error UI when a child crashes", () => {
    // Suppress console.error for the expected crash
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    render(
      <ErrorBoundary>
        <CrashingComponent />
      </ErrorBoundary>
    );

    expect(screen.getByText("Something went wrong")).toBeDefined();
    expect(screen.getByText("Reload Application")).toBeDefined();
    
    spy.mockRestore();
  });

  it("resets and reloads when reload button is clicked", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    
    // Mock window.location.href
    const originalLocation = window.location;
    delete window.location;
    window.location = { href: "" };

    render(
      <ErrorBoundary>
        <CrashingComponent />
      </ErrorBoundary>
    );

    const reloadButton = screen.getByText("Reload Application");
    fireEvent.click(reloadButton);

    expect(window.location.href).toBe("/");

    // Restore location
    window.location = originalLocation;
    spy.mockRestore();
  });
});
