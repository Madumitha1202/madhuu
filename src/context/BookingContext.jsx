import { createContext, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { clearBooking, removeSeat, selectMovie, selectShow, selectTheatre, setCustomer, toggleSeat } from "../store";

const BookingContext = createContext(null);

export function BookingProvider({ children }) {
  const dispatch = useDispatch();
  const booking = useSelector((state) => state.booking);

  useEffect(() => {
    console.info("[BOOKING STATE]", booking);
  }, [booking]);

  const value = {
    ...booking,
    selectedSeatCount: booking.seats.length,
    ticketCost: booking.seats.length * (booking.movie?.price || 0),
    convenienceFee: booking.seats.length ? 30 : 0,
    total: booking.seats.length * (booking.movie?.price || 0) + (booking.seats.length ? 30 : 0),
    selectMovie: (movie) => dispatch(selectMovie(movie)),
    selectTheatre: (theatre) => dispatch(selectTheatre(theatre)),
    selectShow: (show) => dispatch(selectShow(show)),
    selectSeat: (seat) => { console.info("[SEAT] select/toggle", seat); dispatch(toggleSeat(seat)); },
    removeSeat: (seat) => { console.info("[SEAT] remove", seat); dispatch(removeSeat(seat)); },
    setCustomer: (customer) => dispatch(setCustomer(customer)),
    clearBooking: () => dispatch(clearBooking())
  };
  return <BookingContext.Provider value={value}>{children}</BookingContext.Provider>;
}

export function useBooking() {
  const context = useContext(BookingContext);
  if (!context) throw new Error("useBooking must be used inside BookingProvider");
  return context;
}