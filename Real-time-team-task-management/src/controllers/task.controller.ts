import { Response } from "express";
import Task from "../models/task.model";
import Project from "../models/project.model";
import Activity from "../models/activity.model";
import { getIO } from "../config/socket";
import { AuthRequest } from "../middlewares/auth.middleware";

// helper to emit to team room
const emitToTeam = async (projectId: any, event: string, payload: any) => {
  const proj = await Project.findById(projectId).select("team");
  if (!proj) return;
  try {
    getIO().to(proj.team.toString()).emit(event, payload);
  } catch (err) {
    console.error("Socket emit error:", err);
  }
};

export const createTask = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Only admins can create tasks" });

    const { projectId, title, description, priority, assignedTo } = req.body;
    if (!projectId || !title)
      return res.status(400).json({ message: "projectId & title required" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const task = await Task.create({
      title,
      description,
      priority: (priority || "medium").toLowerCase(),
      project: projectId,
      assignedTo: assignedTo || null,
      createdBy: req.user._id,
      status: "todo",
    });

    const activity = await Activity.create({
      team: project.team,
      actor: req.user._id,
      type: "task_created",
      message: `${req.user.name} created task "${task.title}"`,
      meta: { taskId: task._id, projectId },
    });

    await emitToTeam(projectId, "task_created", { task });
    await emitToTeam(projectId, "activity_created", { activity });

    return res.status(201).json({ success: true, data: task });
  } catch (err: any) {
    console.error("createTask err", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const getTasksByProject = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;

    // Fetch all tasks first
    let query: any = { project: projectId };

    // ✅ If user is a member (not admin), show only tasks assigned to them
    if (req.user.role !== "admin") {
      query = {
        project: projectId,
        $or: [
          { assignedTo: req.user._id },
          { createdBy: req.user._id },
        ],
      };
    }

    const tasks = await Task.find(query)
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role")
      .sort({ createdAt: -1 });

    return res.json({ success: true, tasks });
  } catch (err: any) {
    console.error("getTasksByProject err", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

export const updateTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const before = await Task.findById(taskId);
    if (!before) return res.status(404).json({ message: "Task not found" });

    const isAdmin = req.user.role === "admin";
    const isOwner = before.createdBy?.toString() === req.user._id.toString();
    const isAssignee = before.assignedTo?.toString() === req.user._id.toString();

    if (!isAdmin && !isOwner && !isAssignee)
      return res.status(403).json({ message: "Access denied" });

    const update: any = {};

    if (isAdmin) {
      Object.assign(update, req.body);
    } else if (isOwner) {
      const allowed = ["title", "description", "priority"];
      for (const k of allowed) if (k in req.body) update[k] = req.body[k];
    } else if (isAssignee) {
      if ("status" in req.body) update.status = req.body.status;
    }

    if (update.priority) update.priority = update.priority.toLowerCase();

    const updated = await Task.findByIdAndUpdate(taskId, update, { new: true })
      .populate("assignedTo", "name email role")
      .populate("createdBy", "name email role");

    const project = await Project.findById(updated!.project);
    const activity = await Activity.create({
      team: project!.team,
      actor: req.user._id,
      type: "task_updated",
      message: `${req.user.name} updated task "${updated!.title}"`,
      meta: { before, after: updated },
    });

    await emitToTeam(updated!.project, "task_updated", { task: updated });
    await emitToTeam(updated!.project, "activity_created", { activity });

    return res.json({ success: true, data: updated });
  } catch (err: any) {
    console.error("updateTask err", err);
    return res.status(500).json({ message: err.message });
  }
};

export const deleteTask = async (req: AuthRequest, res: Response) => {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Task not found" });

    // RBAC: Only admins or creator can delete (choose policy). Here admin OR creator.
    const isAdmin = req.user.role === "admin";
    const isCreator = task.createdBy?.toString() === req.user._id.toString();
    if (!isAdmin && !isCreator) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Task.findByIdAndDelete(taskId);

    const project = await Project.findById(task.project);
    const activity = await Activity.create({
      team: project!.team,
      actor: req.user._id,
      type: "task_deleted",
      message: `${req.user.name || "A user"} deleted task "${task.title}"`,
      meta: { taskId: task._id },
    });

    await emitToTeam(project!._id, "task_deleted", { taskId: task._id });
    await emitToTeam(project!._id, "activity_created", { activity });

    return res.json({ success: true, message: "Task deleted" });
  } catch (err: any) {
    console.error("deleteTask err", err);
    return res.status(500).json({ message: err.message });
  }
};
