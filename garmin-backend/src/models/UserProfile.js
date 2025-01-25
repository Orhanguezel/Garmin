import mongoose from "mongoose";

const UserProfileSchema = new mongoose.Schema({
  gender: { type: String, enum: ["male", "female"], required: true },
  weight: { type: Number, required: true },
  age: { type: Number, required: true },
});

export default mongoose.model("UserProfile", UserProfileSchema);
