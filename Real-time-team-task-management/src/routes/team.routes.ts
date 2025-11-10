import express from "express";
import {
  createTeam,
  getMyTeams,
  joinTeam,
  getTeamById,
} from "../controllers/team.controller";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

// ✅ Create a new team
router.post("/", protect, createTeam);

// ✅ Get all teams of logged-in user
router.get("/my", protect, getMyTeams);

// ✅ Join a team by unique code
router.post("/join", protect, joinTeam);

// ✅ Get team by ID or teamCode
router.get("/:teamId", protect, getTeamById);

export default router;

/**
 * @swagger
 * tags:
 *   name: Team
 *   description: Team management APIs
 */

/**
 * @swagger
 * /api/team:
 *   post:
 *     summary: Create a new team
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Team created successfully
 */

/**
 * @swagger
 * /api/team/my:
 *   get:
 *     summary: Get all teams for the logged-in user
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of user's teams
 */

/**
 * @swagger
 * /api/team/join:
 *   post:
 *     summary: Join a team using a code
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully joined the team
 */

/**
 * @swagger
 * /api/team/{teamId}:
 *   get:
 *     summary: Get details of a team by ID or code
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: teamId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID or code of the team
 *     responses:
 *       200:
 *         description: Team details
 */
