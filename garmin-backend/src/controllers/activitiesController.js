import fs from "fs/promises";
import path from "path";
import Activity from "../models/Activity.js";
import { JSON_FILES_DIR } from "../config/paths.js";
import logger from "../utils/logger.js";

/**
 * Helper function: Aktiviteleri veritabanına kaydet.
 */
const storeActivity = async (activities) => {
  for (const activity of activities) {
    try {
      if (!activity.timestamp) {
        logger.warn("Zaman damgası olmayan aktivite atlandı", { activity });
        continue;
      }

      const exists = await Activity.findOne({ timestamp: activity.timestamp });
      if (!exists) {
        await Activity.create(activity);
        logger.info("Aktivite başarıyla kaydedildi", { timestamp: activity.timestamp });
      } else {
        logger.info("Aktivite zaten mevcut", { timestamp: activity.timestamp });
      }
    } catch (err) {
      logger.error("Aktivite kaydedilirken hata oluştu", {
        timestamp: activity.timestamp || "bilinmiyor",
        error: err.message,
      });
    }
  }
};

/**
 * Tek bir aktivite dosyasını işle.
 */
export const processActivity = async (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(JSON_FILES_DIR, fileName);

  try {
    logger.info("Aktivite dosyası işleniyor", { fileName });
    const jsonData = JSON.parse(await fs.readFile(filePath, "utf-8"));

    if (jsonData.messages?.record) {
      const activities = jsonData.messages.record.map((record) => ({
        timestamp: record.timestamp || null,
        distance: record.distance || 0,
        speed: record.enhanced_speed || 0,
        heart_rate: record.heart_rate || 0,
        calories: record.calories || 0,
      }));

      if (activities.length > 0) {
        await storeActivity(activities);
        return res.status(200).json({
          message: `Aktivite işlendi: ${fileName}`,
          activities,
        });
      } else {
        logger.warn("Dosyada geçerli aktiviteler bulunamadı", { fileName });
        return res.status(204).json({
          message: `Dosyada geçerli aktiviteler bulunamadı: ${fileName}`,
        });
      }
    } else {
      logger.warn("Dosyada 'record' mesajları bulunamadı", { fileName });
      return res.status(204).json({
        message: `Dosyada 'record' mesajları bulunamadı: ${fileName}`,
      });
    }
  } catch (err) {
    logger.error("Aktivite dosyası işlenirken hata oluştu", { fileName, error: err.message });
    return res.status(500).json({ error: `Dosya işlenirken hata oluştu: ${fileName}` });
  }
};

/**
 * Tüm aktivite dosyalarını işle.
 */
export const processAllActivities = async (req, res) => {
  try {
    logger.info(`JSON dosyaları klasörü okunuyor: ${JSON_FILES_DIR}`);
    const files = await fs.readdir(JSON_FILES_DIR);
    const jsonFiles = files.filter((file) => file.endsWith(".json"));

    if (jsonFiles.length === 0) {
      logger.warn("Klasörde JSON dosyası bulunamadı.", { directory: JSON_FILES_DIR });
      return res.status(204).json({ message: "Klasörde JSON dosyası bulunamadı." });
    }

    const processingResults = await Promise.all(
      jsonFiles.map(async (fileName) => {
        const filePath = path.join(JSON_FILES_DIR, fileName);
        try {
          logger.info("JSON dosyası işleniyor", { fileName });
          const jsonData = JSON.parse(await fs.readFile(filePath, "utf-8"));

          if (jsonData.messages?.record) {
            const activities = jsonData.messages.record.map((record) => ({
              timestamp: record.timestamp || null,
              distance: record.distance || 0,
              speed: record.enhanced_speed || 0,
              heart_rate: record.heart_rate || 0,
              calories: record.calories || 0,
            }));

            if (activities.length > 0) {
              await Activity.insertMany(activities, { ordered: false });
              logger.info(`Dosya işlendi ve kaydedildi: ${fileName}`);
              return { file: fileName, status: "success", activities };
            } else {
              logger.warn(`Dosyada geçerli aktiviteler bulunamadı: ${fileName}`);
              return { file: fileName, status: "no valid activities" };
            }
          } else {
            logger.warn(`Dosyada 'record' mesajları bulunamadı: ${fileName}`);
            return { file: fileName, status: "no record messages" };
          }
        } catch (err) {
          logger.error("Dosya işlenirken hata oluştu", { fileName, error: err.message });
          return { file: fileName, status: "error", error: err.message };
        }
      })
    );

    logger.info("Tüm JSON dosyaları işlendi.", { results: processingResults });
    return res.status(200).json({
      message: "Tüm aktiviteler işlendi.",
      results: processingResults,
    });
  } catch (err) {
    logger.error("Tüm aktiviteler işlenirken hata oluştu", { error: err.message });
    return res.status(500).json({
      error: "Tüm aktiviteler işlenirken bir hata oluştu.",
    });
  }
};
