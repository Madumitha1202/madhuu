import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      // A saved user without a token is not really signed in.
      if (!localStorage.getItem("cinebook_token")) return null;
      return JSON.parse(localStorage.getItem("cinebook_user")) || null;
    } catch { return null; }
  });

  useEffect(() => {
    if (user) localStorage.setItem("cinebook_user", JSON.stringify(user));
    else localStorage.removeItem("cinebook_user");
  }, [user]);

  // The API client fires this when the token is rejected (expired / invalid).
  useEffect(() => {
    const onUnauthorized = () => setUser(null);
    window.addEventListener("cinebook:unauthorized", onUnauthorized);
    return () => window.removeEventListener("cinebook:unauthorized", onUnauthorized);
  }, []);

  function startSession({ token, user: account }) {
    localStorage.setItem("cinebook_token", token);
    localStorage.setItem("cinebook_has_account", "1");
    setUser(account);
    return account;
  }

  async function register(username, password) {
    const response = await api.post("/auth/register", { username: username.trim(), password });
    console.info("[AUTH] Account created and signed in:", response.data.user.username);
    return startSession(response.data);
  }

  async function login(username, password) {
    const response = await api.post("/auth/login", { username: username.trim(), password });
    console.info("[AUTH] Sign-in successful:", response.data.user.username);
    return startSession(response.data);
  }

  function logout() {
    setUser(null);
    localStorage.removeItem("cinebook_token");
    console.info("[AUTH] Signed out; token removed");
  }

  return <AuthContext.Provider value={{ user, login, register, logout }}>
    {children}
  </AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider");
  return context;
}
