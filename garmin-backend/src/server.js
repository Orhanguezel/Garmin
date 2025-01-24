const express = require('express');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const garminRoutes = require('./routes/garminRoutes');
const mongoose = require('mongoose');

// Swagger dökümantasyonunu yükle
const swaggerDocument = YAML.load('./src/docs/swagger.yaml');

const app = express();
const port = 3000;

// MongoDB bağlantısını başlat
mongoose.connect('mongodb://localhost:27017/garminDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB bağlantısı başarılı'))
    .catch(err => console.error('MongoDB bağlantısı başarısız:', err));

// Middleware
app.use(express.json());

// Swagger UI'yı başlat
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API rotalarını kullan
app.use('/api', garminRoutes);

// Sunucuyu başlat
app.listen(port, () => {
    console.log(`Sunucu ${port} portunda çalışıyor`);
    console.log(`Swagger UI: http://localhost:${port}/api-docs`);
});

