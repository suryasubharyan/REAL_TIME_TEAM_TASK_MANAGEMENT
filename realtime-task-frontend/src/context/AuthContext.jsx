import React, { createContext, useState, useContext, useEffect } from "react";
import { initSocket } from "../utils/socket"; // ✅ Import socket init

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user") || "null")
  );

  useEffect(() => {
    // keep localStorage & state in sync
    if (user) {
      localStorage.setItem("user", JSON.stringify(user));

      // ✅ Initialize socket when user logs in
      const token = localStorage.getItem("token");
      if (token) {
        initSocket(token);
        console.log("⚡ Socket initialized for:", user.email);
      }
    }
  }, [user]);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
