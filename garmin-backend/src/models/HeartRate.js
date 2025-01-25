import mongoose from "mongoose";

const HeartRateSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true, unique: true },
  heartRate: { type: Number, required: true },
});

export default mongoose.model("HeartRate", HeartRateSchema);
