import { Request, Response } from "express";
import Project from "../models/project.model";
import Team from "../models/team.model";

/* --------------------------------------------
   ✅ Create a new project
-------------------------------------------- */
export const createProject = async (req: Request, res: Response) => {
  try {
    const { teamId, name, description } = req.body;

    if (!teamId || !name) {
      return res
        .status(400)
        .json({ success: false, message: "Team ID/code and name are required" });
    }

    // 🔍 Resolve team ObjectId (accept both MongoId & TEAM-XXXX)
    let resolvedTeamId = teamId;
    if (typeof teamId === "string" && teamId.startsWith("TEAM-")) {
      const foundTeam = await Team.findOne({ code: teamId });
      if (!foundTeam)
        return res
          .status(404)
          .json({ success: false, message: "Team not found for given code" });
      resolvedTeamId = foundTeam._id;
    }

    // ✅ Create project
    const project = await Project.create({
      name,
      description,
      team: resolvedTeamId,
      createdBy: req.user?._id, // comes from protect middleware
    });

    return res.status(201).json({
      success: true,
      data: project,
      message: "Project created successfully",
    });
  } catch (error: any) {
    console.error("❌ Project creation failed:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};

/* --------------------------------------------
   ✅ Get all projects for a given team
-------------------------------------------- */
export const getProjectsByTeam = async (req: Request, res: Response) => {
  try {
    const { teamId } = req.params;

    let resolvedTeamId = teamId;
    if (teamId.startsWith("TEAM-")) {
      const foundTeam = await Team.findOne({ code: teamId });
      if (!foundTeam)
        return res
          .status(404)
          .json({ success: false, message: "Team not found for given code" });
      resolvedTeamId = foundTeam._id;
    }

    const projects = await Project.find({ team: resolvedTeamId })
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    return res.status(200).json({
      success: true,
      projects,
      message: "Projects fetched successfully",
    });
  } catch (error: any) {
    console.error("❌ Project fetch failed:", error);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};
