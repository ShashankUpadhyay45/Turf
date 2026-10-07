import winston from 'winston';
import { Slot } from '../models/Slot';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export const runHoldExpirationJob = async () => {
  try {
    const now = new Date();
    // Release any slot where status is 'held' and heldUntil timestamp has expired
    const result = await Slot.updateMany(
      {
        status: 'held',
        heldUntil: { $lt: now }
      },
      {
        $set: { status: 'available', heldUntil: null }
      }
    );

    if (result && result.modifiedCount > 0) {
      logger.info(`Released ${result.modifiedCount} expired held slots.`);
    }
  } catch (error) {
    // If DB is offline, log gracefully
    logger.debug('Hold expiration check skipped or DB offline');
  }
};

export const startHoldExpirationJob = () => {
  setInterval(runHoldExpirationJob, 60 * 1000);
  logger.info('Hold Expiration Job scheduled to run every minute.');
};
