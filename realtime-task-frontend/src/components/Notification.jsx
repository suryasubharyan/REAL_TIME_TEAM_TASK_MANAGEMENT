import React, { useEffect } from "react";

export default function Notification({ message, type = "success", onClose }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => onClose && onClose(), 3000);
    return () => clearTimeout(t);
  }, [message, onClose]);

  if (!message) return null;

  const style = {
    position: "fixed",
    top: 18,
    right: 18,
    padding: "10px 14px",
    borderRadius: 8,
    boxShadow: "0 6px 20px rgba(2,6,23,0.12)",
    zIndex: 9999,
    fontSize: 14,
    color: type === "error" ? "#7f1d1d" : "#065f46",
    background: type === "error" ? "#fee2e2" : "#dcfce7",
  };

  return <div style={style}>{message}</div>;
}
