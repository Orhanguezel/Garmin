import mongoose from 'mongoose';

const activitySchema = new mongoose.Schema({
  timestamp: { type: Date, required: true },
  heartRate: { type: Number, required: false },
  distance: { type: Number, required: false },
  speed: { type: Number, required: false },
  calories: { type: Number, required: false },
});

export default mongoose.model('Activity', activitySchema);


