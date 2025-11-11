import express from "express";
import { protect } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import { validateDTO } from "../middlewares/validate.middleware";
import { CreateProjectDTO } from "../validations/project.dto";
import { createProject, getProjectsByTeam } from "../controllers/project.controller";

const router = express.Router();

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
 *     summary: Create a new project under a team
 *     description: Accessible by **admins** only.
 *     tags: [Project]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [teamId, name]
 *             properties:
 *               teamId:
 *                 type: string
 *                 example: 672d2a4b25b1b38e78b2a89c
 *               name:
 *                 type: string
 *                 example: Website Redesign
 *               description:
 *                 type: string
 *                 example: Overhaul the marketing website
 *     responses:
 *       201:
 *         description: Project created successfully
 *       403:
 *         description: Forbidden (Members cannot create projects)
 */

/**
 * @swagger
 * /api/project/team/{teamId}:
 *   get:
 *     summary: Get all projects under a specific team
 *     description: Accessible by **both admins and members**.
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
 *         description: Projects fetched successfully
 */

router.post("/", protect, allowRoles("admin"), validateDTO(CreateProjectDTO), createProject);
router.get("/team/:teamId", protect, getProjectsByTeam);

export default router;
