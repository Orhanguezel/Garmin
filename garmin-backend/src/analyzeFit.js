// Required Modules
const fs = require('fs');
const path = require('path');
const fitParser = require('fit-file-parser').default;
const mongoose = require('mongoose');
const express = require('express');
const app = express();

// MongoDB Connection
mongoose.connect('mongodb://localhost:27017/garminActivities', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected')).catch(err => console.error('MongoDB connection error:', err));

// MongoDB Schema
const activitySchema = new mongoose.Schema({
    timestamp: Date,
    elapsed_time: Number,
    timer_time: Number,
    position_lat: Number,
    position_long: Number,
    distance: Number,
    enhanced_speed: Number,
    enhanced_altitude: Number,
    heart_rate: Number,
    cadence: Number,
    temperature: Number,
    fractional_cadence: Number,
    device_info: Array,
    events: Array,
    sport: Object
});

const Activity = mongoose.model('Activity', activitySchema);

// Directory Path for .fit Files
const fitDir = '/run/user/1000/gvfs/mtp:host=091e_4cda_0000c560c82c/Primary/GARMIN/Activity';

// Function to Process All .fit Files
const processFitFiles = () => {
    fs.readdir(fitDir, (err, files) => {
        if (err) return console.error('Error reading directory:', err);

        files.filter(file => path.extname(file) === '.fit').forEach(file => {
            const filePath = path.join(fitDir, file);

            fs.readFile(filePath, (err, data) => {
                if (err) return console.error('Error reading file:', err);

                const fitParserInstance = new fitParser();

                fitParserInstance.parse(data, (error, result) => {
                    if (error) return console.error('Error parsing .fit file:', error);

                    const activities = result.records.map(record => ({
                        timestamp: record.timestamp,
                        elapsed_time: record.elapsed_time,
                        timer_time: record.timer_time,
                        position_lat: record.position_lat,
                        position_long: record.position_long,
                        distance: record.distance,
                        enhanced_speed: record.enhanced_speed,
                        enhanced_altitude: record.enhanced_altitude,
                        heart_rate: record.heart_rate,
                        cadence: record.cadence,
                        temperature: record.temperature,
                        fractional_cadence: record.fractional_cadence,
                        device_info: result.device_infos,
                        events: result.events,
                        sport: result.sports[0]
                    }));

                    Activity.insertMany(activities, (err) => {
                        if (err) console.error('Error saving to MongoDB:', err);
                        else console.log(`Processed and saved activities from ${file}`);
                    });
                });
            });
        });
    });
};

// API Routes
app.get('/activities', async (req, res) => {
    try {
        const activities = await Activity.find();
        res.json(activities);
    } catch (err) {
        res.status(500).send('Error fetching activities');
    }
});

app.get('/activities/:id', async (req, res) => {
    try {
        const activity = await Activity.findById(req.params.id);
        res.json(activity);
    } catch (err) {
        res.status(500).send('Error fetching activity');
    }
});

app.get('/device-info', async (req, res) => {
    try {
        const deviceInfo = await Activity.find().select('device_info');
        res.json(deviceInfo);
    } catch (err) {
        res.status(500).send('Error fetching device info');
    }
});

// Start Server
app.listen(3000, () => {
    console.log('Server running on port 3000');
    processFitFiles(); // Process .fit files on server start
});
