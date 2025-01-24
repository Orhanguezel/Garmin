const FitParser = require('fit-file-parser').default;
const fs = require('fs/promises');

exports.processFitFile = async (filePath) => {
  try {
    // Dosyayı oku
    const content = await fs.readFile(filePath);

    // FitParser yapılandırması
    const fitParser = new FitParser({
      force: true,
      speedUnit: 'km/h',
      lengthUnit: 'km',
      temperatureUnit: 'celsius',
      pressureUnit: 'bar',
      elapsedRecordField: true,
      mode: 'cascade',
    });

    // Parse işlemi
    return new Promise((resolve, reject) => {
      fitParser.parse(content, (error, data) => {
        if (error) {
          reject(new Error(`Parse error: ${error.message}`));
        } else {
          resolve(data);
        }
      });
    });
  } catch (error) {
    throw new Error(`File read error: ${error.message}`);
  }
};
