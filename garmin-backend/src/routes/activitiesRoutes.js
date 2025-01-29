import express from "express";
import {
  processActivity,
  processAllActivities,
} from "../controllers/activitiesController.js"; // activitiesController kullanımı

const router = express.Router();

// Belirli bir FIT dosyasını işle
router.get("/activity/:fileName", processActivity);

// Tüm FIT dosyalarını işle
router.get("/activities", processAllActivities);

export default router;



