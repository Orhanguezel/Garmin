import Activity from '../models/Activity.js';
import logger from "../utils/logger.js";

export const storeActivity = async (activities) => {
    try {
        const timestamps = activities.map(activity => activity.timestamp);
        const existingActivities = await Activity.find({ timestamp: { $in: timestamps } });
        const existingTimestamps = new Set(existingActivities.map(a => a.timestamp));

        const newActivities = activities.filter(activity => !existingTimestamps.has(activity.timestamp));

        if (newActivities.length > 0) {
            await Activity.insertMany(newActivities);
            console.log(`${newActivities.length} yeni aktivite kaydedildi.`);
        } else {
            console.log('Hiç yeni aktivite bulunamadı.');
        }
    } catch (error) {
        console.error('Veritabanına kaydedilirken hata oluştu:', error.message);
        throw error;
    }
};

