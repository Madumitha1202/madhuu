import { configureStore, createSlice } from "@reduxjs/toolkit";

const bookingSlice = createSlice({
  name: "booking",
  initialState: {
    movie: null,
    theatre: null,
    show: "",
    seats: [],
    customer: { name: "", email: "", phone: "" }
  },
  reducers: {
    selectMovie: (state, action) => { state.movie = action.payload; },
    selectTheatre: (state, action) => { state.theatre = action.payload; },
    selectShow: (state, action) => { state.show = action.payload; },
    toggleSeat: (state, action) => {
      const seat = action.payload;
      state.seats = state.seats.includes(seat)
        ? state.seats.filter((item) => item !== seat)
        : [...state.seats, seat];
    },
    removeSeat: (state, action) => {
      state.seats = state.seats.filter((seat) => seat !== action.payload);
    },
    setCustomer: (state, action) => { state.customer = { ...state.customer, ...action.payload }; },
    clearBooking: (state) => {
      state.movie = null;
      state.theatre = null;
      state.show = "";
      state.seats = [];
      state.customer = { name: "", email: "", phone: "" };
    },
    restoreBooking: (_state, action) => action.payload
  }
});

export const {
  selectMovie, selectTheatre, selectShow, toggleSeat, removeSeat,
  setCustomer, clearBooking, restoreBooking
} = bookingSlice.actions;

export const store = configureStore({
  reducer: { booking: bookingSlice.reducer }
});

store.subscribe(() => {
  localStorage.setItem("cinebook_booking", JSON.stringify(store.getState().booking));
});