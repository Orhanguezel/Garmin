import mongoose from "mongoose";
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => `[${timestamp}] ${level}: ${message}`)
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "logs/database.log" })
  ]
});

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect(process.env.MONGO_URI || "mongodb://localhost:27017/garminDB", {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 30000, // Bağlantı seçim zaman aşımı
        socketTimeoutMS: 60000, // Soket zaman aşımı
        maxPoolSize: 50, // Maksimum bağlantı sayısı
        minPoolSize: 10 // Minimum bağlantı sayısı
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

export default connectDB;
