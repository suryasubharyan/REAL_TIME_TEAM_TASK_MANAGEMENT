import { Server, Socket } from "socket.io";
import Project from "../../models/project.model";
import Task from "../../models/task.model";
import Activity from "../../models/activity.model";

/**
 * Register all task-related real-time event handlers
 * for connected socket users.
 */
export default function registerTaskHandlers(io: Server, socket: Socket) {
  const user = socket.data.user; // from auth middleware in socket.helper.ts

  // ✅ User joins a team room
  socket.on("join_team_room", async (projectId: string) => {
    try {
      const project = await Project.findById(projectId).select("team title");
      if (!project) {
        return socket.emit("error_message", { message: "Project not found" });
      }

      const teamId = project.team.toString();
      socket.join(teamId);
      console.log(`👥 ${user.email} joined team room: ${teamId}`);

      socket.emit("joined_room_success", {
        teamId,
        projectTitle: project.title,
        message: `Joined real-time room for ${project.title}`,
      });

      // Notify others
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

  // ✅ Create Task in real-time
  socket.on("task_create", async (payload) => {
    try {
      const { projectId, title, description, priority, assignedTo } = payload;
      if (!projectId || !title)
        return socket.emit("error_message", {
          message: "Project ID & title required",
        });

      const project = await Project.findById(projectId).select("team");
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
        message: `${user.name} created task "${task.title}"`,
        meta: { taskId: task._id, projectId },
      });

      io.to(project.team.toString()).emit("task_created", { task, activity });
      console.log(`🆕 Task created by ${user.email}: ${title}`);
    } catch (error) {
      console.error("task_create error:", error);
      socket.emit("error_message", { message: "Task creation failed" });
    }
  });

  // ✅ Update Task in real-time
  socket.on("task_update", async ({ taskId, updates }) => {
    try {
      const before = await Task.findById(taskId);
      if (!before)
        return socket.emit("error_message", { message: "Task not found" });

      const updated = await Task.findByIdAndUpdate(taskId, updates, {
        new: true,
      })
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role");

      const project = await Project.findById(updated!.project);
      const activity = await Activity.create({
        team: project!.team,
        actor: user.id,
        type: "task_updated",
        message: `${user.name} updated "${updated!.title}"`,
        meta: { before, after: updated },
      });

      io.to(project!.team.toString()).emit("task_updated", { task: updated, activity });
      console.log(`✏️ Task updated by ${user.email}: ${updated!.title}`);
    } catch (error) {
      console.error("task_update error:", error);
      socket.emit("error_message", { message: "Task update failed" });
    }
  });

  // ✅ Delete Task in real-time
  socket.on("task_delete", async (taskId: string) => {
    try {
      const task = await Task.findById(taskId);
      if (!task)
        return socket.emit("error_message", { message: "Task not found" });

      const project = await Project.findById(task.project);
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

  // ✅ Task Typing (for collaboration feedback)
  socket.on("task_typing", ({ taskId }) => {
    socket.broadcast.emit("task_typing", {
      taskId,
      user: user.name,
    });
  });

  socket.on("task_stop_typing", ({ taskId }) => {
    socket.broadcast.emit("task_stop_typing", {
      taskId,
      user: user.name,
    });
  });

  // ✅ Handle disconnect
  socket.on("disconnect", () => {
    console.log(`❌ ${user.email} disconnected`);
  });
}
