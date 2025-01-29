import mongoose from "mongoose";

const ActivitySchema = new mongoose.Schema({
  timestamp: { type: Date, required: true, unique: true },
  distance: { type: Number, default: 0 },
  speed: { type: Number, default: 0 },
  heart_rate: { type: Number, default: 0 },
  calories: { type: Number, default: 0 },
});

export default mongoose.model("Activity", ActivitySchema);
