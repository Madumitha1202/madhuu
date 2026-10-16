import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useBooking } from "../context/BookingContext";
import { ErrorMessage } from "../components/UI";

export default function Checkout() {
  const booking = useBooking();
  const navigate = useNavigate();
  const [form, setForm] = useState({ ...booking.customer });
  const [error, setError] = useState("");
  if (!booking.movie || !booking.seats.length) return <main className="page"><h1>Please select your seats</h1><Link to="/movies">Choose a movie</Link></main>;

  function submit(event) {
    event.preventDefault();
    if (!form.name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) || !/^\d{10}$/.test(form.phone)) {
      setError("Enter your name, a valid email and a 10-digit phone number.");
      console.warn("[VALIDATION] Checkout form invalid");
      return;
    }
    booking.setCustomer({ name: form.name.trim(), email: form.email.trim(), phone: form.phone });
    navigate("/payment");
  }

  return <main className="page"><p className="eyebrow">STEP 5 · YOUR DETAILS</p><h1>Customer details</h1>
    <form className="form panel" onSubmit={submit}>
      <label>Full name<input required autoComplete="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
      <label>Email<input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
      <label>Phone number<input required inputMode="numeric" autoComplete="tel" maxLength="10" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })} /></label>
      <p>Amount to pay: <b>₹{booking.total}</b></p>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <button className="button">Continue to payment →</button>
    </form>
  </main>;
}
