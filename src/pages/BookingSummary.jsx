import { Link, useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";

export default function BookingSummary() {
  const booking = useBooking();
  const navigate = useNavigate();
  if (!booking.movie || !booking.seats.length) return <main className="page"><h1>Please select your seats</h1><Link to="/movies">Choose a movie</Link></main>;
  return <main className="page"><p className="eyebrow">STEP 4 · SUMMARY</p><h1>Booking summary</h1>
    <div className="panel summary">
      <p><b>Movie:</b> {booking.movie.title}</p><p><b>Theatre:</b> {booking.theatre?.name || "Not selected"}</p><p><b>Show:</b> {booking.show || "Not selected"}</p>
      <p><b>Seats:</b> {booking.seats.join(", ")}</p><p><b>Tickets:</b> {booking.selectedSeatCount}</p><p><b>Ticket cost:</b> ₹{booking.ticketCost}</p><p><b>Convenience fee:</b> ₹{booking.convenienceFee}</p><h2>Total: ₹{booking.total}</h2>
      <button className="button" onClick={() => navigate("/checkout")}>Continue to checkout</button>
    </div>
  </main>;
}