import fs from "fs/promises";
import path from "path";
import Activity from "../models/Activity.js";
import logger from "../utils/logger.js";

/**
 * Save JSON data to MongoDB from a directory.
 * @param {string} jsonDirPath - Path to the directory containing JSON files.
 */
export const saveActivitiesToDatabase = async (jsonDirPath) => {
  try {
    logger.info(`Reading JSON files from directory: ${jsonDirPath}`);

    const files = await fs.readdir(jsonDirPath);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    if (jsonFiles.length === 0) {
      logger.warn("No JSON files found in the directory.");
      return;
    }

    for (const file of jsonFiles) {
      const filePath = path.join(jsonDirPath, file);
      logger.info(`Processing JSON file: ${file}`);

      try {
        const jsonData = JSON.parse(await fs.readFile(filePath, "utf-8"));

        if (!Array.isArray(jsonData.messages?.record)) {
          logger.warn(`File ${file} does not contain valid 'record' messages.`);
          continue;
        }

        const activities = jsonData.messages.record.map((record) => ({
          timestamp: record.timestamp || null,
          distance: record.distance || 0,
          speed: record.enhanced_speed || 0,
          heart_rate: record.heart_rate || 0,
          calories: record.calories || 0,
        }));

        if (activities.length === 0) {
          logger.warn(`No valid activities found in file: ${file}`);
          continue;
        }

        // Perform a bulkWrite operation for better performance
        const bulkOps = activities.map((activity) => ({
          updateOne: {
            filter: { timestamp: activity.timestamp },
            update: { $set: activity },
            upsert: true,
          },
        }));

        const result = await Activity.bulkWrite(bulkOps);
        logger.info(
          `Processed file: ${file} | Matched: ${result.matchedCount}, Inserted: ${result.upsertedCount}, Modified: ${result.modifiedCount}`
        );
      } catch (fileError) {
        logger.error(`Error processing JSON file ${file}: ${fileError.message}`);
      }
    }

    logger.info("All JSON files have been processed and data saved to MongoDB.");
  } catch (error) {
    logger.error(`Error saving JSON data to MongoDB: ${error.message}`);
  }
};

// Test the function by running it with the appropriate JSON directory path
(async () => {
  const jsonDirPath = "/home/orhan/Dokumente/Garmin/garmin-backend/output/json";
  await saveActivitiesToDatabase(jsonDirPath);
})();
