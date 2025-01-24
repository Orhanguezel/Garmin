const express = require('express');

// Doğru controller fonksiyonlarını içe aktarın
const { processActivity, processAllActivities } = require('../controllers/garminController');

const router = express.Router();

// Belirli bir FIT dosyasını işle
router.get('/activity/:fileName', processActivity);

// Tüm aktiviteleri işle ve listele
router.get('/activities', processAllActivities);

module.exports = router;

