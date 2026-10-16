import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { Seat } from "../components/UI";

const rows = ["A", "B", "C", "D"];
const seats = rows.flatMap((row) => [1, 2, 3, 4, 5, 6].map((n) => `${row}${n}`));

export default function SeatSelection() {
  const booking = useBooking();
  const navigate = useNavigate();
  const seatCount = useMemo(() => booking.seats.length, [booking.seats]);
  if (!booking.movie) return <main className="page"><h1>No movie selected</h1><Link to="/movies">Choose a movie first</Link></main>;
  return <main className="page">
    <p className="eyebrow">STEP 3 · SEAT SELECTION</p><h1>Choose your seats</h1>
    <p>{booking.movie.title} · {booking.theatre?.name || "Choose theatre"} · {booking.show || "Choose show"}</p>
    <div className="screen">SCREEN THIS WAY</div>
    <div className="seat-grid">{seats.map((seat) => <Seat key={seat} seat={seat} selected={booking.seats.includes(seat)} onClick={() => booking.selectSeat(seat)} />)}</div>
    <p>{seatCount} seat(s) selected</p>
    {seatCount > 0 ? <p>Ticket cost: ₹{booking.ticketCost} + convenience fee ₹{booking.convenienceFee} = <b>₹{booking.total}</b></p> : <p>Please select your seats.</p>}
    <div className="actions"><button className="button secondary" onClick={() => booking.seats.forEach((seat) => booking.removeSeat(seat))}>Remove all seats</button>
      <button className="button" disabled={!seatCount} onClick={() => navigate("/booking/summary")}>Booking summary</button></div>
  </main>;
}