const { processFitFile } = require('./utils/processFitFiles');

(async () => {
  const filePath = '/run/user/1000/gvfs/mtp:host=091e_4cda_0000c560c82c/Primary/GARMIN/Activity/2024-02-19-18-21-58.fit';
  try {
    const result = await processFitFile(filePath);
    console.log(result);
  } catch (error) {
    console.error('Hata:', error.message);
  }
})();


