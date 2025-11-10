import { Request, Response } from "express";
import mongoose from "mongoose";
import Project from "../models/project.model";
import Team from "../models/team.model";
import { AuthRequest } from "../middlewares/auth.middleware";
import { getIO } from "../config/socket";

export const createProject = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId, name, description } = req.body;
    const team = await Team.findById(teamId);
    if (!team) return res.status(404).json({ success: false, message: "Team not found" });

    const project = await Project.create({
      team: team._id,
      name,
      description,
      createdBy: req.user._id,
    });

    const io = getIO();
    io.to(team._id.toString()).emit("project:created", project);

    res.status(201).json({ success: true, data: project });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getProjectsByTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;
    const projects = await Project.find({ team: teamId }).populate("createdBy", "name");
    res.json({ success: true, projects });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
