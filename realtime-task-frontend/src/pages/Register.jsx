import React, { useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";

export default function Register(){
  const [name,setName]=useState("");
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [role,setRole]=useState("member");
  const [err,setErr]=useState("");
  const navigate=useNavigate();

  const handle = async (e) => {
    e.preventDefault();
    setErr("");
    try {
      await axios.post("/auth/register", { name, email, password, role });
      navigate("/");
    } catch (err) {
      setErr(err?.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "#F3F4F6" }}>
      <form onSubmit={handle} style={{ width: 420, padding: 22, borderRadius: 10, background: "#fff", boxShadow: "0 8px 30px rgba(2,6,23,0.08)" }}>
        <h2 style={{ marginTop: 0 }}>Create account</h2>
        {err && <div style={{ color: "#b91c1c", marginBottom: 8 }}>{err}</div>}
        <input placeholder="Full name" value={name} onChange={e=>setName(e.target.value)} style={{ width:"100%", padding:10, marginBottom:8, borderRadius:8, border:"1px solid #E5E7EB" }}/>
        <input placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} style={{ width:"100%", padding:10, marginBottom:8, borderRadius:8, border:"1px solid #E5E7EB" }}/>
        <input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} style={{ width:"100%", padding:10, marginBottom:8, borderRadius:8, border:"1px solid #E5E7EB" }}/>
        <div style={{ display: "flex", gap: 12, marginBottom: 12 }}>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="radio" checked={role==="admin"} onChange={()=>setRole("admin")} /> Admin
          </label>
          <label style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <input type="radio" checked={role==="member"} onChange={()=>setRole("member")} /> Member
          </label>
        </div>
        <button type="submit" style={{ width:"100%", padding:10, borderRadius:8, border:"none", background:"#10B981", color:"#fff" }}>Create account</button>
      </form>
    </div>
  );
}
