import { useEffect, useState } from "react";
import { getTheatres } from "../api/client";
import { useBooking } from "../context/BookingContext";
import { ErrorMessage, Loading } from "../components/UI";
import { useNavigate } from "react-router-dom";

export default function BookingStart({ movie }) {
  const [theatres, setTheatres] = useState([]);
  const [error, setError] = useState("");
  const booking = useBooking();
  const navigate = useNavigate();
  useEffect(() => { getTheatres().then(setTheatres).catch(() => setError("Could not load theatres. Is the API running?")); }, []);
  if (error) return <ErrorMessage>{error}</ErrorMessage>;
  if (!theatres.length) return <Loading text="Loading theatres..." />;
  return <section className="panel"><h2>Choose theatre and show</h2>
    <div className="theatre-grid">{theatres.map((theatre) => <article className="theatre-card" key={theatre.id}>
      <h3>{theatre.name}</h3><p>{theatre.location}</p>
      <div className="show-list">{theatre.shows.map((show) => <button key={show} className={`button small ${booking.theatre?.id === theatre.id && booking.show === show ? "" : "secondary"}`} onClick={() => { booking.selectTheatre(theatre); booking.selectShow(show); console.info("[SHOW] selected", theatre.name, show); }}>{show}</button>)}</div>
    </article>)}</div>
    <button className="button" disabled={!booking.theatre || !booking.show} onClick={() => navigate("/booking/seats")}>Continue to seats</button>
  </section>;
}