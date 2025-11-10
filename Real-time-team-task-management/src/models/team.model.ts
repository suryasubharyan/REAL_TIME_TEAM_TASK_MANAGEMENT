import mongoose, { Document } from "mongoose";

interface IMember {
  user: mongoose.Types.ObjectId;
  role: "admin" | "member";
}

export interface ITeam extends Document {
  name: string;
  description?: string;
  code: string;
  members: IMember[];
}

const teamSchema = new mongoose.Schema<ITeam>(
  {
    name: { type: String, required: true },
    description: String,
    code: { type: String, unique: true },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        role: { type: String, enum: ["admin", "member"] },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model<ITeam>("Team", teamSchema);
