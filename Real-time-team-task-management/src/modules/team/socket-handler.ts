import { Server, Socket } from "socket.io";
import Team from "../../models/team.model";
import Activity from "../../models/activity.model";

export default function registerTeamHandlers(io: Server, socket: Socket) {
  const user = socket.data.user || { _id: null, name: "Guest", email: "unknown" };

  /* 🔗 User joins all their teams */
  socket.on("joinTeams", async (teamIds: string[]) => {
    try {
      if (!Array.isArray(teamIds)) return;
      teamIds.forEach((id) => socket.join(id));
      socket.emit("joinedRooms", teamIds);
      console.log(`👥 ${user.email} joined rooms:`, teamIds);
    } catch (err) {
      console.error("joinTeams error:", err);
      socket.emit("error_message", { message: "Failed to join team rooms" });
    }
  });

  /* 🆕 Team Created */
  socket.on("team:created", async (team) => {
    try {
      if (!team?._id) return;
      io.emit("team:created", team);
      console.log(`🆕 Team created: ${team.name}`);
    } catch (err) {
      console.error("team:created error:", err);
    }
  });

  /* 👥 Team Updated */
  socket.on("team:updated", async ({ teamId, members }) => {
    try {
      if (!teamId) return;
      const updated = await Team.findById(teamId);
      if (!updated) return;
      io.emit("team:updated", { teamId, members: members || updated.members });
      console.log(`♻️ Team updated: ${updated.name}`);
    } catch (err) {
      console.error("team:updated error:", err);
    }
  });

  /* ❌ Team Deleted */
  socket.on("team:deleted", async (teamId: string) => {
    try {
      if (!teamId) return;
      io.emit("team:deleted", teamId);
      console.log(`🗑️ Team deleted: ${teamId}`);
    } catch (err) {
      console.error("team:deleted error:", err);
    }
  });

  /* 🔴 Disconnect Handler */
  socket.on("disconnect", () => {
    console.log(`❌ ${user.email} disconnected`);
  });
}
