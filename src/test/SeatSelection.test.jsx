
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import SeatSelection from "../pages/SeatSelection";

const mockSelectSeat = vi.fn();
const mockRemoveSeat = vi.fn();
const mockNavigate = vi.fn();

let mockBooking;

vi.mock("../context/BookingContext", () => ({
  useBooking: () => mockBooking,
}));

vi.mock("react-router-dom", () => ({
  Link: ({ to, children }) => <a href={to}>{children}</a>,
  useNavigate: () => mockNavigate,
}));

vi.mock("../components/UI", () => ({
  Seat: ({ seat, selected, onClick }) => (
    <button
      aria-label={`Seat ${seat}`}
      aria-pressed={selected}
      onClick={onClick}
    >
      {seat}
    </button>
  ),
}));

describe("SeatSelection Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockBooking = {
      movie: { title: "Leo", price: 200 },
      theatre: { name: "PVR Cinemas" },
      show: "6:00 PM",
      seats: [],
      ticketCost: 0,
      convenienceFee: 0,
      total: 0,
      selectSeat: mockSelectSeat,
      removeSeat: mockRemoveSeat,
    };
  });

  it("shows a message if no movie is selected", () => {
    mockBooking.movie = null;

    render(<SeatSelection />);

    expect(screen.getByText("No movie selected")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /choose a movie first/i })
    ).toHaveAttribute("href", "/movies");
  });

  it("displays movie details and all 24 seats", () => {
    render(<SeatSelection />);

    expect(
      screen.getByRole("heading", { name: "Choose your seats" })
    ).toBeInTheDocument();

    expect(
      screen.getByText(/Leo.*PVR Cinemas.*6:00 PM/)
    ).toBeInTheDocument();

    expect(
      screen.getAllByRole("button", { name: /^Seat [A-D][1-6]$/ })
    ).toHaveLength(24);
  });

  it("selects a seat when clicked", () => {
    render(<SeatSelection />);

    fireEvent.click(
      screen.getByRole("button", { name: "Seat A1" })
    );

    expect(mockSelectSeat).toHaveBeenCalledWith("A1");
  });

  it("shows selected seats and ticket cost", () => {
    mockBooking.seats = ["A1", "A2"];
    mockBooking.ticketCost = 400;
    mockBooking.convenienceFee = 40;
    mockBooking.total = 440;

    render(<SeatSelection />);

    expect(screen.getByText("2 seat(s) selected")).toBeInTheDocument();

    // Check the complete ticket cost paragraph
    expect(
      screen.getByText((_, element) =>
        element?.tagName === "P" &&
        element.textContent.includes("₹400") &&
        element.textContent.includes("₹40") &&
        element.textContent.includes("₹440")
      )
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", { name: "Seat A1" })
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("removes all selected seats", () => {
    mockBooking.seats = ["A1", "A2"];

    render(<SeatSelection />);

    fireEvent.click(
      screen.getByRole("button", { name: "Remove all seats" })
    );

    expect(mockRemoveSeat).toHaveBeenCalledTimes(2);
    expect(mockRemoveSeat).toHaveBeenNthCalledWith(1, "A1");
    expect(mockRemoveSeat).toHaveBeenNthCalledWith(2, "A2");
  });

  it("disables booking summary when no seats are selected", () => {
    render(<SeatSelection />);

    expect(
      screen.getByRole("button", { name: "Booking summary" })
    ).toBeDisabled();
  });

  it("navigates to booking summary when seats are selected", () => {
    mockBooking.seats = ["A1"];

    render(<SeatSelection />);

    fireEvent.click(
      screen.getByRole("button", { name: "Booking summary" })
    );

    expect(mockNavigate).toHaveBeenCalledWith("/booking/summary");
  });
});
