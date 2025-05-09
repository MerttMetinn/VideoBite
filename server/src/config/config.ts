import dotenv from 'dotenv';

// .env dosyasını yükle
dotenv.config();

interface Config {
  port: number;
  mongoUri: string;
  jwtSecret: string;
  nodeEnv: string;
  youtubeApiKey: string;
}

const config: Config = {
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017/videobite',
  jwtSecret: process.env.JWT_SECRET || 'videobite_secret_key',
  nodeEnv: process.env.NODE_ENV || 'development',
  youtubeApiKey: process.env.YOUTUBE_API_KEY || ''
};

export default config; 