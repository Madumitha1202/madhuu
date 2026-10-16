
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import MovieDetail from "../pages/MovieDetail";
import { getMovie } from "../api/client";
import { useBooking } from "../context/BookingContext";

vi.mock("../api/client", () => ({
  getMovie: vi.fn(),
}));

vi.mock("../context/BookingContext", () => ({
  useBooking: vi.fn(),
}));

vi.mock("../components/UI", () => ({
  Loading: ({ text }) => <p>{text}</p>,
  ErrorMessage: ({ children }) => <p>{children}</p>,
  Button: ({ children, onClick }) => (
    <button onClick={onClick}>{children}</button>
  ),
}));

vi.mock("../pages/BookingStart", () => ({
  default: ({ movie }) => <p>Booking started for {movie.title}</p>,
}));

const movie = {
  id: 1,
  title: "Leo",
  image: "/leo.jpg",
  genre: "Action",
  language: "Tamil",
  duration: "2h 30m",
  rating: 8.5,
  cast: "Actor A",
  description: "An action movie",
  price: 180,
};

function renderMovieDetail() {
  return render(
    <MemoryRouter initialEntries={["/movies/1"]}>
      <Routes>
        <Route path="/movies/:id" element={<MovieDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe("Movie Details Page", () => {
  const selectMovie = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useBooking.mockReturnValue({ selectMovie });
  });

  it("shows loading while movie details are fetched", () => {
    getMovie.mockReturnValue(new Promise(() => {}));

    renderMovieDetail();

    expect(
      screen.getByText("Loading movie details...")
    ).toBeInTheDocument();
  });

  it("displays movie details after loading", async () => {
    getMovie.mockResolvedValue(movie);

    renderMovieDetail();

    expect(
      await screen.findByRole("heading", { name: "Leo" })
    ).toBeInTheDocument();

    expect(screen.getByText(/Action/)).toBeInTheDocument();
    expect(screen.getByText(/Tamil/)).toBeInTheDocument();
    expect(screen.getByText(/Actor A/)).toBeInTheDocument();
    expect(screen.getByText("₹180 per ticket")).toBeInTheDocument();
  });

  it("shows an error when movie details cannot be loaded", async () => {
    getMovie.mockRejectedValue(new Error("Not found"));

    renderMovieDetail();

    expect(
      await screen.findByText("Movie not found. Check the API server.")
    ).toBeInTheDocument();
  });

  it("selects the movie when Choose theatre & seats is clicked", async () => {
    getMovie.mockResolvedValue(movie);

    renderMovieDetail();

    fireEventCheck();
    await screen.findByRole("heading", { name: "Leo" });

    screen.getByRole("button", {
      name: "Choose theatre & seats",
    }).click();

    expect(selectMovie).toHaveBeenCalledWith(movie);
    expect(
      await screen.findByText("Booking started for Leo")
    ).toBeInTheDocument();
  });
});

function fireEventCheck() {}
