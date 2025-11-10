import { Server, Socket } from "socket.io";
import Project from "../../models/project.model";
import Task from "../../models/task.model";
import Activity from "../../models/activity.model";

/**
 * Handles all real-time task and project socket events
 */
export default function registerTaskHandlers(io: Server, socket: Socket) {
  const user = socket.data.user || {
    _id: null,
    email: "anonymous",
    name: "Anonymous",
  };

  /* 🟢 USER JOINS TEAM ROOM (BASED ON PROJECT ID) */
  socket.on("join_team_room", async (projectId: string) => {
    try {
      const project = (await Project.findById(projectId).select(
        "team title"
      )) as any;

      if (!project) {
        return socket.emit("error_message", { message: "Project not found" });
      }

      const teamId = project.team.toString();
      socket.join(teamId);

      console.log(`👥 ${user.email} joined team room: ${teamId}`);

      socket.emit("joined_room_success", {
        teamId,
        projectTitle: project.title || project.name || "Untitled",
        message: `Joined room for project: ${project.title || project.name}`,
      });

      io.to(teamId).emit("team_activity", {
        message: `${user.name} joined the project`,
        user: user.name,
        time: new Date(),
      });
    } catch (error) {
      console.error("join_team_room error:", error);
      socket.emit("error_message", { message: "Failed to join room" });
    }
  });

  /* 🆕 CREATE TASK */
  socket.on("task_create", async (payload) => {
    try {
      const { projectId, title, description, priority, assignedTo } = payload;
      if (!projectId || !title) {
        return socket.emit("error_message", {
          message: "Project ID and title required",
        });
      }

      const project = (await Project.findById(projectId).select("team")) as any;
      if (!project)
        return socket.emit("error_message", { message: "Project not found" });

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

      console.log(`🆕 Task created by ${user.email}: ${title}`);
    } catch (error) {
      console.error("task_create error:", error);
      socket.emit("error_message", { message: "Task creation failed" });
    }
  });

  /* ✏️ UPDATE TASK */
  socket.on("task_update", async ({ taskId, updates }) => {
    try {
      const before = (await Task.findById(taskId)) as any;
      if (!before)
        return socket.emit("error_message", { message: "Task not found" });

      const updated = (await Task.findByIdAndUpdate(taskId, updates, {
        new: true,
      })
        .populate("assignedTo", "name email role")
        .populate("createdBy", "name email role")) as any;

      const project = (await Project.findById(updated!.project)) as any;

      const activity = await Activity.create({
        team: project.team,
        actor: user._id,
        type: "task_updated",
        message: `${user.name} updated task "${updated!.title}"`,
        meta: { before, after: updated },
      });

      io.to(project.team.toString()).emit("task_updated", {
        task: updated,
        activity,
      });

      console.log(`✏️ Task updated by ${user.email}: ${updated!.title}`);
    } catch (error) {
      console.error("task_update error:", error);
      socket.emit("error_message", { message: "Task update failed" });
    }
  });

  /* 🗑️ DELETE TASK */
  socket.on("task_delete", async (taskId: string) => {
    try {
      const task = (await Task.findById(taskId)) as any;
      if (!task)
        return socket.emit("error_message", { message: "Task not found" });

      const project = (await Project.findById(task.project)) as any;
      await Task.findByIdAndDelete(taskId);

      const activity = await Activity.create({
        team: project.team,
        actor: user._id,
        type: "task_deleted",
        message: `${user.name} deleted task "${task.title}"`,
        meta: { taskId },
      });

      io.to(project.team.toString()).emit("task_deleted", { taskId, activity });

      console.log(`🗑️ Task deleted by ${user.email}: ${task.title}`);
    } catch (error) {
      console.error("task_delete error:", error);
      socket.emit("error_message", { message: "Task deletion failed" });
    }
  });

  /* 💬 TASK TYPING INDICATORS (optional collaboration feature) */
  socket.on("task_typing", ({ taskId }) => {
    socket.broadcast.emit("task_typing", { taskId, user: user.name });
  });

  socket.on("task_stop_typing", ({ taskId }) => {
    socket.broadcast.emit("task_stop_typing", { taskId, user: user.name });
  });

  /* 🔴 DISCONNECT HANDLER */
  socket.on("disconnect", (reason) => {
    console.log(`❌ ${user.email} disconnected (${reason})`);
  });
}
