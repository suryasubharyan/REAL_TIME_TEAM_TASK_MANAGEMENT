import React, { createContext, useState, useContext, useEffect } from "react";
import { initSocket } from "../utils/socket";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // ✅ Safely parse user JSON (avoids “undefined is not valid JSON”)
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem("user");
      return raw && raw !== "undefined" ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  // ✅ Token initialization with sanity check
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem("token");
    return t && t !== "undefined" ? t : null;
  });

  // ✅ Sync state and initialize socket only when both exist
  useEffect(() => {
    if (user && token) {
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      try {
        initSocket(token);
        console.log("⚡ Socket initialized for:", user.email);
      } catch (err) {
        console.error("❌ Socket init failed:", err.message);
      }
    }
  }, [user, token]);

  // ✅ Logout function
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
