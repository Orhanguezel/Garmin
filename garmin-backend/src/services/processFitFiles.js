import logger from "../utils/logger.js";
import fs from "fs/promises";
import path from "path";
import { Decoder, Stream } from "@garmin/fitsdk";
import { saveActivitiesToDatabase } from "./saveActivitiesToDatabase.js";

export const processSingleFile = async (filePath) => {
  try {
    logger.info(`Processing file: ${filePath}`);
    const buffer = await fs.readFile(filePath);
    logger.debug(`File ${path.basename(filePath)} read into buffer.`);

    const stream = Stream.fromBuffer(buffer);
    logger.debug(`Stream created for file ${path.basename(filePath)}.`);

    if (!Decoder.isFIT(stream)) {
      logger.error(`File ${path.basename(filePath)} is not a valid FIT file.`);
      return null;
    }

    const decoder = new Decoder(stream);
    logger.debug(`Decoder initialized for file ${path.basename(filePath)}.`);

    if (!decoder.checkIntegrity()) {
      logger.error(`File ${path.basename(filePath)} failed integrity check.`);
      return null;
    }

    const { messages, errors } = decoder.read();
    logger.info(
      `File ${path.basename(
        filePath
      )} successfully decoded. Available message types: ${Object.keys(
        messages
      ).join(", ")}`
    );

    if (errors.length > 0) {
      logger.warn(`Errors found in file ${path.basename(filePath)}:`, errors);
    }

    let activities = [];

    // Process `record` messages
    if (messages.record && Array.isArray(messages.record)) {
      logger.debug(
        `Processing ${
          messages.record.length
        } 'record' messages in file ${path.basename(filePath)}.`
      );
      activities.push(
        ...messages.record.map((record) => ({
          timestamp: record.timestamp || null,
          distance: record.distance || null,
          speed: record.enhanced_speed || null,
          heart_rate: record.heart_rate || null,
          calories: record.calories || null,
          temperature: record.temperature || null, // Eklenen veri
        }))
      );
      logger.debug(`'record' message processing completed.`);
    }

    // Ek veri işleme: Eğer record boşsa diğer mesajları işle
    const messageProcessors = {
      lap: (lap) => ({
        timestamp: lap.timestamp || null,
        total_distance: lap.total_distance || null,
        avg_speed: lap.avg_speed || null,
        calories: lap.total_calories || null,
      }),
      session: (session) => ({
        timestamp: session.timestamp || null,
        avg_heart_rate: session.avg_heart_rate || null,
        max_heart_rate: session.max_heart_rate || null,
        total_distance: session.total_distance || null,
        total_calories: session.total_calories || null,
      }),
      activity: (activity) => ({
        timestamp: activity.timestamp || null,
        total_timer_time: activity.total_timer_time || null,
        num_sessions: activity.num_sessions || null,
      }),
      length: (length) => ({
        timestamp: length.timestamp || null,
        total_strokes: length.total_strokes || null,
        avg_speed: length.avg_speed || null,
        swim_stroke: length.swim_stroke || null,
      }),
      deviceInfo: (deviceInfo) => ({
        timestamp: deviceInfo.timestamp || null,
        battery_status: deviceInfo.battery_status || null,
        device_index: deviceInfo.device_index || null,
      }),
    };

    Object.keys(messageProcessors).forEach((messageType) => {
      if (messages[messageType]) {
        logger.debug(
          `Processing ${
            messages[messageType].length
          } '${messageType}' messages in file ${path.basename(filePath)}.`
        );
        activities.push(
          ...messages[messageType]
            .map(messageProcessors[messageType])
            .filter((activity) => activity.timestamp)
        );
        logger.debug(`'${messageType}' message processing completed.`);
      }
    });

    if (activities.length === 0) {
      logger.warn(
        `No valid activities found in file ${path.basename(filePath)}.`
      );
    } else {
      logger.info(
        `File ${path.basename(
          filePath
        )} processed successfully. Valid activities: ${activities.length}`
      );
    }

    return activities;
  } catch (error) {
    logger.error(
      `Error processing file ${path.basename(filePath)}: ${error.message}`
    );
    return null;
  }
};

export const processAllFiles = async (directoryPath) => {
  try {
    logger.info(`Reading directory: ${directoryPath}`);
    const files = await fs.readdir(directoryPath);
    logger.debug(`Files found in directory: ${files.join(", ")}`);

    const fitFiles = files.filter((file) => file.endsWith(".fit"));
    logger.info(`${fitFiles.length} .fit files found in directory.`);

    if (fitFiles.length === 0) {
      logger.warn("No .fit files found in directory.");
      return [];
    }

    const results = [];
    for (const file of fitFiles) {
      const filePath = path.join(directoryPath, file);
      logger.info(`Starting processing for file: ${file}`);

      const activities = await processSingleFile(filePath);

      if (activities && activities.length > 0) {
        await saveActivitiesToDatabase(activities);
        results.push({
          file,
          status: "success",
          activityCount: activities.length,
        });
        logger.info(
          `File ${file} processed successfully. Activities saved to database.`
        );
      } else {
        results.push({ file, status: "no valid activities" });
        logger.warn(`File ${file} contains no valid activities.`);
      }
    }

    logger.info(
      `Processing completed. Total files processed: ${
        fitFiles.length
      }, Successful: ${
        results.filter((r) => r.status === "success").length
      }, No valid activities: ${
        results.filter((r) => r.status === "no valid activities").length
      }.`
    );
    return results;
  } catch (error) {
    logger.error(`Error processing files: ${error.message}`);
    throw error;
  }
};
