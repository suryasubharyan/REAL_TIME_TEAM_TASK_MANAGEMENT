import React from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext";

export default function TaskCard({ task, onUpdated, onDeleted, onEdit }) {
  const { user } = useAuth();

  const isAdmin = user?.role === "admin";
  const isCreator =
    user?._id === task?.createdBy?._id || user?._id === task.createdBy;
  const isAssignee =
    user?._id === task?.assignedTo?._id || user?._id === task.assignedTo;

  const deleteTask = async () => {
    if (!confirm("Delete this task?")) return;
    try {
      await axios.delete(`/task/${task._id}`);
      onDeleted && onDeleted(task._id);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to delete");
    }
  };

  const quickToggleStatus = async () => {
    const next =
      task.status === "todo"
        ? "in-progress"
        : task.status === "in-progress"
        ? "done"
        : "todo";
    try {
      const res = await axios.patch(`/task/${task._id}`, { status: next });
      onUpdated && onUpdated(res.data.data || res.data.task || res.data);
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to update");
    }
  };

  const color =
    task.priority === "high"
      ? "#ef4444"
      : task.priority === "medium"
      ? "#f59e0b"
      : "#10b981";

  return (
    <div
      style={{
        background: "#fff",
        padding: 12,
        borderRadius: 8,
        marginBottom: 8,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ fontWeight: 700 }}>{task.title}</div>
          <div
            style={{
              fontSize: 12,
              padding: "4px 8px",
              borderRadius: 6,
              background: `${color}20`,
              color,
              fontWeight: 600,
            }}
          >
            {task.priority}
          </div>
        </div>
        <div style={{ color: "#6B7280", marginTop: 6 }}>
          {task.description}
        </div>
        <div style={{ marginTop: 8, fontSize: 13, color: "#6B7280" }}>
          Assigned: {task.assignedTo?.name || "Unassigned"} • Created by:{" "}
          {task.createdBy?.name || "Unknown"}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginLeft: 12 }}>
        {/* ✅ Members can only change status if assigned */}
        {isAssignee && (
          <button
            onClick={quickToggleStatus}
            style={{
              padding: "6px 10px",
              borderRadius: 8,
              border: "none",
              background: "#E5E7EB",
            }}
          >
            {task.status}
          </button>
        )}

        {/* ✅ Only Admins can edit/delete */}
        {isAdmin && (
          <>
            <button
              onClick={() => onEdit && onEdit(task)}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                background: "#4F46E5",
                color: "#fff",
                border: "none",
              }}
            >
              Edit
            </button>
            <button
              onClick={deleteTask}
              style={{
                padding: "6px 10px",
                borderRadius: 8,
                background: "#ef4444",
                color: "#fff",
                border: "none",
              }}
            >
              Delete
            </button>
          </>
        )}
      </div>
    </div>
  );
}
