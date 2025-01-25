// Gerekli modülleri içe aktar
import fs from "fs/promises";
import path from "path";
import { processSingleFile } from "../services/processFitFiles.js"; // Doğru fonksiyon ismi
import Activity from "../models/Activity.js";
import { ACTIVITY_FILES_DIR } from "../config/paths.js"; // Merkezi dosya yolu tanımı
import logger from "../utils/logger.js";

// Helper function: Aktiviteleri veritabanına kaydet
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

// Endpoint: Tek bir aktivite dosyasını işle
export const processActivity = async (req, res) => {
  const { fileName } = req.params;
  const filePath = path.join(ACTIVITY_FILES_DIR, fileName); // Merkezi dosya yolunu kullan

  try {
    logger.info("Aktivite dosyası işleniyor", { fileName });
    const activities = await processSingleFile(filePath);

    if (activities && activities.length > 0) {
      await storeActivity(activities);
      return res.status(200).json({
        message: `Aktivite işlendi: ${fileName}`,
        activities,
      });
    } else {
      logger.warn("Dosyada geçerli aktivite bulunamadı", { fileName });
      return res.status(204).json({
        message: `Dosyada geçerli aktivite bulunamadı: ${fileName}`,
      });
    }
  } catch (err) {
    logger.error("Aktivite dosyası işlenirken hata oluştu", { fileName, error: err.message });
    return res.status(500).json({ error: `Dosya işlenirken hata oluştu: ${fileName}` });
  }
};

// Endpoint: Tüm aktivite dosyalarını işle
export const processAllActivities = async (req, res) => {
  try {
    logger.info("Klasör okunuyor", { directory: ACTIVITY_FILES_DIR });
    const files = await fs.readdir(ACTIVITY_FILES_DIR);
    const fitFiles = files.filter((file) => file.endsWith(".fit"));

    if (fitFiles.length === 0) {
      logger.warn("Klasörde .fit dosyası bulunamadı", { directory: ACTIVITY_FILES_DIR });
      return res.status(204).json({ message: "Klasörde .fit dosyası bulunamadı." });
    }

    const processingResults = await Promise.all(
      fitFiles.map(async (fileName) => {
        const filePath = path.join(ACTIVITY_FILES_DIR, fileName);
        try {
          logger.info("Dosya işleniyor", { fileName });
          const activities = await processSingleFile(filePath);

          if (activities && activities.length > 0) {
            await storeActivity(activities);
            logger.info("Dosya işlendi ve kaydedildi", { fileName });
            return { file: fileName, status: "success", activities };
          } else {
            logger.warn("Dosyada geçerli aktivite yok", { fileName });
            return { file: fileName, status: "no valid activities" };
          }
        } catch (err) {
          logger.error("Dosya işlenirken hata oluştu", { fileName, error: err.message });
          return { file: fileName, status: "error", error: err.message };
        }
      })
    );

    logger.info("Tüm dosyalar işlendi", { results: processingResults });
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
