import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';

import config from './config/config';
import logger from './utils/logger';
import { errorHandler, notFound } from './middlewares/errorHandler';

// Rota modüllerini içe aktar
import authRoutes from './routes/authRoutes';
import videoRoutes from './routes/videoRoutes';

// Express uygulaması oluştur
const app = express();

// Middleware'leri ayarla
app.use(helmet()); // Güvenlik başlıklarını ayarla
app.use(cors()); // CORS desteği
app.use(express.json()); // JSON gövdeleri için ayrıştırıcı
app.use(express.urlencoded({ extended: false })); // URL-encoded formlar için ayrıştırıcı

// Logs klasörünü oluştur (yoksa)
const logsDir = path.join(__dirname, '../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Python betiği için output klasörü oluştur (yoksa)
const pythonDir = path.join(__dirname, 'python');
if (!fs.existsSync(pythonDir)) {
  fs.mkdirSync(pythonDir, { recursive: true });
}

// API rotalarını ayarla
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);

// API kök noktası
app.get('/api', (req, res) => {
  res.json({
    message: 'VideoBite API',
    version: '1.0.0'
  });
});

// 404 ve Hata yakalama middleware
app.use(notFound);
app.use(errorHandler);

// MongoDB'ye bağlan
mongoose.connect(config.mongoUri)
  .then(() => {
    logger.info('MongoDB\'ye başarıyla bağlandı');
    startServer();
  })
  .catch((err) => {
    logger.error(`MongoDB bağlantı hatası: ${err.message}`);
    process.exit(1);
  });

// Sunucuyu başlat
function startServer() {
  app.listen(config.port, () => {
    logger.info(`Sunucu ${config.port} portunda çalışıyor - ${config.nodeEnv} modu`);
  });
}

// İşlemden çıkış için temizlik
process.on('SIGINT', async () => {
  logger.info('Uygulama kapatılıyor');
  await mongoose.connection.close();
  logger.info('MongoDB bağlantısı kapatıldı');
  process.exit(0);
});

export default app; 