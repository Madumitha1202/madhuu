import { Link } from "react-router-dom";

export function Button({ children, className = "", ...props }) {
  return <button className={`button ${className}`} {...props}>{children}</button>;
}

export function Loading({ text = "Loading..." }) {
  return <p className="status" role="status">{text}</p>;
}

export function ErrorMessage({ children }) {
  return <p className="error" role="alert">{children}</p>;
}

export function MovieCard({ movie, onSelect }) {
  return <article className="movie-card">
    <img src={movie.image} alt={`${movie.title} poster`} loading="lazy" width="240" height="330"
      onError={(event) => { event.currentTarget.src = "https://placehold.co/240x330/20283b/ffffff?text=Movie"; }} />
    <div className="movie-card-body">
      <h3>{movie.title}</h3>
      <p>{movie.genre} · {movie.language}</p>
      <p>⭐ {movie.rating} · {movie.duration}</p>
      <p className="price">₹{movie.price} / ticket</p>
      <Button onClick={() => onSelect(movie)}>View & Book</Button>
      <p><Link to={`/movie/${movie.id}`}>Open details page</Link></p>
    </div>
  </article>;
}

export function Seat({ seat, selected, onClick }) {
  return <button type="button" className={`seat ${selected ? "selected" : ""}`}
    aria-label={`Seat ${seat}`} aria-pressed={selected} onClick={onClick}>{seat}</button>;
}

export default function Unused() { return null; }