import React from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        background: "#fff",
        boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      {/* ---------- Left: Logo + App Name ---------- */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div
          style={{
            width: 38,
            height: 38,
            background: "#4F46E5",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 8,
            fontWeight: 700,
          }}
        >
          TT
        </div>
        <Link
          to="/dashboard"
          style={{
            textDecoration: "none",
            color: "#111827",
            fontWeight: 700,
            fontSize: 18,
          }}
        >
          Team Task Manager
        </Link>
      </div>

      {/* ---------- Right: User Info + Logout ---------- */}
      {user ? (
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontWeight: 600,
                color: "#111827",
                textTransform: "capitalize",
              }}
            >
              {user.name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: user.role === "admin" ? "#2563EB" : "#10B981",
                fontWeight: 500,
                textTransform: "capitalize",
              }}
            >
              {user.role}
            </div>
          </div>
          <button
            onClick={logout}
            style={{
              background: "#EF4444",
              color: "#fff",
              border: "none",
              padding: "6px 12px",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 500,
            }}
          >
            Logout
          </button>
        </div>
      ) : (
        <Link
          to="/"
          style={{
            color: "#6B7280",
            textDecoration: "none",
            fontWeight: 500,
          }}
        >
          Login
        </Link>
      )}
    </nav>
  );
}
