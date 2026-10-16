import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getMovie } from "../api/client";
import { Loading, ErrorMessage, Button } from "../components/UI";
import { useBooking } from "../context/BookingContext";

const BookingStart = lazy(() => import("./BookingStart"));

export default function MovieDetail() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [error, setError] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const booking = useBooking();

  useEffect(() => {
    let active = true;
    setMovie(null);
    getMovie(id).then((data) => {
      if (active) { setMovie(data); console.info("[MOVIE DETAIL] Loaded ID", id); }
    }).catch(() => { if (active) setError("Movie not found. Check the API server."); });
    return () => { active = false; };
  }, [id]);

  if (error) return <main className="page"><ErrorMessage>{error}</ErrorMessage><Link to="/movies">Back to movies</Link></main>;
  if (!movie) return <main className="page"><Loading text="Loading movie details..." /></main>;

  return <main className="page">
    <Link to="/movies">← All movies</Link>
    <div className="detail-layout">
      <img className="detail-poster" src={movie.image} alt={`${movie.title} poster`} onError={(e) => { e.currentTarget.src = "https://placehold.co/320x460/20283b/ffffff?text=Movie"; }} />
      <div><p className="eyebrow">MOVIE DETAILS · ID {movie.id}</p><h1>{movie.title}</h1>
        <p>{movie.genre} · {movie.language} · {movie.duration}</p><p>⭐ {movie.rating}/10</p><p><b>Cast:</b> {movie.cast}</p>
        <p>{movie.description}</p><p className="price">₹{movie.price} per ticket</p>
        <Button onClick={() => { booking.selectMovie(movie); setShowBooking(true); }}>Choose theatre & seats</Button>
      </div>
    </div>
    {showBooking && <Suspense fallback={<Loading />}><BookingStart movie={movie} /></Suspense>}
  </main>;
}