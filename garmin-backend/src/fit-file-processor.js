import fs from 'fs/promises';

export const processFitFile = async (filePath) => {
    try {
        // Dosyayı asenkron olarak oku
        const content = await fs.readFile(filePath);
        // İşlemleri burada yapabilirsiniz (örneğin, FitParser kullanımı)
        return `Dosya başarıyla işlendi: ${filePath}`;
    } catch (error) {
        throw new Error(`Error reading file ${filePath}: ${error.message}`);
    }
};
