import React, { useEffect, useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar";
import axios from "../api/axios";
import { useTeamSocket } from "../hooks/useTeamSocket";
import ProjectCard from "../components/ProjectCard";
import TaskCard from "../components/TaskCard";
import Notification from "../components/Notification";
import CreateTaskModal from "../components/CreateTaskModal";
import { useAuth } from "../context/AuthContext";

export default function ProjectView() {
  const { teamId } = useParams();
  const location = useLocation();
  const stateTeam = location.state?.team;
  const [team, setTeam] = useState(stateTeam || null);
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notif, setNotif] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const { user } = useAuth();

  // ✅ Socket listener hook
  useTeamSocket(teamId, {
    task_created: (d) => {
      if (d?.task?.project === activeProject?._id) {
        setTasks((t) => [d.task, ...t]);
        showNotif(`🆕 New task added: ${d.task.title}`, "info");
      }
    },
    task_updated: (d) => {
      if (d?.task?.project === activeProject?._id) {
        setTasks((t) => t.map((x) => (x._id === d.task._id ? d.task : x)));
        showNotif(`✏️ Task updated: ${d.task.title}`, "success");
      }
    },
    task_deleted: (d) => {
      setTasks((t) => t.filter((x) => x._id !== d.taskId));
      showNotif("🗑️ Task deleted", "warning");
    },
    activity_created: (d) => {
      setActivities((a) => [d.activity, ...a]);
      if (d?.activity?.message) showNotif(d.activity.message, "info");
    },
  });

  // ✅ Fetch projects on mount
  useEffect(() => {
    (async () => {
      try {
        if (!team) {
          const teamsRes = await axios.get("/team/my");
          const found = teamsRes.data.teams?.find((t) => t._id === teamId);
          if (found) setTeam(found);
        }
        const res = await axios.get(`/project/team/${teamId}`);
        setProjects(res.data.projects || []);

        if (res.data.projects?.length) {
          const lastProjId = localStorage.getItem("lastProjectId");
          const choose =
            res.data.projects.find((p) => p._id === lastProjId) ||
            res.data.projects[0];
          setActiveProject(choose);
        }
      } catch (err) {
        console.error("❌ Project fetch failed:", err);
      }
    })();
  }, [teamId]);

  // ✅ Fetch tasks when active project changes
  useEffect(() => {
    (async () => {
      if (!activeProject) {
        setTasks([]);
        return;
      }
      try {
        localStorage.setItem("lastProjectId", activeProject._id);
        const t = await axios.get(`/task/project/${activeProject._id}`);
        setTasks(t.data.tasks || []);
        const act = await axios.get(`/activity/project/${activeProject._id}`);
        setActivities(act.data.activities || []);
      } catch (err) {
        console.error("❌ Task fetch failed:", err);
      }
    })();
  }, [activeProject]);

  const showNotif = (message, type = "info") => {
    setNotif({ message, type });
    setTimeout(() => setNotif(null), 3500);
  };

  const onProjectCreated = (proj) => {
    setProjects((prev) => [proj, ...prev]);
    setActiveProject(proj);
    showNotif("✅ Project created successfully", "success");
  };

  const onTaskCreated = (task) => {
    setTasks((prev) => [task, ...prev]);
    showNotif("✅ Task saved successfully!", "success");
  };

  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <Navbar />
      <div style={{ display: "flex", gap: 20, padding: 24 }}>
        {/* LEFT: PROJECT LIST */}
        <div style={{ width: 260 }}>
          <div style={{ marginBottom: 10 }}>
            <h3 style={{ margin: 0 }}>Projects</h3>
            <small style={{ color: "#6B7280" }}>{team?.name}</small>
          </div>

          <div>
            {projects.map((p) => (
              <ProjectCard
                key={p._id}
                project={p}
                active={activeProject?._id === p._id}
                onClick={(pr) => setActiveProject(pr)}
              />
            ))}
          </div>

          {/* ✅ Only Admins can create projects */}
          {user?.role === "admin" && (
            <CreateProject teamId={teamId} onCreated={onProjectCreated} />
          )}
        </div>

        {/* MIDDLE: TASK LIST */}
        <div style={{ flex: 1 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h3 style={{ margin: 0 }}>
              Tasks for {activeProject?.name || "—"}
            </h3>

            {/* ✅ Admin-only Add Task */}
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
          </div>

          <div style={{ marginTop: 12 }}>
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onEdit={(t) => {
                  setEditTask(t);
                  setShowTaskModal(true);
                }}
                onUpdated={(updated) =>
                  setTasks((prev) =>
                    prev.map((t) => (t._id === updated._id ? updated : t))
                  )
                }
                onDeleted={(id) =>
                  setTasks((prev) => prev.filter((t) => t._id !== id))
                }
              />
            ))}
            {tasks.length === 0 && (
              <div style={{ marginTop: 16, color: "#9CA3AF" }}>
                No tasks yet — create one.
              </div>
            )}
          </div>
        </div>

        {/* RIGHT: ACTIVITY LOG */}
        <div style={{ width: 340 }}>
          <h3 style={{ marginTop: 0 }}>Activity</h3>
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
            {activities.length === 0 && (
              <div style={{ color: "#9CA3AF" }}>No activity yet.</div>
            )}
          </div>
        </div>
      </div>

      {/* ✅ Create/Edit Task Modal */}
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
      onCreated && onCreated(res.data.data);
      setOpen(false);
      setName("");
      setDesc("");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed");
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
            <h4 style={{ marginTop: 0 }}>Create Project</h4>
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
