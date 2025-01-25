const fs = require('fs');
const { fit2json } = require('fit-decoder');

// FIT dosyasını okuma ve JSON'a dönüştürme
const parseFitFile = (filePath) => {
    const fitBuffer = fs.readFileSync(filePath); // Dosyayı Buffer olarak oku
    const fitArrayBuffer = fitBuffer.buffer.slice(
        fitBuffer.byteOffset,
        fitBuffer.byteOffset + fitBuffer.byteLength
    ); // Buffer'ı ArrayBuffer'a dönüştür
    const parsed = fit2json(fitArrayBuffer); // fit2json ile işle
    return parsed;
};

// İki dosyayı analiz et ve karşılaştır
const compareFitFiles = (file1Path, file2Path) => {
    const file1Data = parseFitFile(file1Path);
    const file2Data = parseFitFile(file2Path);

    console.log('File 1 Summary:', {
        records: file1Data.records ? file1Data.records.length : 0,
        messageTypes: Object.keys(file1Data).join(', '),
    });

    console.log('File 2 Summary:', {
        records: file2Data.records ? file2Data.records.length : 0,
        messageTypes: Object.keys(file2Data).join(', '),
    });

    // Ek analizler: İlk kayıtları karşılaştır
    if (file1Data.records && file2Data.records) {
        console.log('First 5 Records in File 1:', file1Data.records.slice(0, 5));
        console.log('First 5 Records in File 2:', file2Data.records.slice(0, 5));
    }
};




// Dosya yolları
const file1 = './2025-01-24-17-19-13.fit';
const file2 = './2025-01-21-16-21-20.fit';

// Karşılaştırma
compareFitFiles(file1, file2);
