import logger from "../utils/logger.js";
import fs from "fs/promises";
import path from "path";
import { Decoder, Stream } from "@garmin/fitsdk";

export const convertFitToJson = async (filePath, outputDir) => {
  try {
    logger.info(`Processing FIT file: ${filePath}`);

    const buffer = await fs.readFile(filePath);
    const stream = Stream.fromBuffer(buffer);

    if (!Decoder.isFIT(stream)) {
      logger.error(`File ${path.basename(filePath)} is not a valid FIT file.`);
      return;
    }

    const decoder = new Decoder(stream);
    if (!decoder.checkIntegrity()) {
      logger.error(`File ${path.basename(filePath)} failed integrity check.`);
      return;
    }

    const { messages, errors } = decoder.read();

    // Log all message types and their counts
    Object.entries(messages).forEach(([messageType, messageData]) => {
      logger.info(
        `Message Type: ${messageType}, Count: ${
          Array.isArray(messageData) ? messageData.length : 1
        }`
      );
    });

    if (!messages.record) {
      logger.warn(`No 'record' messages found in file: ${path.basename(filePath)}`);
    }

    const jsonOutput = {
      fileName: path.basename(filePath),
      messages,
    };

    const outputFilePath = path.join(outputDir, `${path.basename(filePath, ".fit")}.json`);
    await fs.writeFile(outputFilePath, JSON.stringify(jsonOutput, null, 2));
    logger.info(`Saved JSON file: ${outputFilePath}`);
  } catch (error) {
    logger.error(`Error processing FIT file ${filePath}: ${error.message}`);
  }
};

export const convertAllFitToJson = async (inputDir, outputDir) => {
  try {
    logger.info(`Reading FIT files from directory: ${inputDir}`);

    const files = await fs.readdir(inputDir);
    const fitFiles = files.filter((file) => file.endsWith(".fit"));

    if (fitFiles.length === 0) {
      logger.warn(`No FIT files found in directory: ${inputDir}`);
      return;
    }

    await fs.mkdir(outputDir, { recursive: true });
    logger.info(`Output directory ensured: ${outputDir}`);

    for (const file of fitFiles) {
      const filePath = path.join(inputDir, file);
      await convertFitToJson(filePath, outputDir);
    }

    logger.info(`All FIT files have been processed and saved to JSON.`);
  } catch (error) {
    logger.error(`Error processing FIT files: ${error.message}`);
  }
};


// Test the function by running it with appropriate input and output paths
(async () => {
  const inputDir = "/home/orhan/Dokumente/Garmin/garmin-backend/input";
  const outputDir = "/home/orhan/Dokumente/Garmin/garmin-backend/output/json";

  await convertAllFitToJson(inputDir, outputDir);
})();
