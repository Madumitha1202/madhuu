import { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getApiErrorMessage } from "../api/client";
import { ErrorMessage } from "../components/UI";

export default function Login() {
  const { user, login, register } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  // First-time visitors land on "Create account"; returning ones on "Sign in".
  const [mode, setMode] = useState(() => (localStorage.getItem("cinebook_has_account") ? "login" : "register"));
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const isRegister = mode === "register";
  const destination = location.state?.from || "/";

  if (user) return <Navigate to={destination} replace />;

  function switchMode(next) { setMode(next); setError(""); setPassword(""); setConfirm(""); }

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password) { setError("Please fill in both username and password."); return; }
    if (username.trim().length < 3) { setError("Username must contain at least 3 characters."); return; }
    if (isRegister && password.length < 8) { setError("Password must be at least 8 characters."); return; }
    if (isRegister && password !== confirm) { setError("Passwords do not match."); return; }
    setBusy(true);
    try {
      if (isRegister) await register(username, password);
      else await login(username, password);
      navigate(destination, { replace: true });
    } catch (err) {
      const message = getApiErrorMessage(err, isRegister ? "Could not create your account." : "Login failed. Check your username and password.");
      setError(message);
      console.warn("[AUTH] Sign-in/register failed:", message);
    } finally {
      setBusy(false);
    }
  }

  return <main className="page login-wrap">
    <form className="panel form auth-card" onSubmit={submit}>
      <div className="auth-icon">🎟️</div>
      <p className="eyebrow">{isRegister ? "WELCOME TO CINEBOOK" : "WELCOME BACK"}</p>
      <h1 className="gradient-text">{isRegister ? "Create your account" : "Sign in"}</h1>
      <p className="lead">{isRegister ? "Create an account to book tickets, pay securely and track your bookings." : "Sign in to continue booking your tickets."}</p>
      <div className="auth-switch">
        <button type="button" className={!isRegister ? "active" : ""} onClick={() => switchMode("login")}>Sign in</button>
        <button type="button" className={isRegister ? "active" : ""} onClick={() => switchMode("register")}>Create account</button>
      </div>
      <label>Username
        <input autoComplete="username" minLength="3" maxLength="30" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Choose a username" required />
      </label>
      <label>Password
        <input type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"} minLength={isRegister ? 8 : 1} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isRegister ? "At least 8 characters" : "Enter your password"} required />
      </label>
      {isRegister && <label>Confirm password
        <input type={showPassword ? "text" : "password"} autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Re-enter your password" required />
      </label>}
      <label className="check-row"><input type="checkbox" checked={showPassword} onChange={(e) => setShowPassword(e.target.checked)} /> Show password</label>
      {error && <ErrorMessage>{error}</ErrorMessage>}
      <button className="button auth-submit" disabled={busy}>{busy ? "Please wait..." : isRegister ? "Create account →" : "Sign in →"}</button>
      <small>{isRegister ? "Already have an account?" : "New to CineBook?"}{" "}
        <button type="button" className="link-button" onClick={() => switchMode(isRegister ? "login" : "register")}>{isRegister ? "Sign in" : "Create one"}</button>
      </small>
    </form>
  </main>;
}
