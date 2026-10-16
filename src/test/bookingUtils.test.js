import { describe, it, expect } from "vitest";

function filterMovies(movies, search, genre) {
  return movies.filter((movie) =>
    movie.title.toLowerCase().includes(search.toLowerCase()) &&
    (genre === "All" || movie.genre === genre)
  );
}
function totalPrice(seats, price) {
  return seats.length ? seats.length * price + 30 : 0;
}

const movies = [
  { title: "Leo", genre: "Action" },
  { title: "Interstellar", genre: "Sci-Fi" }
];

describe("Movie booking utility tests", () => {
  it("searches movie titles", () => {
    expect(filterMovies(movies, "leo", "All")).toHaveLength(1);
  });
  it("filters genre", () => {
    expect(filterMovies(movies, "", "Action")).toHaveLength(1);
  });
  it("calculates total with convenience fee", () => {
    expect(totalPrice(["A1", "A2"], 180)).toBe(390);
  });
  it("returns zero when no seats are selected", () => {
    expect(totalPrice([], 180)).toBe(0);
  });
});