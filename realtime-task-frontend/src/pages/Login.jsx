import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Login(){
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setErr(""); setLoading(true);
    try {
      const { data } = await axios.post("/auth/login", { email, password });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);
      navigate("/dashboard");
    } catch (err) {
      setErr(err?.response?.data?.message || "Login failed");
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#F3F4F6" }}>
      <form onSubmit={handle} style={{ width: 360, padding: 24, borderRadius: 10, background: "#fff", boxShadow: "0 8px 30px rgba(2,6,23,0.08)" }}>
        <h2 style={{ margin: 0, marginBottom: 12 }}>Sign in</h2>
        {err && <div style={{ color: "#b91c1c", marginBottom: 8 }}>{err}</div>}
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{ width: "100%", padding: 10, marginBottom: 10, borderRadius: 8, border: "1px solid #E5E7EB" }} />
        <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" style={{ width: "100%", padding: 10, marginBottom: 14, borderRadius: 8, border: "1px solid #E5E7EB" }} />
        <button type="submit" disabled={loading} style={{ width: "100%", padding: 10, borderRadius: 8, border: "none", background: "#4F46E5", color: "#fff" }}>{loading ? "Signing in..." : "Sign in"}</button>
        <div style={{ marginTop: 12, textAlign: "center" }}>
          <Link to="/register" style={{ color: "#4F46E5" }}>Create an account</Link>
        </div>
      </form>
    </div>
  );
}
