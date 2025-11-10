import React from "react";

export default function ProjectCard({ project, active, onClick }) {
  return (
    <div onClick={() => onClick(project)} style={{
      background: active ? "#EEF2FF" : "#fff",
      padding: 12, borderRadius: 8, cursor: "pointer", marginBottom: 8,
      boxShadow: "0 2px 8px rgba(2,6,23,0.04)"
    }}>
      <div style={{ fontWeight: 700 }}>{project.name}</div>
      <div style={{ fontSize: 13, color: "#6B7280" }}>{project.description}</div>
    </div>
  );
}
