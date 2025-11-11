import express from "express";
import { protect } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import { validateDTO } from "../middlewares/validate.middleware";
import { createTask, getTasksByProject, updateTask, deleteTask } from "../controllers/task.controller";
import { CreateTaskDTO, UpdateTaskDTO } from "../validations/task.dto";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Task
 *   description: Task creation, updates, and deletion
 */

/**
 * @swagger
 * /api/task:
 *   post:
 *     summary: Create a new task under a project
 *     description: Accessible by **admins** only.
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [projectId, title]
 *             properties:
 *               projectId:
 *                 type: string
 *               title:
 *                 type: string
 *                 example: Setup CI/CD pipeline
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *     responses:
 *       201:
 *         description: Task created successfully
 */

/**
 * @swagger
 * /api/task/project/{projectId}:
 *   get:
 *     summary: Get all tasks for a project
 *     description: Accessible by **admins** (see all) and **members** (only their assigned or created tasks).
 *     tags: [Task]
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
 *         description: Tasks fetched successfully
 */

/**
 * @swagger
 * /api/task/{taskId}:
 *   patch:
 *     summary: Update task details or status
 *     description: Accessible by **admins**, **creator**, or **assignee**.
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task updated successfully
 */

/**
 * @swagger
 * /api/task/{taskId}:
 *   delete:
 *     summary: Delete a task
 *     description: Accessible by **admins** or **task creator**.
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task deleted successfully
 */

router.post("/", protect, validateDTO(CreateTaskDTO), createTask);
router.get("/project/:projectId", protect, getTasksByProject);
router.patch("/:taskId", protect, validateDTO(UpdateTaskDTO), updateTask);
router.delete("/:taskId", protect, allowRoles("admin"), deleteTask);

export default router;
