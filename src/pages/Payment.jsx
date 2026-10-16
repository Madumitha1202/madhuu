import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createBooking, createPayment, getApiErrorMessage } from "../api/client";
import { useBooking } from "../context/BookingContext";
import { ErrorMessage } from "../components/UI";

const METHODS = [
  { id: "upi", icon: "📱", title: "UPI", sub: "GPay, PhonePe, Paytm" },
  { id: "card", icon: "💳", title: "Credit / Debit card", sub: "Visa, Mastercard, RuPay" },
  { id: "netbanking", icon: "🏦", title: "Net banking", sub: "All major banks" }
];
const BANKS = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Indian Bank", "Canara Bank", "Kotak Mahindra Bank", "Bank of Baroda"];
const UPI_SUFFIXES = ["@okaxis", "@oksbi", "@ybl", "@paytm"];

function luhn(digits) {
  let sum = 0, alt = false;
  for (let i = digits.length - 1; i >= 0; i--) {
    let n = Number(digits[i]);
    if (alt) { n *= 2; if (n > 9) n -= 9; }
    sum += n; alt = !alt;
  }
  return sum % 10 === 0;
}
function cardBrand(digits) {
  if (/^4/.test(digits)) return "Visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "Mastercard";
  if (/^3[47]/.test(digits)) return "Amex";
  if (/^(60|65|81|82|508)/.test(digits)) return "RuPay";
  return "Card";
}
function expiryOk(value) {
  const m = /^(\d{2})\/(\d{2})$/.exec(value);
  if (!m) return false;
  const month = Number(m[1]), year = 2000 + Number(m[2]);
  return month >= 1 && month <= 12 && new Date(year, month, 1) > new Date();
}

