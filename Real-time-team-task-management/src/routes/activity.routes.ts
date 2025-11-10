import express from "express";
import { protect } from "../middlewares/auth.middleware";
import Activity from "../models/activity.model";

const router = express.Router();

/**
 * ✅ Get all activities for a given project or team
 * Supports:
 *   - /api/activity/project/:projectId
 *   - /api/activity/team/:teamId
 */

// Get by project
router.get("/project/:projectId", protect, async (req, res) => {
  try {
    const { projectId } = req.params;

    const activities = await Activity.find({ "meta.projectId": projectId })
      .sort({ createdAt: -1 })
      .populate("actor", "name email role")
      .lean();

    res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("❌ Error fetching activities by project:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
    });
  }
});

// Optional: Get all activities for a team
router.get("/team/:teamId", protect, async (req, res) => {
  try {
    const { teamId } = req.params;

    const activities = await Activity.find({ team: teamId })
      .sort({ createdAt: -1 })
      .populate("actor", "name email role")
      .lean();

    res.status(200).json({
      success: true,
      activities,
    });
  } catch (error) {
    console.error("❌ Error fetching activities by team:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch activities",
    });
  }
});

export default router;
