import { useEffect, useState } from "react";
import { deleteBooking, getApiErrorMessage, getBookings, updateBooking } from "../api/client";
import { ErrorMessage, Loading } from "../components/UI";

export default function Bookings() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  async function refresh() {
    setLoading(true); setError("");
    try { setItems(await getBookings()); }
    catch (err) { setError(getApiErrorMessage(err, "Could not retrieve booking history.")); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  async function cancel(item) {
    if (!confirm(`Cancel booking #${item.id}?`)) return;
    try {
      await updateBooking(item.id, { status: "Cancelled" });
      console.info("[BOOKING UPDATED]", item.id, "Cancelled");
      await refresh();
    } catch (err) { setError(getApiErrorMessage(err, "Could not update booking.")); }
  }
  async function remove(item) {
    if (!confirm(`Delete booking record #${item.id}?`)) return;
    try {
      await deleteBooking(item.id);
      console.info("[BOOKING DELETED]", item.id);
      await refresh();
    } catch (err) { setError(getApiErrorMessage(err, "Could not delete booking.")); }
  }

  return <main className="page"><p className="eyebrow">YOUR ACTIVITY</p><h1>My bookings</h1>
    <button className="button secondary" onClick={refresh}>Refresh history (GET)</button>
    {loading && <Loading />}{error && <ErrorMessage>{error}</ErrorMessage>}
    {!loading && !error && items.length === 0 && <p>No bookings available yet. Pick a movie and book your first ticket.</p>}
    <div className="booking-list">{items.slice().reverse().map((item) => <article className="panel" key={item.id}>
      <div className="section-heading"><h2>{item.movieTitle}</h2><span className={`pill ${item.status === "Cancelled" ? "cancelled" : ""}`}>{item.status}</span></div>
      <p>Booking #{item.id} · {item.theatre} · {item.show}</p><p>Seats: {(item.seats || []).join(", ")} · Total ₹{item.total}</p>
      <p>{item.customer?.name} · {item.customer?.email}</p>
      {item.payment && <p className="muted">Payment: {item.payment.method} · {item.payment.id} · {item.payment.status}</p>}
      <div className="actions"><button className="button secondary" disabled={item.status === "Cancelled"} onClick={() => cancel(item)}>Cancel (PATCH)</button><button className="button danger" onClick={() => remove(item)}>Delete (DELETE)</button></div>
    </article>)}</div>
  </main>;
}