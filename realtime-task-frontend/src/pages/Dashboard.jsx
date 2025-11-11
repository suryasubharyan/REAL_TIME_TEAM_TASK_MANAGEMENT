import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import axios from "../api/axios";
import TeamCard from "../components/TeamCard";
import Notification from "../components/Notification";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";

export default function Dashboard() {
  const { user } = useAuth();
  const socket = useSocket();

  const [managedTeams, setManagedTeams] = useState([]);
  const [memberTeams, setMemberTeams] = useState([]);
  const [notif, setNotif] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);

  /* ----------------- SOCKET SETUP ----------------- */
  useEffect(() => {
    if (!socket || !user?._id) return;

    console.log("✅ Dashboard socket active for:", user.email);

    const handleConnect = () => {
      setSocketConnected(true);
      console.log("🟢 Socket connected:", socket.id);
    };

    const handleDisconnect = (reason) => {
      setSocketConnected(false);
      console.warn("🔴 Socket disconnected:", reason);
    };

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.on("team:created", (team) => {
      if (
        team.members?.some(
          (m) => m.user === user._id || m.user?._id === user._id
        )
      ) {
        setManagedTeams((prev) => [team, ...prev]);
        showNotif(`✅ New team created: ${team.name}`, "info");
      }
    });

    socket.on("team:updated", ({ teamId, members }) => {
      setManagedTeams((prev) =>
        prev.map((t) => (t._id === teamId ? { ...t, members } : t))
      );
      setMemberTeams((prev) =>
        prev.map((t) => (t._id === teamId ? { ...t, members } : t))
      );
      showNotif("👥 Team updated in real-time", "info");
    });

    socket.on("team:deleted", (teamId) => {
      setManagedTeams((prev) => prev.filter((t) => t._id !== teamId));
      setMemberTeams((prev) => prev.filter((t) => t._id !== teamId));
      showNotif("❌ A team was deleted", "warning");
    });

    // Initial fetch after socket is ready
    fetchTeams();

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("team:created");
      socket.off("team:updated");
      socket.off("team:deleted");
    };
  }, [socket, user?._id]);

  /* ----------------- FETCH TEAMS ----------------- */
  const fetchTeams = async () => {
    try {
      const res = await axios.get("/team/my");
      const teams = res.data?.teams || [];

      const managed = teams.filter((t) =>
        t.members?.some(
          (m) =>
            m.role === "admin" &&
            (m.user?._id === user._id || m.user === user._id)
        )
      );

      const joined = teams.filter(
        (t) =>
          !managed.some((m) => m._id === t._id) &&
          t.members?.some((m) => m.user?._id === user._id)
      );

      setManagedTeams(managed);
      setMemberTeams(joined);

      // Join all rooms for live updates
      if (socket?.connected) socket.emit("joinTeams", teams.map((t) => t._id));
    } catch (err) {
      console.error("❌ Failed to fetch teams:", err);
    }
  };

  /* ----------------- HELPERS ----------------- */
  const showNotif = (message, type = "info") => {
    setNotif({ message, type });
    setTimeout(() => setNotif(null), 3500);
  };

  const onCreated = (team) => {
    setManagedTeams((prev) => [team, ...prev]);
    showNotif("✅ Team created successfully", "success");
    socket?.emit("team:created", team);
  };

  const onJoined = (team) => {
    setMemberTeams((prev) => [team, ...prev]);
    showNotif("✅ Joined team successfully", "success");
    socket?.emit("team:updated", { teamId: team._id });
  };

  /* ----------------- UI ----------------- */
  return (
    <div style={{ minHeight: "100vh", background: "#F9FAFB" }}>
      <Navbar />
      <div style={{ padding: 24 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <h2 style={{ margin: 0 }}>
              {user?.role === "admin" ? "Managed Teams" : "Joined Teams"}
            </h2>
            <div
              title={socketConnected ? "Connected" : "Disconnected"}
              style={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                background: socketConnected ? "#10B981" : "#EF4444",
                boxShadow: socketConnected
                  ? "0 0 4px #10B981"
                  : "0 0 4px #EF4444",
              }}
            ></div>
          </div>

          {user?.role === "admin" ? (
            <CreateTeam onCreated={onCreated} />
          ) : (
            <JoinTeam onJoined={onJoined} />
          )}
        </div>

        {/* TEAM LIST */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: 18,
          }}
        >
          {(user?.role === "admin" ? managedTeams : memberTeams).map((team) => (
            <TeamCard key={team._id} team={team} />
          ))}
        </div>
      </div>

      <Notification
        message={notif?.message}
        type={notif?.type}
        onClose={() => setNotif(null)}
      />
    </div>
  );
}

/* ----------------- CREATE TEAM ----------------- */
function CreateTeam({ onCreated }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [desc, setDesc] = useState("");
  const [loading, setLoading] = useState(false);

  const create = async () => {
    if (!name.trim()) return alert("Name is required");
    setLoading(true);
    try {
      const res = await axios.post("/team", { name, description: desc });
      onCreated && onCreated(res.data.data);
      setOpen(false);
      setName("");
      setDesc("");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to create team");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={buttonPrimary}>
        + Create Team
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)}>
          <h3 style={{ marginTop: 0 }}>Create Team</h3>
          <input
            placeholder="Team name"
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
          <div style={modalFooter}>
            <button onClick={() => setOpen(false)} style={cancelBtn}>
              Cancel
            </button>
            <button onClick={create} disabled={loading} style={primaryBtn}>
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ----------------- JOIN TEAM ----------------- */
function JoinTeam({ onJoined }) {
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const join = async () => {
    if (!code.trim()) return alert("Team code required");
    setLoading(true);
    try {
      const res = await axios.post("/team/join", { code });
      onJoined && onJoined(res.data.data);
      setOpen(false);
      setCode("");
    } catch (err) {
      alert(err?.response?.data?.message || "Failed to join");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} style={buttonGreen}>
        + Join Team
      </button>
      {open && (
        <Modal onClose={() => setOpen(false)}>
          <h3 style={{ marginTop: 0 }}>Join a Team</h3>
          <input
            placeholder="Enter team code (e.g. TEAM-46E82B)"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={inputStyle}
          />
          <div style={modalFooter}>
            <button onClick={() => setOpen(false)} style={cancelBtn}>
              Cancel
            </button>
            <button onClick={join} disabled={loading} style={joinBtn}>
              {loading ? "Joining..." : "Join"}
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

/* ----------------- COMMON STYLES ----------------- */
function Modal({ children, onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "#fff",
          padding: 20,
          borderRadius: 10,
          width: 400,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: 10,
  marginBottom: 10,
  borderRadius: 8,
  border: "1px solid #E5E7EB",
};

const modalFooter = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 8,
};

const cancelBtn = {
  padding: "8px 12px",
  borderRadius: 8,
  background: "#E5E7EB",
  border: "none",
};

const primaryBtn = {
  padding: "8px 12px",
  borderRadius: 8,
  background: "#4F46E5",
  color: "#fff",
  border: "none",
};

const joinBtn = { ...primaryBtn, background: "#10B981" };
const buttonPrimary = { ...primaryBtn, borderRadius: 8 };
const buttonGreen = { ...joinBtn, borderRadius: 8 };
