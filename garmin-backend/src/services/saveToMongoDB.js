import mongoose from "mongoose";
import winston from "winston";
import fs from "fs/promises";
import path from "path";
import Activity from "../models/Activity.js";
import HeartRate from "../models/HeartRate.js";
import Session from "../models/Session.js";
import UserProfile from "../models/UserProfile.js";

// Logger yapılandırması
const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(
      ({ level, message, timestamp }) => `[${timestamp}] ${level.toUpperCase()}: ${message}`
    )
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/database.log" })
  ]
});

// MongoDB bağlantısı
const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/garminDB", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 60000,
        maxPoolSize: 50,
        minPoolSize: 10
      });
      logger.info("MongoDB bağlantısı başarılı!");
    } else {
      logger.info("MongoDB zaten bağlı.");
    }
  } catch (err) {
    logger.error(`MongoDB bağlantı hatası: ${err.message}`);
    process.exit(1);
  }
};

// Batch insert işlemi için yardımcı fonksiyon
const batchInsert = async (Model, data, batchSize = 500) => {
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    try {
      await Model.insertMany(batch, { ordered: false });
    } catch (error) {
      logger.error(`Batch insert error: ${error.message}`);
    }
  }
};

// JSON verilerini MongoDB'ye kaydetme
export const saveToMongoDB = async (jsonDir) => {
  try {
    logger.info(`Starting saveToMongoDB service...`);

    logger.info(`Reading JSON files from directory: ${jsonDir}`);
    const files = await fs.readdir(jsonDir);

    const jsonFiles = files.filter((file) => file.endsWith(".json"));
    if (jsonFiles.length === 0) {
      logger.warn("No JSON files found in the directory.");
      return;
    }

    for (const file of jsonFiles) {
      const filePath = path.join(jsonDir, file);
      logger.info(`Processing JSON file: ${file}`);
      let jsonData;

      try {
        jsonData = JSON.parse(await fs.readFile(filePath, "utf-8"));
      } catch (parseError) {
        logger.error(`Error parsing JSON file ${file}: ${parseError.message}`);
        continue;
      }

      if (!jsonData.messages) {
        logger.warn(`No 'messages' field found in file: ${file}`);
        continue;
      }

      // Save activities
      if (jsonData.messages.recordMesgs) {
        logger.info(`Saving activities from file: ${file}`);
        const activities = jsonData.messages.recordMesgs.map((record) => ({
          timestamp: record.timestamp || null,
          heartRate: record.heartRate || null,
          distance: record.distance || null,
          speed: record.enhancedSpeed || null,
          calories: record.calories || null
        }));

        await batchInsert(Activity, activities);
        logger.info(`Activities saved from file: ${file}`);
      } else {
        logger.warn(`No activity data found in file: ${file}`);
      }

      // Save heart rate data
      if (jsonData.messages.heartRateMesgs) {
        logger.info(`Saving heart rate data from file: ${file}`);
        const heartRates = jsonData.messages.heartRateMesgs.map((hr) => ({
          timestamp: hr.timestamp || null,
          heartRate: hr.heartRate || null
        }));

        await batchInsert(HeartRate, heartRates);
        logger.info(`Heart rate data saved from file: ${file}`);
      } else {
        logger.warn(`No heart rate data found in file: ${file}`);
      }

      // Save session data
      if (jsonData.messages.sessionMesgs) {
        logger.info(`Saving session data from file: ${file}`);
        const sessions = jsonData.messages.sessionMesgs.map((session) => ({
          startTime: session.startTime || null,
          totalCalories: session.totalCalories || null,
          totalDistance: session.totalDistance || null
        }));

        await batchInsert(Session, sessions);
        logger.info(`Session data saved from file: ${file}`);
      } else {
        logger.warn(`No session data found in file: ${file}`);
      }

      // Save user profile data
      if (jsonData.messages.userProfileMesgs) {
        logger.info(`Saving user profile data from file: ${file}`);
        const userProfiles = jsonData.messages.userProfileMesgs.map((profile) => ({
          gender: profile.gender || null,
          weight: profile.weight || null,
          height: profile.height || null,
          restingHeartRate: profile.restingHeartRate || null
        }));

        await batchInsert(UserProfile, userProfiles);
        logger.info(`User profile data saved from file: ${file}`);
      } else {
        logger.warn(`No user profile data found in file: ${file}`);
      }
    }

    logger.info("All JSON files have been processed and data saved to MongoDB.");
  } catch (error) {
    logger.error(`Error saving data to MongoDB: ${error.message}`);
  }
};

// Uygulama çalıştırma
(async () => {
  await connectDB();
  const jsonDirectory = path.resolve("./output/json"); // JSON dosyalarının olduğu klasör
  await saveToMongoDB(jsonDirectory);
})();
