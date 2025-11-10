import express from "express";
import { protect } from "../middlewares/auth.middleware";
import { allowRoles } from "../middlewares/role.middleware";
import { validateDTO } from "../middlewares/validate.middleware";
import {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
} from "../controllers/task.controller";
import { CreateTaskDTO, UpdateTaskDTO } from "../validations/task.dto";

const router = express.Router();

// ✅ Create task (Admin / Member)
router.post("/", protect, validateDTO(CreateTaskDTO), createTask);

// ✅ Get all tasks for a project
router.get("/project/:projectId", protect, getTasksByProject);

// ✅ Update task
router.patch("/:taskId", protect, validateDTO(UpdateTaskDTO), updateTask);

// ✅ Delete task (Admin only)
router.delete("/:taskId", protect, allowRoles("admin"), deleteTask);

export default router;
/**
 * @swagger
 * tags:
 *   name: Task
 *   description: Task management APIs
 */

/**
 * @swagger
 * /api/task:
 *   post:
 *     summary: Create a new task (Admin only)
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
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high]
 *               assignedTo:
 *                 type: string
 *     responses:
 *       201:
 *         description: Task created successfully
 */

/**
 * @swagger
 * /api/task/project/{projectId}:
 *   get:
 *     summary: Get tasks for a specific project
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
 *         description: List of tasks
 */

/**
 * @swagger
 * /api/task/{taskId}:
 *   patch:
 *     summary: Update a task (admin, creator, or assignee)
 *     tags: [Task]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: taskId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               priority:
 *                 type: string
 *               assignedTo:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [todo, in-progress, done]
 *     responses:
 *       200:
 *         description: Task updated successfully
 */

/**
 * @swagger
 * /api/task/{taskId}:
 *   delete:
 *     summary: Delete a task (admin or creator only)
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