export default function Payment() {
  const booking = useBooking();
  const navigate = useNavigate();
  const [method, setMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [bank, setBank] = useState("");
  const [error, setError] = useState("");
  const [paying, setPaying] = useState(false);
  const paidRef = useRef(null); // keeps a successful payment so a retry never charges twice

  if (!booking.movie || !booking.seats.length) return <main className="page"><h1>Please select your seats</h1><Link to="/movies">Choose a movie</Link></main>;
  if (!booking.customer.name) return <main className="page"><h1>Enter your details first</h1><Link to="/checkout">Go to customer details</Link></main>;

  const digits = card.number.replace(/\D/g, "");
  const brand = cardBrand(digits);

  function validate() {
    if (method === "upi" && !/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId.trim())) return "Enter a valid UPI ID, e.g. name@okaxis.";
    if (method === "card") {
      if (digits.length < 15 || !luhn(digits)) return "Enter a valid card number.";
      if (!card.name.trim()) return "Enter the name on the card.";
      if (!expiryOk(card.expiry)) return "Enter a valid, unexpired expiry date (MM/YY).";
      if (!/^\d{3,4}$/.test(card.cvv)) return "Enter the 3 or 4 digit CVV.";
    }
    if (method === "netbanking" && !bank) return "Select your bank.";
    return "";
  }

  async function pay(event) {
    event.preventDefault();
    const problem = validate();
    if (problem) { setError(problem); return; }
    setPaying(true); setError("");
    try {
      if (!paidRef.current) {
        // Card number and CVV never leave this form - only the last 4 digits and brand are sent.
        const detail = method === "upi" ? { upiId: upiId.trim() }
          : method === "card" ? { last4: digits.slice(-4), brand }
          : { bank };
        paidRef.current = await createPayment({ movieId: booking.movie.id, seats: booking.seats, method, detail });
        console.info("[PAYMENT SUCCESS]", paidRef.current.paymentId);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, "Payment failed. You were not charged."));
      setPaying(false);
      return;
    }
    try {
      const saved = await createBooking({
        movieId: booking.movie.id, theatre: booking.theatre?.name, show: booking.show,
        seats: booking.seats, customer: booking.customer, paymentId: paidRef.current.paymentId
      });
      console.info("[BOOKING CONFIRMED]", saved);
      navigate(`/confirmation/${saved.id}`, { replace: true });
      booking.clearBooking();
    } catch (err) {
      setError(`${getApiErrorMessage(err, "Could not confirm the booking.")} Your payment (${paidRef.current.paymentId}) is safe - press the button again to retry without paying twice.`);
      setPaying(false);
    }
  }

  return <main className="page"><p className="eyebrow">STEP 6 · PAYMENT</p><h1>Complete your payment</h1>
    <div className="pay-layout">
      <form className="panel pay-form" onSubmit={pay} noValidate>
        <div className="method-list" role="radiogroup" aria-label="Payment method">
          {METHODS.map((m) => <button type="button" key={m.id} role="radio" aria-checked={method === m.id}
            className={`method-btn ${method === m.id ? "active" : ""}`} onClick={() => { setMethod(m.id); setError(""); }}>
            <span className="method-icon">{m.icon}</span><span><b>{m.title}</b><small>{m.sub}</small></span>
          </button>)}
        </div>

        {method === "upi" && <div className="form">
          <label>UPI ID<input value={upiId} onChange={(e) => setUpiId(e.target.value)} placeholder="yourname@okaxis" autoComplete="off" /></label>
          <div className="chip-row">{UPI_SUFFIXES.map((s) => <button type="button" className="chip" key={s} onClick={() => setUpiId(upiId.split("@")[0] + s)}>{s}</button>)}</div>
        </div>}

        {method === "card" && <div className="form">
          <label>Card number <span className="brand-badge">{digits ? brand : ""}</span>
            <input inputMode="numeric" autoComplete="cc-number" placeholder="1234 5678 9012 3456" value={card.number}
              onChange={(e) => setCard({ ...card, number: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim() })} />
          </label>
          <label>Name on card<input autoComplete="cc-name" value={card.name} onChange={(e) => setCard({ ...card, name: e.target.value })} /></label>
          <div className="two-col">
            <label>Expiry<input inputMode="numeric" autoComplete="cc-exp" placeholder="MM/YY" maxLength="5" value={card.expiry}
              onChange={(e) => { const d = e.target.value.replace(/\D/g, "").slice(0, 4); setCard({ ...card, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }); }} /></label>
            <label>CVV<input type="password" inputMode="numeric" autoComplete="cc-csc" placeholder="•••" maxLength="4" value={card.cvv}
              onChange={(e) => setCard({ ...card, cvv: e.target.value.replace(/\D/g, "") })} /></label>
          </div>
        </div>}

        {method === "netbanking" && <div className="form">
          <label>Select your bank
            <select value={bank} onChange={(e) => setBank(e.target.value)}>
              <option value="">Choose a bank</option>
              {BANKS.map((b) => <option key={b}>{b}</option>)}
            </select>
          </label>
        </div>}

        {error && <ErrorMessage>{error}</ErrorMessage>}
        <button className="button pay-button" disabled={paying}>{paying ? "Processing..." : `Pay ₹${booking.total}`}</button>
        <p className="demo-note">🔒 <b>Demo mode</b> – no real money is charged and your card number and CVV are never sent to the server.
          Test card <code>4242 4242 4242 4242</code> (any future expiry, any CVV). Card <code>4000 0000 0000 0002</code> or UPI ID <code>fail@upi</code> simulates a declined payment.</p>
      </form>

      <aside className="panel order-summary" aria-label="Order summary">
        <h2>Order summary</h2>
        <p className="order-title">{booking.movie.title}</p>
        <p>{booking.theatre?.name || "Theatre not selected"}</p>
        <p>{booking.show || "Show not selected"}</p>
        <p>Seats: <b>{booking.seats.join(", ")}</b></p>
        <hr />
        <p className="row"><span>Tickets ({booking.selectedSeatCount})</span><span>₹{booking.ticketCost}</span></p>
        <p className="row"><span>Convenience fee</span><span>₹{booking.convenienceFee}</span></p>
        <p className="row total"><span>Total</span><span>₹{booking.total}</span></p>
        <hr />
        <p className="muted">Booking for {booking.customer.name}<br />{booking.customer.email}</p>
      </aside>
    </div>

    {paying && <div className="pay-overlay" role="status"><div className="spinner" /><p>Processing payment… please don't refresh or close this page.</p></div>}
  </main>;
}
