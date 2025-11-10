import React, { useEffect, useState } from "react";
import axios from "../api/axios";
import { useAuth } from "../context/AuthContext"; // ✅ Added

export default function CreateTaskModal({
  teamId,
  projectId,
  onClose,
  onCreated,
  editTask = null,
}) {
  const { user } = useAuth(); // ✅
  const [title, setTitle] = useState(editTask?.title || "");
  const [description, setDescription] = useState(editTask?.description || "");
  const [priority, setPriority] = useState(editTask?.priority || "medium");
  const [assignedTo, setAssignedTo] = useState(
    editTask?.assignedTo?._id || editTask?.assignedTo || ""
  );
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const isEdit = !!editTask;

  useEffect(() => {
    if (teamId) fetchTeamMembers();
  }, [teamId]);

  const fetchTeamMembers = async () => {
    try {
      const res = await axios.get(`/team/${teamId}`);
      const members =
        res.data?.team?.members ||
        res.data?.data?.members ||
        res.data?.members ||
        [];
      setTeamMembers(members);
    } catch (err) {
      console.error("❌ Failed to fetch members:", err);
      setTeamMembers([]);
    }
  };

  const submitTask = async () => {
    if (!title.trim()) return alert("Title is required!");
    if (!projectId) return alert("Please select a project!");

    setLoading(true);
    try {
      const normalizedPriority = (priority || "medium").toLowerCase();
      let res;

      if (isEdit && editTask?._id) {
        res = await axios.patch(`/task/${editTask._id}`, {
          title,
          description,
          priority: normalizedPriority,
          assignedTo: assignedTo || editTask?.assignedTo?._id || null,
        });
      } else {
        res = await axios.post("/task", {
          projectId,
          title,
          description,
          priority: normalizedPriority,
          assignedTo: assignedTo || null,
        });
      }

      const task = res.data?.data || res.data?.task || res.data;
      onCreated && onCreated(task);
      onClose();
    } catch (err) {
      console.error("❌ Task API error:", err.response?.data || err.message);
      alert(err?.response?.data?.message || "Failed to save task");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 10,
          width: 600,
          boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0 }}>{isEdit ? "Edit Task" : "Create Task"}</h3>

        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={inputStyle}
        />

        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={4}
          style={{ ...inputStyle, resize: "none" }}
        />

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: 12,
            gap: 16,
          }}
        >
          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              style={selectStyle}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={labelStyle}>Assign To</label>
            <select
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              disabled={user?.role !== "admin"} // ✅ members cannot assign
              style={selectStyle}
            >
              <option value="">-- Select Member --</option>
              {teamMembers.map((m) => (
                <option key={m.user?._id} value={m.user?._id}>
                  {m.user?.name} ({m.role})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            marginTop: 20,
            gap: 10,
          }}
        >
          <button onClick={onClose} style={cancelBtn}>
            Cancel
          </button>
          <button
            onClick={submitTask}
            disabled={loading || user?.role !== "admin"}
            style={{
              ...primaryBtn,
              opacity: user?.role !== "admin" ? 0.6 : 1,
              cursor: user?.role !== "admin" ? "not-allowed" : "pointer",
            }}
          >
            {loading
              ? isEdit
                ? "Saving..."
                : "Creating..."
              : isEdit
              ? "Save Changes"
              : "Create Task"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* 🎨 Styles */
const inputStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #E5E7EB",
  marginBottom: 12,
  fontSize: 14,
};
const selectStyle = {
  width: "100%",
  padding: 10,
  borderRadius: 8,
  border: "1px solid #E5E7EB",
  fontSize: 14,
};
const labelStyle = {
  display: "block",
  fontSize: 13,
  color: "#374151",
  marginBottom: 6,
  fontWeight: 500,
};
const cancelBtn = {
  padding: "8px 14px",
  borderRadius: 8,
  background: "#E5E7EB",
  border: "none",
  cursor: "pointer",
};
const primaryBtn = {
  padding: "8px 14px",
  borderRadius: 8,
  background: "#4F46E5",
  color: "#fff",
  border: "none",
  cursor: "pointer",
};
