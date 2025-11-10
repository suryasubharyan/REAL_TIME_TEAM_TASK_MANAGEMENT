import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProjectView from "./pages/ProjectView";
import { SocketProvider } from "./context/SocketContext";
export default function App(){
  return (
    <AuthProvider>
      <BrowserRouter>
      <SocketProvider>
        <Routes>
          <Route path="/" element={<Login/>} />
          <Route path="/register" element={<Register/>} />
          <Route path="/dashboard" element={<Dashboard/>} />
          <Route path="/project/:teamId" element={<ProjectView/>} />
        </Routes>
      </SocketProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
