import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  timeout: 15000
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("cinebook_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  console.info(`[API REQUEST] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.info(`[API RESPONSE] ${response.status}`, response.config.url);
    return response;
  },
  (error) => {
    console.error("[API ERROR]", error.response?.status || "", error.message, error.config?.url);
    const isAuthCall = error.config?.url?.startsWith("/auth");
    if (error.response?.status === 401 && !isAuthCall) {
      console.warn("[API AUTH] Session expired - signing out");
      localStorage.removeItem("cinebook_token");
      window.dispatchEvent(new Event("cinebook:unauthorized"));
    }
    return Promise.reject(error);
  }
);

// Gives the user the REAL reason a request failed instead of one generic message.
export function getApiErrorMessage(error, fallback = "Something went wrong. Please try again.") {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.code === "ECONNABORTED") return "The server took too long to respond. Please try again.";
  if (!error?.response) return "Cannot reach the API server. Start it with `npm run api` (port 3001), or use `npm start` to run everything together.";
  return fallback;
}

export const getMovies = async () => (await api.get("/movies")).data;
export const getMovie = async (id) => (await api.get(`/movies/${id}`)).data;
export const getTheatres = async () => (await api.get("/theatres")).data;
export const getBookings = async () => (await api.get("/bookings")).data;
export const getBooking = async (id) => (await api.get(`/bookings/${id}`)).data;
export const createPayment = async (payment) => (await api.post("/payments/pay", payment)).data;
export const createBooking = async (booking) => (await api.post("/bookings", booking)).data;
export const updateBooking = async (id, updates) => (await api.patch(`/bookings/${id}`, updates)).data;
export const deleteBooking = async (id) => (await api.delete(`/bookings/${id}`)).data;
