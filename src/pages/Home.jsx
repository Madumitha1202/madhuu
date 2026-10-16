import { Link, useNavigate } from "react-router-dom";
import useMovies from "../hooks/useMovies";
import { MovieCard, Loading, ErrorMessage } from "../components/UI";
import { useBooking } from "../context/BookingContext";

export default function Home() {
  const { filteredMovies, search, setSearch, genre, setGenre, loading, error } = useMovies();
  const booking = useBooking();
  const navigate = useNavigate();
  return <main className="page">
    <section className="hero">
      <p className="eyebrow">YOUR NEXT MOVIE NIGHT</p>
      <h1>Big stories. <span>Big screen.</span></h1>
      <p>Find a movie, choose your theatre, select seats, pay and get your ticket.</p>
      <Link className="button" to="/movies">Explore movies</Link>
    </section>
    <section>
      <div className="section-heading"><div><p className="eyebrow">NOW SHOWING</p><h2>Popular movies</h2></div><Link to="/movies">See all →</Link></div>
      <div className="filters">
        <label className="sr-only" htmlFor="home-search">Search movies</label>
        <input id="home-search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search movies..." />
        <label className="sr-only" htmlFor="home-genre">Filter by genre</label>
        <select id="home-genre" value={genre} onChange={(e) => setGenre(e.target.value)}>
          <option>All</option><option>Action</option><option>Sci-Fi</option><option>Fantasy</option>
        </select>
      </div>
      {loading && <Loading text="Loading movies from REST API..." />}
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {!loading && !error && filteredMovies.length === 0 && <p>No movies available for this search.</p>}
      <div className="movie-grid">{filteredMovies.map((movie) => <MovieCard key={movie.id} movie={movie} onSelect={(m) => { booking.selectMovie(m); navigate(`/movie/${m.id}`); }} />)}</div>
    </section>
  </main>;
}