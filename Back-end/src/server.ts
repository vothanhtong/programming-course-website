import 'dotenv/config';
import app from './app';
import { connectDB } from './config/db';
import logger from './config/logger';

const PORT = parseInt(process.env.PORT || '5001', 10);

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    logger.info('═'.repeat(50));
    logger.info('  🚀 KHÓA LẬP TRÌNH - API Server');
    logger.info('═'.repeat(50));
    logger.info(`  ✅ Server  : http://localhost:${PORT}`);
    logger.info(`  ❤️  Health  : http://localhost:${PORT}/health`);
    logger.info(`  📚 Courses : http://localhost:${PORT}/apis/courses`);
    logger.info(`  🔐 Admin   : http://localhost:${PORT}/apis/admin/login`);
    logger.info('═'.repeat(50));
  });
};

startServer();
