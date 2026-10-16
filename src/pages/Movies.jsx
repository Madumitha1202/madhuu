import { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import useMovies from "../hooks/useMovies";
import { Loading, ErrorMessage, MovieCard } from "../components/UI";
import { useBooking } from "../context/BookingContext";

export default function Movies() {
  const searchRef = useRef(null);
  const { filteredMovies, genres, search, setSearch, genre, setGenre, loading, error, reload } = useMovies();
  const booking = useBooking();
  const navigate = useNavigate();
  return <main className="page">
    <div className="section-heading"><div><p className="eyebrow">FIND YOUR NEXT FAVOURITE</p><h1 className="gradient-text">All Movies</h1><p className="lead">Explore the collection and pick your perfect show.</p></div><button className="button secondary" onClick={() => searchRef.current?.focus()}>⌕ Focus search</button></div>
    <div className="filters">
      <input ref={searchRef} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by movie title..." aria-label="Search movies" />
      <select value={genre} onChange={(e) => setGenre(e.target.value)} aria-label="Filter genre">
        {genres.map((item) => <option key={item}>{item}</option>)}
      </select>
      <button className="button secondary" onClick={reload}>↻ Refresh movies</button>
    </div>
    <p className="results-count">{loading ? "Loading collection..." : `${filteredMovies.length} movie${filteredMovies.length === 1 ? "" : "s"} found`}</p>
    {loading && <Loading text="Loading movie collection..." />}
    {error && <ErrorMessage>{error}</ErrorMessage>}
    {!loading && !error && filteredMovies.length === 0 && <p className="empty-state">🎬 No movies match your search. Try another title or genre.</p>}
    <div className="movie-grid">{filteredMovies.map((movie) => <MovieCard key={movie.id} movie={movie} onSelect={(m) => { booking.selectMovie(m); navigate(`/movie/${m.id}`); }} />)}</div>
    <p className="hint">Search and genre filters use the movie data loaded from the REST API. <Link to="/theatres">Browse theatres →</Link></p>
  </main>;
}
