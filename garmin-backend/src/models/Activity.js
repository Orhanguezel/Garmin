const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    fileName: { type: String, required: true },
    data: { type: Object, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);
