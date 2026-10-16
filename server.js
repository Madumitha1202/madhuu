import jsonServer from "json-server";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "node:crypto";
import fs from "node:fs";

const PORT = Number(process.env.PORT) || 3001;
const USERS_FILE = "users.json";
const CONVENIENCE_FEE = 30;
const PAYMENT_TTL_MS = 15 * 60 * 1000;
const PAYMENT_METHODS = ["upi", "card", "netbanking"];

const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const JWT_SECRET = process.env.JWT_SECRET || "local-development-secret-change-before-deploy";

/* ---------- Accounts (saved to users.json so they survive restarts) ---------- */
function loadUsers() {
  try {
    const list = JSON.parse(fs.readFileSync(USERS_FILE, "utf8"));
    return new Map(list.map((u) => [u.username.toLowerCase(), u]));
  } catch {
    return new Map();
  }
}
function saveUsers() {
  fs.writeFileSync(USERS_FILE, JSON.stringify([...users.values()], null, 2));
}
const users = loadUsers();

/* ---------- Demo payments (in memory; no real money moves) ---------- */
const payments = new Map();

function makeToken(user) {
  return jwt.sign({ sub: user.id, username: user.username }, JWT_SECRET, { expiresIn: "2h" });
}

function priceFor(movieId, seatCount) {
  const movie = router.db.get("movies").find((m) => String(m.id) === String(movieId)).value();
  if (!movie) return null;
  return { movie, total: movie.price * seatCount + (seatCount ? CONVENIENCE_FEE : 0) };
}

function validSeats(seats) {
  return Array.isArray(seats) && seats.length >= 1 && seats.length <= 10 &&
    new Set(seats).size === seats.length && seats.every((s) => /^[A-D][1-6]$/.test(String(s)));
}

server.use(middlewares);
server.use(jsonServer.bodyParser);

/* ---------- Auth ---------- */
server.post("/auth/register", async (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");
  if (username.length < 3 || username.length > 30) {
    return res.status(400).json({ message: "Username must be 3–30 characters." });
  }
  if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
    return res.status(400).json({ message: "Username can use letters, numbers, dot, underscore and hyphen." });
  }
  if (password.length < 8) {
    return res.status(400).json({ message: "Password must be at least 8 characters." });
  }
  const key = username.toLowerCase();
  if (users.has(key)) return res.status(409).json({ message: "That username already exists. Please choose another." });
  const user = { id: crypto.randomUUID(), username, passwordHash: await bcrypt.hash(password, 12) };
  users.set(key, user);
  saveUsers();
  console.log(`[AUTH] New account registered: ${username}`);
  return res.status(201).json({ token: makeToken(user), user: { id: user.id, username: user.username } });
});

server.post("/auth/login", async (req, res) => {
  const username = String(req.body?.username || "").trim();
  const password = String(req.body?.password || "");
  const user = users.get(username.toLowerCase());
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    console.warn(`[AUTH] Failed login attempt for username: ${username || "(empty)"}`);
    return res.status(401).json({ message: "Invalid username or password." });
  }
  console.log(`[AUTH] Login successful: ${user.username}`);
  return res.json({ token: makeToken(user), user: { id: user.id, username: user.username } });
});

/* ---------- JWT check for /bookings and /payments ---------- */
server.use((req, res, next) => {
  const protectedPath = req.path.startsWith("/bookings") || req.path.startsWith("/payments");
  if (!protectedPath) return next();
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  if (!token) {
    console.warn("[API AUTH] Blocked request without token:", req.method, req.path);
    return res.status(401).json({ message: "Please sign in to continue." });
  }
  try {
    req.authUser = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    console.warn("[API AUTH] Blocked request with invalid/expired token:", req.method, req.path);
    return res.status(401).json({ message: "Your session expired. Please sign in again." });
  }
});

