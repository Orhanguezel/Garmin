import chokidar from "chokidar";
import { processSingleFile } from "../services/processFitFiles.js";
import { processAllActivities } from "../controllers/activitiesController.js";
import logger from "./logger.js";
import path from "path";

// .fit ve JSON dosyaları için dizinler
const FIT_FILES_DIR = path.resolve("/home/orhan/Dokumente/Garmin/garmin-backend/input");
const JSON_FILES_DIR = path.resolve("/home/orhan/Dokumente/Garmin/garmin-backend/output/json");

// .fit dosyalarını izleme
const watchFitFiles = () => {
  const fitWatcher = chokidar.watch(FIT_FILES_DIR, { persistent: true });

  fitWatcher
    .on("add", async (filePath) => {
      logger.info(`Yeni .fit dosyası bulundu: ${filePath}`);
      try {
        await processSingleFile(filePath);
        logger.info(`.fit dosyası JSON'a dönüştürüldü: ${filePath}`);
      } catch (error) {
        logger.error(`.fit dosyası işlenirken hata oluştu: ${error.message}`);
      }
    })
    .on("change", async (filePath) => {
      logger.info(`.fit dosyası güncellendi: ${filePath}`);
      try {
        await processSingleFile(filePath);
        logger.info(`Güncellenen .fit dosyası tekrar JSON'a dönüştürüldü: ${filePath}`);
      } catch (error) {
        logger.error(`.fit dosyası güncellenirken hata oluştu: ${error.message}`);
      }
    });
};

// JSON dosyalarını izleme
const watchJsonFiles = () => {
  const jsonWatcher = chokidar.watch(JSON_FILES_DIR, { persistent: true });

  jsonWatcher
    .on("add", async (filePath) => {
      logger.info(`Yeni JSON dosyası bulundu: ${filePath}`);
      try {
        await processAllActivities();
        logger.info(`Yeni JSON dosyası veritabanına işlendi: ${filePath}`);
      } catch (error) {
        logger.error(`JSON dosyası işlenirken hata oluştu: ${error.message}`);
      }
    })
    .on("change", async (filePath) => {
      logger.info(`JSON dosyası güncellendi: ${filePath}`);
      try {
        await processAllActivities();
        logger.info(`Güncellenen JSON dosyası veritabanına işlendi: ${filePath}`);
      } catch (error) {
        logger.error(`Güncellenen JSON dosyası işlenirken hata oluştu: ${error.message}`);
      }
    });
};

// İzleme mekanizmasını başlat
const startWatching = () => {
  logger.info("FIT ve JSON dosyaları izleniyor...");
  watchFitFiles();
  watchJsonFiles();
};

export default startWatching;
