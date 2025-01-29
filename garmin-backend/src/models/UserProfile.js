import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema({
  gender: { type: String, enum: ["male", "female"], required: true },
  weight: { type: Number, required: true },
  height: { type: Number, required: true },
  restingHeartRate: { type: Number, default: 0 },
});

export default mongoose.model("UserProfile", UserProfileSchema);
