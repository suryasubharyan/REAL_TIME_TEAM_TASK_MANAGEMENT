import { Request, Response } from "express";
import Project from "../models/project.model";
import Team from "../models/team.model";
import { AuthRequest } from "../middlewares/auth.middleware";
import { getIO } from "../helpers/socket.helper"; // ✅ ensure correct path

/* ============================================================
   ✅ Create Project (supports both team code and ObjectId)
============================================================ */
export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    let { teamId, name, description } = req.body;

    if (!teamId || !name) {
      return res.status(400).json({
        success: false,
        message: "teamId and name are required",
      });
    }

    // 🧠 Detect if teamId is a code like "TEAM-XXXXXX"
    let team;
    if (teamId.startsWith("TEAM-")) {
      team = await Team.findOne({ code: teamId });
    } else {
      team = await Team.findById(teamId);
    }

    if (!team)
      return res.status(404).json({
        success: false,
        message: "Team not found for provided ID or code",
      });

    // 🆕 Create project
    const project = await Project.create({
      team: team._id,
      name,
      description,
      createdBy: req.user._id,
    });

    // 🔔 Try real-time broadcast (safe guarded)
    try {
      const io = getIO();
      io.to(team._id.toString()).emit("project:created", project);
    } catch (err) {
      console.warn("⚠️ Socket not initialized yet, skipping emit");
    }

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      data: project,
    });
  } catch (error: any) {
    console.error("❌ Project creation error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   ✅ Get Projects by Team
============================================================ */
export const getProjectsByTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;

    // 🧠 Convert code → ObjectId automatically
    let teamRef = teamId;
    if (teamId.startsWith("TEAM-")) {
      const team = await Team.findOne({ code: teamId });
      if (!team)
        return res
          .status(404)
          .json({ success: false, message: "Team not found by code" });
      teamRef = team._id;
    }

    const projects = await Project.find({ team: teamRef })
      .populate("createdBy", "name email");

    res.json({ success: true, projects });
  } catch (error: any) {
    console.error("❌ Get projects error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};
