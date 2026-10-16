
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import Confirmation from "../pages/Confirmation";
import { getBooking } from "../api/client";

vi.mock("../api/client", () => ({
  getBooking: vi.fn(),
  getApiErrorMessage: vi.fn((err, fallback) => fallback),
}));

vi.mock("../components/UI", () => ({
  Loading: ({ text }) => <p>{text}</p>,
  ErrorMessage: ({ children }) => <p>{children}</p>,
}));

describe("Booking Confirmation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows loading while booking is being fetched", () => {
    getBooking.mockReturnValue(new Promise(() => {}));

    render(
      <MemoryRouter initialEntries={["/confirmation/123"]}>
        <Routes>
          <Route path="/confirmation/:id" element={<Confirmation />} />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Loading your ticket...")).toBeInTheDocument();
  });

  it("displays booking details after successful payment", async () => {
    getBooking.mockResolvedValue({
      id: 123,
      movieTitle: "Leo",
      theatre: "Chennai Cinema",
      show: "6:30 PM",
      seats: ["A1", "A2"],
      total: 390,
      customer: { name: "Test User", email: "test@example.com" },
      payment: { method: "UPI", id: "PAY123" },
    });

    render(
      <MemoryRouter initialEntries={["/confirmation/123"]}>
        <Routes>
          <Route path="/confirmation/:id" element={<Confirmation />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByRole("heading", {
      name: "Booking confirmed!",
    })).toBeInTheDocument();

    expect(screen.getByText("Leo")).toBeInTheDocument();
    expect(screen.getByText("Chennai Cinema")).toBeInTheDocument();
    expect(screen.getByText("A1, A2")).toBeInTheDocument();
    expect(screen.getByText("₹390")).toBeInTheDocument();
    expect(getBooking).toHaveBeenCalledWith("123");
  });

  it("shows an error when booking details cannot be loaded", async () => {
    getBooking.mockRejectedValue(new Error("Network error"));

    render(
      <MemoryRouter initialEntries={["/confirmation/123"]}>
        <Routes>
          <Route path="/confirmation/:id" element={<Confirmation />} />
        </Routes>
      </MemoryRouter>
    );

    expect(
      await screen.findByText("Could not load your ticket.")
    ).toBeInTheDocument();
  });
});
