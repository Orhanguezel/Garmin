const fs = require('fs');
const path = require('path');
const FitParser = require('fit-file-parser').default;

// Tek bir FIT dosyasını işle
exports.parseFitFile = (filePath) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, (err, data) => {
            if (err) {
                return reject(`Dosya okunamadı: ${filePath}`);
            }

            const fitParser = new FitParser({
                force: true,
                speedUnit: 'km/h',
                lengthUnit: 'km',
                temperatureUnit: 'celsius',
                elapsedRecordField: true,
            });

            fitParser.parse(data, (error, result) => {
                if (error) {
                    return reject(`FIT dosyası işlenemedi: ${filePath}`);
                }

                resolve(result);
            });
        });
    });
};

// Tüm FIT dosyalarını işle
exports.getAllFitFiles = (directoryPath) => {
    return new Promise((resolve, reject) => {
        fs.readdir(directoryPath, async (err, files) => {
            if (err) {
                return reject('Klasör okunamadı.');
            }

            const fitFiles = files.filter(file => file.endsWith('.fit'));
            const results = [];

            for (const file of fitFiles) {
                const filePath = path.join(directoryPath, file);
                try {
                    const activityData = await exports.parseFitFile(filePath);
                    results.push({
                        fileName: file,
                        data: activityData,
                    });
                } catch (error) {
                    console.error(`Hata: ${file}`, error);
                }
            }

            resolve(results);
        });
    });
};

