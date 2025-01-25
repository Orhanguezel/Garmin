import mongoose from "mongoose";

const SessionSchema = new mongoose.Schema({
  startTime: { type: Date, required: true },
  totalCalories: { type: Number, default: 0 },
  totalDistance: { type: Number, default: 0 },
});

export default mongoose.model("Session", SessionSchema);
