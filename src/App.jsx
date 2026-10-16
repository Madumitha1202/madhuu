import { lazy, Suspense } from "react";
import { Navigate, Route, Routes, Outlet, useLocation } from "react-router-dom";
import Layout from "./components/Layout";
import { useAuth } from "./context/AuthContext";
import { Loading } from "./components/UI";

const Home = lazy(() => import("./pages/Home"));
const Movies = lazy(() => import("./pages/Movies"));
const MovieDetail = lazy(() => import("./pages/MovieDetail"));
const Theatres = lazy(() => import("./pages/Theatres"));
const SeatSelection = lazy(() => import("./pages/SeatSelection"));
const BookingSummary = lazy(() => import("./pages/BookingSummary"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Payment = lazy(() => import("./pages/Payment"));
const Bookings = lazy(() => import("./pages/Bookings"));
const Login = lazy(() => import("./pages/Login"));
const Confirmation = lazy(() => import("./pages/Confirmation"));
const NotFound = lazy(() => import("./pages/NotFound"));

function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return <Outlet />;
}

function BookingLayout() {
  return <section className="page"><Outlet /></section>;
}

export default function App() {
  return <Suspense fallback={<Loading text="Loading page..." />}>
    <Routes>
      <Route element={<Layout />}>
        <Route path="login" element={<Login />} />
        <Route element={<ProtectedRoute />}>
          <Route index element={<Home />} />
          <Route path="movies" element={<Movies />} />
          <Route path="movie/:id" element={<MovieDetail />} />
          <Route path="theatres" element={<Theatres />} />
          <Route path="booking" element={<BookingLayout />}>
            <Route index element={<Navigate to="seats" replace />} />
            <Route path="seats" element={<SeatSelection />} />
            <Route path="summary" element={<BookingSummary />} />
          </Route>
          <Route path="checkout" element={<Checkout />} />
          <Route path="payment" element={<Payment />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="confirmation/:id" element={<Confirmation />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  </Suspense>;
}