/* ---------- Payment (demo gateway) ---------- */
server.post("/payments/pay", async (req, res) => {
  const { movieId, seats, method, detail = {} } = req.body || {};
  if (!PAYMENT_METHODS.includes(method)) return res.status(400).json({ message: "Choose a valid payment method." });
  if (!validSeats(seats)) return res.status(400).json({ message: "Invalid seat selection." });
  const priced = priceFor(movieId, seats.length);
  if (!priced) return res.status(400).json({ message: "Movie not found." });

  let label;
  if (method === "upi") {
    const upiId = String(detail.upiId || "").trim();
    if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upiId)) return res.status(400).json({ message: "Enter a valid UPI ID, e.g. name@okbank." });
    if (upiId.toLowerCase().startsWith("fail")) return res.status(402).json({ message: "UPI payment was declined by the bank. Try another UPI ID." });
    label = `UPI · ${upiId}`;
  } else if (method === "card") {
    const last4 = String(detail.last4 || "");
    if (!/^\d{4}$/.test(last4)) return res.status(400).json({ message: "Invalid card details." });
    if (last4 === "0002") return res.status(402).json({ message: "Your card was declined. Try a different card." });
    label = `${String(detail.brand || "Card").slice(0, 12)} card ending ${last4}`;
  } else {
    const bank = String(detail.bank || "").trim().slice(0, 40);
    if (!bank) return res.status(400).json({ message: "Select your bank." });
    label = `Net Banking · ${bank}`;
  }

  await new Promise((resolve) => setTimeout(resolve, 1500)); // pretend the bank is thinking
  const paymentId = `PAY-${crypto.randomBytes(5).toString("hex").toUpperCase()}`;
  const record = { paymentId, userId: req.authUser.sub, movieId: String(movieId), amount: priced.total, method, label, used: false, paidAt: new Date().toISOString() };
  payments.set(paymentId, record);
  console.log(`[PAYMENT] ${paymentId} ₹${record.amount} via ${label} (${req.authUser.username})`);
  return res.status(201).json({ paymentId, amount: record.amount, method: label, status: "Paid", paidAt: record.paidAt });
});

/* ---------- Bookings: ownership, validation, payment check ---------- */
server.use((req, res, next) => {
  if (!req.path.startsWith("/bookings")) return next();
  const { sub, username } = req.authUser;
  const idMatch = req.path.match(/^\/bookings\/([^/]+)\/?$/);

  if (req.method === "GET" && !idMatch) {
    req.query.userId = sub; // each user sees only their own bookings
    return next();
  }

  if (idMatch) {
    const existing = router.db.get("bookings").find((b) => String(b.id) === idMatch[1]).value();
    if (existing && existing.userId !== sub) return res.status(403).json({ message: "That booking belongs to another account." });
    if (req.method === "PATCH") {
      if (req.body?.status !== "Cancelled") return res.status(400).json({ message: "Only cancelling a booking is allowed." });
      req.body = { status: "Cancelled", payment: existing?.payment ? { ...existing.payment, status: "Refund initiated" } : undefined };
    } else if (req.method === "PUT") {
      return res.status(405).json({ message: "Use PATCH to cancel a booking." });
    }
    return next();
  }

  if (req.method === "POST") {
    const { movieId, seats, paymentId, customer = {}, theatre, show } = req.body || {};
    if (!validSeats(seats)) return res.status(400).json({ message: "Invalid seat selection." });
    const priced = priceFor(movieId, seats.length);
    if (!priced) return res.status(400).json({ message: "Movie not found." });
    const name = String(customer.name || "").trim();
    const email = String(customer.email || "").trim();
    const phone = String(customer.phone || "").trim();
    if (!name || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !/^\d{10}$/.test(phone)) {
      return res.status(400).json({ message: "Enter your name, a valid email and a 10-digit phone number." });
    }
    const payment = payments.get(String(paymentId || ""));
    if (!payment || payment.userId !== sub) return res.status(402).json({ message: "Payment not found. Please complete payment first." });
    if (payment.used) return res.status(409).json({ message: "This payment was already used for a booking." });
    if (Date.now() - new Date(payment.paidAt).getTime() > PAYMENT_TTL_MS) return res.status(402).json({ message: "Payment session expired. Please pay again." });
    if (payment.amount !== priced.total || payment.movieId !== String(priced.movie.id)) {
      return res.status(402).json({ message: "Payment amount does not match this booking." });
    }
    payment.used = true;
    req.body = {
      movieId: priced.movie.id,
      movieTitle: priced.movie.title,
      theatre: String(theatre || "Not selected").slice(0, 80),
      show: String(show || "Not selected").slice(0, 40),
      seats,
      customer: { name: name.slice(0, 80), email: email.slice(0, 120), phone },
      total: priced.total,
      status: "Confirmed",
      payment: { id: payment.paymentId, method: payment.label, amount: payment.amount, status: "Paid", paidAt: payment.paidAt },
      username,
      userId: sub,
      createdAt: new Date().toISOString()
    };
  }
  return next();
});

server.use(router);
server.listen(PORT, () => {
  console.log(`CineBook REST API running at http://localhost:${PORT}`);
  console.log("Movies: GET /movies | Theatres: GET /theatres");
  console.log("Auth: POST /auth/register | POST /auth/login  (accounts saved in users.json)");
  console.log("Payments: POST /payments/pay (demo) | Bookings: JWT-protected /bookings endpoints");
});
