import { saveJsonToDatabase } from "../services/saveActivitiesToDatabase.js";
import connectDB from "../config/connectDB.js";

const start = async () => {
  try {
    // Veritabanına bağlan
    await connectDB();
    console.log("MongoDB connected.");

    // JSON dosyalarını MongoDB'ye aktar
    const jsonDirPath =
      "/home/orhan/Dokumente/Garmin/garmin-backend/output/json";
    await saveJsonToDatabase(jsonDirPath);

    console.log("JSON data saved to MongoDB successfully.");
    process.exit(0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};

start();
