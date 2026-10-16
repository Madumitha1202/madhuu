import { NavLink, Outlet, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { user, logout } = useAuth();
  return <>
    <header className="header">
      <Link className="brand" to="/">🎬 CineBook</Link>
      {user && <nav aria-label="Main navigation">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/movies">Movies</NavLink>
        <NavLink to="/theatres">Theatres</NavLink>
        <NavLink to="/bookings">My Bookings</NavLink>
        <button className="nav-button" onClick={logout}>Logout ({user.username})</button>
      </nav>}
    </header>
    <Outlet />
    <footer className="footer">CineBook · React Hooks · REST API · Redux Toolkit · Router</footer>
  </>;
}