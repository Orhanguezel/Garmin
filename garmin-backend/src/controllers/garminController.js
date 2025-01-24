
const { processFitFile } = require('../utils/processFitFiles');

// Belirli bir FIT dosyasını işleyen kontrolcü
exports.processActivity = async (req, res) => {
  const { fileName } = req.params;
  const filePath = `/run/user/1000/gvfs/mtp:host=091e_4cda_0000c560c82c/Primary/GARMIN/Activity/${fileName}`;
  console.log(`Process activity için filePath: ${filePath}`);

  try {
    const data = await processFitFile(filePath);
    console.log(`Başarılı analiz: ${JSON.stringify(data)}`);
    res.status(200).json(data);
  } catch (error) {
    console.error(`Hata oluştu: ${error.message}`);
    res.status(500).json({ error: error.message });
  }
};


// Tüm FIT dosyalarını işleyen kontrolcü
exports.processAllActivities = async (req, res) => {
  const directoryPath = `/run/user/1000/gvfs/mtp:host=091e_4cda_0000c560c82c/Primary/GARMIN/Activity`;

  try {
    const files = await fs.promises.readdir(directoryPath);
    const fitFiles = files.filter((file) => file.endsWith('.fit'));

    const results = [];
    for (const file of fitFiles) {
      const data = await processFitFile(`${directoryPath}/${file}`);
      results.push({ fileName: file, data });
    }

    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
