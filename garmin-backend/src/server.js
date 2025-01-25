import express from 'express';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import garminRoutes from './routes/garminRoutes.js';
import connectDB from './config/connectDB.js';
import dotenv from 'dotenv';

// Dotenv ayarlarını yükle
dotenv.config();

// Swagger dökümantasyonunu yükle
const swaggerDocument = YAML.load('./src/docs/swagger.yaml');

const app = express();
const port = process.env.PORT || 3001;

// MongoDB bağlantısını başlat
connectDB();

// Middleware
app.use(express.json());

// Swagger UI yapılandırması
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Garmin API rotalarını yükle
app.use('/api', garminRoutes);

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor`);
    console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});
