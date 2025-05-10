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

// CORS ayarlarını yapılandır - tüm kaynaklara izin ver
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

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

// Statik dosya sunumu
if (config.isProd) {
  // Production modunda client build klasörünü sun
  const clientBuildPath = path.join(__dirname, '../../client/build');
  
  if (fs.existsSync(clientBuildPath)) {
    app.use(express.static(clientBuildPath));
    
    app.get('*', (req, res) => {
      res.sendFile(path.join(clientBuildPath, 'index.html'));
    });
    
    logger.info('Statik dosya sunumu yapılandırıldı');
  } else {
    logger.warn('Client build klasörü bulunamadı, statik dosya sunumu yapılandırılamadı');
  }
}

// API kök noktası
app.get('/api', (req, res) => {
  res.json({
    message: 'VideoBite API',
    version: '1.0.0'
  });
});

// 404 ve Hata yakalama middleware
app.use(notFound);
// Error handler middleware'i doğru tiple kullanıyoruz
app.use(errorHandler as express.ErrorRequestHandler);

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