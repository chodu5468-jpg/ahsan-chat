import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { connectSocket, disconnectSocket } from "../api/socket.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("ahsan_token"));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem("ahsan_user");
    return raw ? JSON.parse(raw) : null;
  });

  useEffect(() => {
    if (token) {
      connectSocket(token);
    } else {
      disconnectSocket();
    }
    return () => disconnectSocket();
  }, [token]);

  const login = useCallback((newToken, newUser) => {
    localStorage.setItem("ahsan_token", newToken);
    localStorage.setItem("ahsan_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("ahsan_token");
    localStorage.removeItem("ahsan_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
