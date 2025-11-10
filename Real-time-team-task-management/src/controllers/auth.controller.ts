import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/user.model";

const generateToken = (id: string) =>
  jwt.sign({ id }, process.env.JWT_SECRET!, { expiresIn: "30d" });

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const exist = await User.findOne({ email });
    if (exist) return res.status(400).json({ message: "User already exists" });

    const user = await User.create({ name, email, password, role });
    const token = generateToken(user._id.toString());
    res.status(201).json({ user, token });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid credentials" });

    const token = generateToken(user._id.toString());
    res.json({ user, token });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
};
