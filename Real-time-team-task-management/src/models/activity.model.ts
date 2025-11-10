import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  team: mongoose.Types.ObjectId;
  actor: mongoose.Types.ObjectId;
  type: string;
  message: string;
  meta?: any;
}

const activitySchema = new Schema<IActivity>(
  {
    team: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    actor: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true }, // e.g., 'task_created'
    message: { type: String, required: true },
    meta: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export default mongoose.model<IActivity>("Activity", activitySchema);
