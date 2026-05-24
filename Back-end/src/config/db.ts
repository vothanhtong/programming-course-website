import mongoose from 'mongoose';
import dns from 'dns';
import logger from './logger';

export const connectDB = async (): Promise<void> => {
  try {
    dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

    await mongoose.connect(process.env.MONGO_URL as string, {
      serverSelectionTimeoutMS: 10000,
      family: 4,
    });

    logger.info(`✅ MongoDB connected: ${mongoose.connection.host}`);
  } catch (err: any) {
    logger.error(`❌ MongoDB failed: ${err.message}`);
    logger.warn('   → Vào MongoDB Atlas > Network Access > Add 0.0.0.0/0');
    process.exit(1);
  }
};

mongoose.connection.on('disconnected', () => logger.warn('⚠️  MongoDB disconnected'));
mongoose.connection.on('reconnected',  () => logger.info('✅ MongoDB reconnected'));
