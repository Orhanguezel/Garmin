import logger from "../utils/logger.js";
import fs from "fs/promises";
import path from "path";
import { Decoder, Stream } from "@garmin/fitsdk";

export const testFitFile = async (filePath) => {
  try {
    logger.info(`Testing FIT file: ${filePath}`);
    const buffer = await fs.readFile(filePath);
    const stream = Stream.fromBuffer(buffer);

    if (!Decoder.isFIT(stream)) {
      logger.error(`File ${path.basename(filePath)} is not a valid FIT file.`);
      return null;
    }

    const decoder = new Decoder(stream);
    const { messages } = decoder.read();
    logger.info(`Decoded message types: ${Object.keys(messages).join(", ")}`);
    logger.debug(`Messages content: ${JSON.stringify(messages, null, 2)}`);
    return messages;
  } catch (error) {
    logger.error(`Error testing FIT file ${filePath}: ${error.message}`);
    return null;
  }
};
