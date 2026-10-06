import app from './app';
import { logger } from './utils/logger';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Mock DB connection
    logger.info('Database connected (mocked)');

    app.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });
    
    // Start periodic hold expiration job
    setInterval(() => {
      // Logic to clear expired holds
      logger.info('Running periodic hold expiration check (mocked)');
    }, 60000);

  } catch (error) {
    logger.error('Error starting server', error);
    process.exit(1);
  }
};

startServer();
