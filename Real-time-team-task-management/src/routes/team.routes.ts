import express from "express";
import { createTeam, getMyTeams, joinTeam, getTeamById } from "../controllers/team.controller";
import { protect } from "../middlewares/auth.middleware";

const router = express.Router();

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
 *     description: Only **admins** can create new teams.
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Backend Ninjas
 *               description:
 *                 type: string
 *                 example: Handles backend microservices
 *     responses:
 *       201:
 *         description: Team created successfully
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/team/my:
 *   get:
 *     summary: Get all teams joined by the logged-in user
 *     description: Accessible by **both admins and members**.
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of teams the user belongs to
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /api/team/join:
 *   post:
 *     summary: Join a team via join code
 *     description: Accessible by **members** to join an existing team.
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [code]
 *             properties:
 *               code:
 *                 type: string
 *                 example: TEAM-9FA28B
 *     responses:
 *       200:
 *         description: Joined team successfully
 *       404:
 *         description: Team not found
 */

/**
 * @swagger
 * /api/team/{teamId}:
 *   get:
 *     summary: Get team details by ID or team code
 *     description: Accessible by **both admins and members**.
 *     tags: [Team]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: teamId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *         description: Team Mongo ID or code
 *     responses:
 *       200:
 *         description: Team details fetched
 *       404:
 *         description: Team not found
 */

router.post("/", protect, createTeam);
router.get("/my", protect, getMyTeams);
router.post("/join", protect, joinTeam);
router.get("/:teamId", protect, getTeamById);

export default router;
