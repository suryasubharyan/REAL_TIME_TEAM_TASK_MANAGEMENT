import { useEffect } from "react";
import { useSocket } from "../context/SocketContext";
import { useAuth } from "../context/AuthContext";

/**
 * Centralized socket event manager — handles all real-time logic
 * for teams, projects, and tasks.
 */
export default function useSocketEvents({
  onTeamCreated,
  onTeamUpdated,
  onTeamDeleted,
  onTaskCreated,
  onTaskUpdated,
  onTaskDeleted,
}) {
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    if (!socket || !user) return;

    console.log("✅ Socket event listeners attached for", user.email);

    // === TEAM EVENTS ===
    socket.on("team:created", (team) => {
      console.log("📡 team:created", team);
      onTeamCreated && onTeamCreated(team);
    });

    socket.on("team:updated", (payload) => {
      console.log("📡 team:updated", payload);
      onTeamUpdated && onTeamUpdated(payload);
    });

    socket.on("team:deleted", (teamId) => {
      console.log("📡 team:deleted", teamId);
      onTeamDeleted && onTeamDeleted(teamId);
    });

    // === TASK EVENTS ===
    socket.on("task_created", (data) => {
      console.log("📡 task_created", data);
      onTaskCreated && onTaskCreated(data.task, data.activity);
    });

    socket.on("task_updated", (data) => {
      console.log("📡 task_updated", data);
      onTaskUpdated && onTaskUpdated(data.task, data.activity);
    });

    socket.on("task_deleted", (data) => {
      console.log("📡 task_deleted", data);
      onTaskDeleted && onTaskDeleted(data.taskId, data.activity);
    });

    return () => {
      socket.off("team:created");
      socket.off("team:updated");
      socket.off("team:deleted");
      socket.off("task_created");
      socket.off("task_updated");
      socket.off("task_deleted");
    };
  }, [socket, user]);
}
