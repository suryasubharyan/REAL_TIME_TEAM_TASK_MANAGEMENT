// src/modules/task/socket-handler.ts
import { Server, Socket } from "socket.io";
import Project from "../../models/project.model";
import Task from "../../models/task.model";
import Activity from "../../models/activity.model";

export default function registerTaskHandlers(io: Server, socket: Socket) {
  const user = socket.data.user || { _id: null, email: "anon", name: "Anonymous" };

  // Join team room (project -> team)
  socket.on("join_team_room", async (projectId: string) => {
    try {
      const project = await Project.findById(projectId).select("team title");
      if (!project) return socket.emit("error_message", { message: "Project not found" });

      const teamId = project.team.toString();
      socket.join(teamId);
      socket.emit("joined_room_success", { teamId, projectTitle: project.title });
      socket.to(teamId).emit("team_activity", { message: `${user.name} joined`, user: user.name });
    } catch (err) {
      socket.emit("error_message", { message: "Failed to join room" });
    }
  });

  // Create Task
  socket.on("task_create", async (payload) => {
    try {
      const { projectId, title, description, priority, assignedTo } = payload;
      if (!projectId || !title) return socket.emit("error_message", { message: "Project & title required" });

      const project = await Project.findById(projectId).select("team");
      if (!project) return socket.emit("error_message", { message: "Project not found" });

      const task = await Task.create({
        title,
        description,
        priority: (priority || "medium").toLowerCase(),
        project: projectId,
        assignedTo: assignedTo || null,
        createdBy: user._id,
        status: "todo",
      });

      const activity = await Activity.create({
        team: project.team,
        actor: user._id,
        type: "task_created",
        message: `${user.name} created task "${task.title}"`,
        meta: { taskId: task._id, projectId },
      });

      const teamRoom = project.team.toString();
      io.to(teamRoom).emit("task_created", { task, activity });
    } catch (err) {
      console.error("task_create err", err);
      socket.emit("error_message", { message: "Task create failed" });
    }
  });

  // Update Task
  socket.on("task_update", async ({ taskId, updates }) => {
    try {
      const before = await Task.findById(taskId);
      if (!before) return socket.emit("error_message", { message: "Task not found" });

      const updated = await Task.findByIdAndUpdate(taskId, updates, { new: true })
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role");

      const project = await Project.findById(updated!.project);
      const activity = await Activity.create({
        team: project!.team,
        actor: user._id,
        type: "task_updated",
        message: `${user.name} updated "${updated!.title}"`,
        meta: { before, after: updated },
      });

      io.to(project!.team.toString()).emit("task_updated", { task: updated, activity });
    } catch (err) {
      console.error("task_update err", err);
      socket.emit("error_message", { message: "Task update failed" });
    }
  });

  // Delete
  socket.on("task_delete", async (taskId: string) => {
    try {
      const task = await Task.findById(taskId);
      if (!task) return socket.emit("error_message", { message: "Task not found" });
      const project = await Project.findById(task.project);
      await Task.findByIdAndDelete(taskId);

      const activity = await Activity.create({
        team: project!.team,
        actor: user._id,
        type: "task_deleted",
        message: `${user.name} deleted "${task.title}"`,
        meta: { taskId },
      });

      io.to(project!.team.toString()).emit("task_deleted", { taskId, activity });
    } catch (err) {
      console.error("task_delete err", err);
      socket.emit("error_message", { message: "Task delete failed" });
    }
  });

  // Typing indicators (optional)
  socket.on("task_typing", ({ taskId }) => socket.broadcast.emit("task_typing", { taskId, user: user.name }));
  socket.on("task_stop_typing", ({ taskId }) => socket.broadcast.emit("task_stop_typing", { taskId, user: user.name }));
}
