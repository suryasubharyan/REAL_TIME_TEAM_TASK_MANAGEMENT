import { Server, Socket } from "socket.io";
import Project from "../../models/project.model";
import Task from "../../models/task.model";
import Activity from "../../models/activity.model";

/**
 * Register all task-related real-time event handlers
 * for connected socket users.
 */
export default function registerTaskHandlers(io: Server, socket: Socket) {
  const user = socket.data.user;

  // ✅ User joins a team room
  socket.on("join_team_room", async (projectId: string) => {
    try {
      // 👇 Tell TS that this doc has team & title fields
      const project = await Project.findById(projectId).select("team title").lean() as
        | { team: any; title?: string }
        | null;

      if (!project) {
        return socket.emit("error_message", { message: "Project not found" });
      }

      const teamId = project.team.toString();
      socket.join(teamId);
      console.log(`👥 ${user.email} joined team room: ${teamId}`);

      socket.emit("joined_room_success", {
        teamId,
        projectTitle: project.title || "Untitled",
        message: `Joined real-time room for ${project.title || "Untitled"}`,
      });

      socket.to(teamId).emit("team_activity", {
        message: `${user.name} joined the project`,
        user: user.name,
        time: new Date(),
      });
    } catch (error) {
      console.error("join_team_room error:", error);
      socket.emit("error_message", { message: "Failed to join room" });
    }
  });

  // ✅ Create Task
  socket.on("task_create", async (payload) => {
    try {
      const { projectId, title, description, priority, assignedTo } = payload;
      if (!projectId || !title)
        return socket.emit("error_message", {
          message: "Project ID & title required",
        });

      const project = await Project.findById(projectId).select("team").lean() as
        | { team: any }
        | null;
      if (!project)
        return socket.emit("error_message", { message: "Project not found" });

      const task = await Task.create({
        title,
        description,
        priority: (priority || "medium").toLowerCase(),
        project: projectId,
        assignedTo: assignedTo || null,
        createdBy: user.id,
        status: "todo",
      });

      const activity = await Activity.create({
        team: project.team,
        actor: user.id,
        type: "task_created",
        message: `${user.name} created task "${title}"`,
        meta: { taskId: task._id, projectId },
      });

      io.to(project.team.toString()).emit("task_created", { task, activity });
      console.log(`🆕 Task created by ${user.email}: ${title}`);
    } catch (error) {
      console.error("task_create error:", error);
      socket.emit("error_message", { message: "Task creation failed" });
    }
  });

  // ✅ Update Task
  socket.on("task_update", async ({ taskId, updates }) => {
    try {
      const before = await Task.findById(taskId);
      if (!before)
        return socket.emit("error_message", { message: "Task not found" });

      const updated = await Task.findByIdAndUpdate(taskId, updates, { new: true })
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role");

      const project = await Project.findById(updated!.project).select("team").lean() as
        | { team: any }
        | null;

      const activity = await Activity.create({
        team: project?.team,
        actor: user.id,
        type: "task_updated",
        message: `${user.name} updated "${updated?.title || "Untitled"}"`,
        meta: { before, after: updated },
      });

      io.to(project!.team.toString()).emit("task_updated", { task: updated, activity });
      console.log(`✏️ Task updated by ${user.email}: ${updated?.title}`);
    } catch (error) {
      console.error("task_update error:", error);
      socket.emit("error_message", { message: "Task update failed" });
    }
  });

  // ✅ Delete Task
  socket.on("task_delete", async (taskId: string) => {
    try {
      const task = await Task.findById(taskId);
      if (!task)
        return socket.emit("error_message", { message: "Task not found" });

      const project = await Project.findById(task.project).select("team").lean() as
        | { team: any }
        | null;
      await Task.findByIdAndDelete(taskId);

      const activity = await Activity.create({
        team: project!.team,
        actor: user.id,
        type: "task_deleted",
        message: `${user.name} deleted task "${task.title}"`,
        meta: { taskId },
      });

      io.to(project!.team.toString()).emit("task_deleted", { taskId, activity });
      console.log(`🗑️ Task deleted by ${user.email}: ${task.title}`);
    } catch (error) {
      console.error("task_delete error:", error);
      socket.emit("error_message", { message: "Task deletion failed" });
    }
  });

  // Typing indicators
  socket.on("task_typing", ({ taskId }) => {
    socket.broadcast.emit("task_typing", { taskId, user: user.name });
  });

  socket.on("task_stop_typing", ({ taskId }) => {
    socket.broadcast.emit("task_stop_typing", { taskId, user: user.name });
  });

  socket.on("disconnect", () => {
    console.log(`❌ ${user.email} disconnected`);
  });
}
