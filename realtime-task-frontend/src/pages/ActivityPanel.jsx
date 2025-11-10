import React, { useState, useEffect } from "react";
import { socket } from "../utils/socket";

export default function ActivityPanel() {
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    socket.on("activity_created", ({ activity }) => {
      setActivities((prev) => [activity, ...prev]);
    });

    return () => socket.off("activity_created");
  }, []);

  return (
    <div
      style={{
        background: "#fff",
        borderRadius: 12,
        padding: 16,
        width: 300,
        height: 400,
        overflowY: "auto",
      }}
    >
      <h3 style={{ marginBottom: 10 }}>Activity Log</h3>
      {activities.map((a, i) => (
        <div key={i} style={{ marginBottom: 12 }}>
          <b>{a.message}</b>
          <div style={{ fontSize: 12, color: "#6B7280" }}>
            {new Date(a.createdAt).toLocaleTimeString()}
          </div>
        </div>
      ))}
    </div>
  );
}
