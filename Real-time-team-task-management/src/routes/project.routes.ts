import express from "express";
import { protect } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import { validateDTO } from "../middlewares/validate.middleware";
import { CreateProjectDTO } from "../validations/project.dto";
import {
  createProject,
  getProjectsByTeam,
} from "../controllers/project.controller";

const router = express.Router();

// ✅ Create Project (Admin only)
router.post("/", protect, allowRoles("admin"), validateDTO(CreateProjectDTO), createProject);

// ✅ Get All Projects for a Team
router.get("/team/:teamId", protect, getProjectsByTeam);

export default router;
/**
 * @swagger
 * tags:
 *   name: Project
 *   description: Project management APIs
 */

/**
 * @swagger
 * /api/project:
 *   post:
 *     summary: Create a project under a team
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               teamId:
 *                 type: string
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Project created successfully
 */

/**
 * @swagger
 * /api/project/team/{teamId}:
 *   get:
 *     summary: Get all projects under a specific team
 *     tags: [Project]
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
 *         description: List of projects for the team
 */
