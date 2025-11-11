import express from "express";
import { protect } from "../middlewares/auth.middleware";
import Activity from "../models/activity.model";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Activity
 *   description: Logs and activity tracking
 */

/**
 * @swagger
 * /api/activity/project/{projectId}:
 *   get:
 *     summary: Get project activity history
 *     description: Accessible by **both admins and members** belonging to that project.
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: projectId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of project activities
 */

/**
 * @swagger
 * /api/activity/team/{teamId}:
 *   get:
 *     summary: Get activity history of a team
 *     description: Accessible by **admins and members** of the team.
 *     tags: [Activity]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of team-level activities
 */

router.get("/project/:projectId", protect, async (req, res) => {
  const { projectId } = req.params;
  const activities = await Activity.find({ "meta.projectId": projectId })
    .sort({ createdAt: -1 })
    .populate("actor", "name email role");
  res.json({ success: true, activities });
});

router.get("/team/:teamId", protect, async (req, res) => {
  const { teamId } = req.params;
  const activities = await Activity.find({ team: teamId })
    .sort({ createdAt: -1 })
    .populate("actor", "name email role");
  res.json({ success: true, activities });
});

export default router;
