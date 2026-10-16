
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { MovieCard } from "../components/UI";

const movie = {
  id: 1,
  title: "Leo",
  image: "/leo.jpg",
  genre: "Action",
  language: "Tamil",
  rating: 8.5,
  duration: "2h 30m",
  price: 180,
};

describe("Movie Card Component", () => {
  it("displays the movie title", () => {
    render(
      <MemoryRouter>
        <MovieCard movie={movie} onSelect={() => {}} />
      </MemoryRouter>
    );

    expect(
      screen.getByRole("heading", { name: "Leo" })
    ).toBeInTheDocument();
  });

  it("displays movie details and ticket price", () => {
    render(
      <MemoryRouter>
        <MovieCard movie={movie} onSelect={() => {}} />
      </MemoryRouter>
    );

    expect(screen.getByText(/Action/)).toBeInTheDocument();
    expect(screen.getByText(/Tamil/)).toBeInTheDocument();
    expect(screen.getByText(/180/)).toBeInTheDocument();
  });

  it("calls onSelect when View & Book is clicked", () => {
    const onSelect = vi.fn();

    render(
      <MemoryRouter>
        <MovieCard movie={movie} onSelect={onSelect} />
      </MemoryRouter>
    );

    fireEvent.click(
      screen.getByRole("button", { name: "View & Book" })
    );

    expect(onSelect).toHaveBeenCalledWith(movie);
  });
});
