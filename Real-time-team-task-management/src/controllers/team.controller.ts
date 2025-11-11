import { Response } from "express";
import mongoose from "mongoose";
import crypto from "crypto";
import Team from "../models/team.model";
import { AuthRequest } from "../middlewares/auth.middleware";
import { getIO } from "../helpers/socket.helper";

/* ============================================================
   ✅ Create Team
============================================================ */
export const createTeam = async (req: AuthRequest, res: Response) => {
  try {
    const code = "TEAM-" + crypto.randomBytes(3).toString("hex").toUpperCase();
    const team = await Team.create({
      name: req.body.name,
      description: req.body.description,
      code,
      members: [{ user: req.user._id, role: "admin" }],
    });

    // Real-time emit: notify all users (optional)
    const io = getIO();
    io.emit("team:created", team);

    res.status(201).json({
      success: true,
      message: "Team created successfully",
      data: team,
    });
  } catch (error: any) {
    console.error("❌ Team create error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   ✅ Get My Teams
============================================================ */
export const getMyTeams = async (req: AuthRequest, res: Response) => {
  try {
    const teams = await Team.find({ "members.user": req.user._id })
      .populate("members.user", "name email role")
      .sort({ createdAt: -1 });

    res.json({ success: true, teams });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   ✅ Join Team (by code)
============================================================ */
export const joinTeam = async (req: AuthRequest, res: Response) => {
  try {
    const { code } = req.body;
    const team = await Team.findOne({ code: { $regex: new RegExp(`^${code}$`, "i") } })
      .populate("members.user", "name email role");

    if (!team)
      return res.status(404).json({ success: false, message: "Team not found" });

    if (team.members.some((m) => m.user._id.toString() === req.user._id.toString())) {
      return res.status(400).json({ success: false, message: "Already a member" });
    }

    team.members.push({ user: req.user._id, role: "member" });
    await team.save();

    const io = getIO();
    io.to(team._id.toString()).emit("team:updated", {
      teamId: team._id,
      members: team.members,
    });

    res.status(200).json({ success: true, data: team });
  } catch (error: any) {
    console.error("❌ Join team error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ============================================================
   ✅ Get Team by ID (for task assignment etc.)
============================================================ */
export const getTeamById = async (req: AuthRequest, res: Response) => {
  try {
    const { teamId } = req.params;

    // Check if it's a Mongo ObjectId (24 hex chars)
    const isObjectId = /^[0-9a-fA-F]{24}$/.test(teamId);

    const team = await Team.findOne(
      isObjectId ? { _id: teamId } : { code: teamId }
    ).populate("members.user", "name email role");

    if (!team)
      return res.status(404).json({ success: false, message: "Team not found" });

    return res.json({ success: true, team });
  } catch (err: any) {
    console.error("getTeamById err", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};

