import mongoose from "mongoose";

const activitySchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  distance: { type: Number, default: null },
  speed: { type: Number, default: null },
  heart_rate: { type: Number, default: null },
  calories: { type: Number, default: null },
  total_distance: { type: Number, default: null },
  avg_speed: { type: Number, default: null },
  max_heart_rate: { type: Number, default: null },
  total_calories: { type: Number, default: null },
  total_timer_time: { type: Number, default: null },
  num_sessions: { type: Number, default: null },
  swim_stroke: { type: String, default: null },
});

const Activity = mongoose.model("Activity", activitySchema);
export default Activity;
