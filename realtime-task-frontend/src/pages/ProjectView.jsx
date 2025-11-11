import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "../api/axios";
import ProjectCard from "../components/ProjectCard";
import TaskCard from "../components/TaskCard";
import Notification from "../components/Notification";
import CreateTaskModal from "../components/CreateTaskModal";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { useTeamSocket } from "../hooks/useTeamSocket";

export default function ProjectView() {
  const { teamId } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const socket = useSocket();

  const stateTeam = location.state?.team;
  const [team, setTeam] = useState(stateTeam || null);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notif, setNotif] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  // ✅ Socket connection and join room
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      setSocketConnected(true);
      socket.emit("joinTeams", [teamId]);
      console.log("🟢 Joined team room:", teamId);
    };
    const handleDisconnect = () => setSocketConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
    };
  }, [socket, teamId]);

  // ✅ Real-time updates
  useTeamSocket(teamId, {
    task_created: (d) => {
      if (d?.task?.project === activeProject?._id)
        setTasks((prev) => [d.task, ...prev]);
    },
    task_updated: (d) => {
      if (d?.task?.project === activeProject?._id)
        setTasks((prev) => prev.map((t) => (t._id === d.task._id ? d.task : t)));
    },
    task_deleted: (d) =>
      setTasks((prev) => prev.filter((t) => t._id !== d.taskId)),
  });

  // ✅ Fetch team + projects
  useEffect(() => {
    (async () => {
      try {
        if (!team) {
          const res = await axios.get("/team/my");
          const found = res.data.teams?.find((t) => t._id === teamId);
          if (found) setTeam(found);
        }
        const res2 = await axios.get(`/project/team/${teamId}`);
        const list = res2.data.projects || [];
        setProjects(list);
        if (list.length) {
          const saved = localStorage.getItem("lastProjectId");
          const sel = list.find((p) => p._id === saved) || list[0];
          setActiveProject(sel);
        }
      } catch (err) {
        console.error("❌ Project fetch failed:", err);
      }
    })();
  }, [teamId]);

  // ✅ Fetch tasks + activities
  useEffect(() => {
    (async () => {
      if (!activeProject) return;
      try {
        localStorage.setItem("lastProjectId", activeProject._id);
        const t = await axios.get(`/task/project/${activeProject._id}`);
        setTasks(t.data.tasks || []);
        const a = await axios.get(`/activity/project/${activeProject._id}`);
        setActivities(a.data.activities || []);
      } catch (err) {
        console.error("❌ Task or Activity fetch failed:", err);
      }
    })();
  }, [activeProject]);

  // ✅ Helpers
  const showNotif = (message, type = "info") => {
    setNotif({ message, type });
    setTimeout(() => setNotif(null), 3000);
  };

  const onProjectCreated = (proj) => {
    setProjects((prev) => [proj, ...prev]);
    setActiveProject(proj);
    showNotif("✅ Project created successfully", "success");
    socket?.emit("project:created", proj);
  };

  const onTaskCreated = (task) => {
    setTasks((prev) => [task, ...prev]);
    showNotif("✅ Task saved successfully!", "success");
  };

  // ✅ UI
  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <Navbar />
      <div style={{ display: "flex", gap: 20, padding: 24 }}>
        {/* LEFT: PROJECT LIST */}
        <div style={{ width: 260 }}>
          <div style={{ marginBottom: 10 }}>
            <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: 6 }}>
              Projects
              <div
                title={socketConnected ? "Socket Connected" : "Disconnected"}
                style={{
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: socketConnected ? "#10B981" : "#EF4444",
                  boxShadow: socketConnected
                    ? "0 0 6px #10B981"
                    : "0 0 6px #EF4444",
                }}
              />
            </h3>
            <small style={{ color: "#6B7280" }}>{team?.name}</small>
          </div>

          {projects.map((p) => (
            <ProjectCard
              key={p._id}
              project={p}
              active={activeProject?._id === p._id}
              onClick={(pr) => setActiveProject(pr)}
            />
          ))}

          {user?.role === "admin" && (
            <CreateProject teamId={teamId} onCreated={onProjectCreated} />
          )}
        </div>

        {/* MIDDLE: TASKS */}
        <div style={{ flex: 1 }}>
          <h3>Tasks for {activeProject?.name || "—"}</h3>
          {user?.role === "admin" && (
            <button
              onClick={() => {
                setEditTask(null);
                setShowTaskModal(true);
              }}
              style={btnGreen}
            >
              + Add Task
            </button>
          )}
          <div style={{ marginTop: 12 }}>
            {tasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
            {tasks.length === 0 && (
              <div style={{ marginTop: 16, color: "#9CA3AF" }}>
                No tasks yet — create one.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: ACTIVITY */}
        <div style={{ width: 340 }}>
          <h3>Activity</h3>
          <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
            {activities.map((a) => (
              <div
                key={a._id}
                style={{
                  background: "#fff",
                  padding: 12,
                  borderRadius: 8,
                  marginBottom: 8,
                  borderLeft: "4px solid #4F46E5",
                }}
              >
                <div style={{ fontSize: 14 }}>{a.message}</div>
                <div
                  style={{
                    fontSize: 12,
                    color: "#9CA3AF",
                    marginTop: 6,
                  }}
                >
                  {new Date(a.createdAt).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showTaskModal && (
        <CreateTaskModal
          teamId={teamId}
          projectId={activeProject?._id}
          onClose={() => setShowTaskModal(false)}
          onCreated={onTaskCreated}
          editTask={editTask}
        />
      )}

      <Notification
        message={notif?.message}
        type={notif?.type}
        onClose={() => setNotif(null)}
      />
    </div>
  );
}

/* 🧱 Create Project Modal */
function CreateProject({ teamId, onCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!teamId) return alert("Team not found");
    setLoading(true);
    try {
      const res = await axios.post("/project", {
        teamId,
        name,
        description: desc,
      });
      onCreated(res.data.data);
      setOpen(false);
      setName("");
      setDesc("");
    } catch (err) {
      console.error("❌ Project creation failed:", err);
      alert(err?.response?.data?.message || "Failed to create project");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={() => setOpen(true)} style={btnPrimary}>
        + New Project
      </button>
      {open && (
        <div style={modalOverlay}>
          <div style={modalBox}>
            <h4>Create Project</h4>
            <input
              placeholder="Project name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Description"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              style={inputStyle}
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button onClick={() => setOpen(false)} style={cancelBtn}>
                Cancel
              </button>
              <button onClick={create} disabled={loading} style={primaryBtn}>
                {loading ? "Creating..." : "Create"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* 🎨 Styles */
const btnPrimary = {
  background: "#4F46E5",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8,
};

const btnGreen = {
  background: "#10B981",
  color: "#fff",
  border: "none",
  padding: "8px 12px",
  borderRadius: 8,
};

const cancelBtn = {
  padding: "8px 10px",
  borderRadius: 6,
};

const primaryBtn = {
  padding: "8px 10px",
  borderRadius: 6,
  background: "#4F46E5",
  color: "#fff",
  border: "none",
};

const inputStyle = {
  width: "100%",
  padding: 8,
  marginBottom: 10,
  borderRadius: 6,
  border: "1px solid #E5E7EB",
};

const modalOverlay = {
  position: "fixed",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "rgba(0,0,0,0.25)",
};

const modalBox = {
  background: "#fff",
  padding: 18,
  width: 420,
  borderRadius: 10,
};
