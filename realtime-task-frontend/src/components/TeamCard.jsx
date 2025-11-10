import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function TeamCard({ team }) {
  const navigate = useNavigate();
  const [showMembers, setShowMembers] = useState(false);

  return (
    <div
      style={{
        background: "#fff",
        padding: 16,
        borderRadius: 10,
        boxShadow: "0 6px 18px rgba(2,6,23,0.06)",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        transition: "all 0.3s ease",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <h3 style={{ margin: 0 }}>{team.name}</h3>
          <div style={{ color: "#6B7280", marginTop: 6 }}>
            {team.description || "No description"}
          </div>
        </div>
      </div>

      {/* Team info row */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginTop: 8,
        }}
      >
        <div style={{ fontSize: 13, color: "#9CA3AF" }}>
          Code:{" "}
          <b style={{ color: "#374151" }}>
            {team.code || "N/A"}
          </b>{" "}
          •{" "}
          <span
            style={{ color: "#2563EB", cursor: "pointer", fontWeight: 500 }}
            onClick={() => setShowMembers((prev) => !prev)}
          >
            Members: {team.members?.length || 0}
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() =>
              navigate(`/project/${team._id}`, { state: { team } })
            }
            style={{
              background: "#4F46E5",
              color: "#fff",
              border: "none",
              padding: "6px 10px",
              borderRadius: 8,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            View Projects →
          </button>
        </div>
      </div>

      {/* Expandable Members Section */}
      <div
        style={{
          marginTop: showMembers ? 10 : 0,
          maxHeight: showMembers ? "200px" : "0px",
          overflow: "hidden",
          transition: "all 0.4s ease",
          borderTop: showMembers ? "1px solid #E5E7EB" : "none",
          paddingTop: showMembers ? 10 : 0,
        }}
      >
        {team.members?.length ? (
          <div>
            {team.members.map((m) => (
              <div
                key={m.user?._id || m._id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "6px 8px",
                  borderRadius: 6,
                  marginBottom: 6,
                  background:
                    m.role === "admin"
                      ? "rgba(37,99,235,0.1)"
                      : "rgba(16,185,129,0.08)",
                }}
              >
                <div>
                  <div style={{ fontWeight: 600 }}>
                    {m.user?.name || "Unnamed User"}
                  </div>
                  <div style={{ fontSize: 13, color: "#6B7280" }}>
                    {m.user?.email || "No email"}
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 12,
                    fontWeight: 600,
                    textTransform: "capitalize",
                    color:
                      m.role === "admin" ? "#1E3A8A" : "#065F46",
                    background:
                      m.role === "admin"
                        ? "#DBEAFE"
                        : "#D1FAE5",
                    padding: "3px 8px",
                    borderRadius: 6,
                  }}
                >
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ fontSize: 13, color: "#9CA3AF" }}>
            No members found.
          </div>
        )}
      </div>
    </div>
  );
}
