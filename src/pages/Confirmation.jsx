import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getApiErrorMessage, getBooking } from "../api/client";
import { ErrorMessage, Loading } from "../components/UI";

export default function Confirmation() {
  const { id } = useParams();
  const [booking, setBooking] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    getBooking(id).then((data) => { if (active) setBooking(data); })
      .catch((err) => { if (active) setError(getApiErrorMessage(err, "Could not load your ticket.")); });
    return () => { active = false; };
  }, [id]);

  if (error) return <main className="page"><ErrorMessage>{error}</ErrorMessage><Link to="/bookings">View my bookings</Link></main>;
  if (!booking) return <main className="page"><Loading text="Loading your ticket..." /></main>;

  return <main className="page success">
    <div className="success-icon">✓</div>
    <p className="eyebrow">PAYMENT SUCCESSFUL</p>
    <h1>Booking confirmed!</h1>
    <p className="lead">Booking reference <b>#{booking.id}</b></p>
    <article className="ticket" aria-label="Your ticket">
      <div className="ticket-main">
        <h2>{booking.movieTitle}</h2>
        <p>{booking.theatre}</p>
        <p>{booking.show}</p>
        <p className="ticket-seats">Seats: <b>{(booking.seats || []).join(", ")}</b></p>
        <p className="muted">{booking.customer?.name} · {booking.customer?.email}</p>
      </div>
      <div className="ticket-stub">
        <p className="muted">Paid</p>
        <p className="ticket-amount">₹{booking.total}</p>
        <p className="muted">{booking.payment?.method}</p>
        <p className="muted">{booking.payment?.id}</p>
      </div>
    </article>
    <div className="actions">
      <button className="button secondary" onClick={() => window.print()}>Print ticket</button>
      <Link className="button" to="/bookings">View booking history</Link>
    </div>
  </main>;
}
