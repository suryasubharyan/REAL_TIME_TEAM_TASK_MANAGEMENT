import express from "express";
import { register, login } from "../controllers/auth.controller";
import { validateDTO } from "../middlewares/validate.middleware";
import { RegisterDTO, LoginDTO } from "../validations/auth.dto";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: User registration and login APIs
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     description: Both admins and members can register new accounts.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, email, password, role]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Riya Sharma
 *               email:
 *                 type: string
 *                 example: riya@example.com
 *               password:
 *                 type: string
 *                 example: myStrongPassword123
 *               role:
 *                 type: string
 *                 enum: [admin, member]
 *     responses:
 *       201:
 *         description: User registered successfully
 *         content:
 *           application/json:
 *             example:
 *               user:
 *                 _id: 64f0a0bcb8a27c1d4ef45678
 *                 name: Riya Sharma
 *                 email: riya@example.com
 *                 role: member
 *               token: "eyJhbGciOiJIUzI1NiIs..."
 *       400:
 *         description: User already exists
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     description: Returns JWT token for authentication (for both admin and member).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: riya@example.com
 *               password:
 *                 type: string
 *                 example: myStrongPassword123
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             example:
 *               user:
 *                 _id: 64f0a0bcb8a27c1d4ef45678
 *                 name: Riya Sharma
 *                 email: riya@example.com
 *                 role: admin
 *               token: "eyJhbGciOiJIUzI1NiIs..."
 *       401:
 *         description: Invalid credentials
 */

router.post("/register", validateDTO(RegisterDTO), register);
router.post("/login", validateDTO(LoginDTO), login);

export default router;
