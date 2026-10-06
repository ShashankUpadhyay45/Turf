import { emailProvider } from '../services/emailProvider';
import { whatsAppProvider } from '../services/whatsAppProvider';
import { Notification } from '../models/Notification';
import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

export interface NotificationJob {
  id: string; // db reference or notification id
  type: 'email' | 'whatsapp';
  payload: Record<string, unknown>;
  attempts: number;
}

class NotificationQueue {
  private queue: NotificationJob[] = [];
  private isProcessing: boolean = false;
  private readonly MAX_RETRIES = 3;
  private readonly BACKOFF_DELAYS = [2000, 5000, 10000];

  enqueueNotification(jobData: Omit<NotificationJob, 'attempts'>) {
    const job: NotificationJob = {
      ...jobData,
      attempts: 0,
    };
    this.queue.push(job);
    logger.info(`Job ${job.id} enqueued. Queue length: ${this.queue.length}`);

    if (!this.isProcessing) {
      this.processQueue();
    }
  }

  private async processQueue() {
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (!job) continue;

      try {
        await this.executeJob(job);
        logger.info(`Job ${job.id} processed successfully.`);

        // Update Notification status in DB
        try {
          await Notification.findByIdAndUpdate(job.id, {
            status: 'sent',
            sentAt: new Date(),
            $inc: { attempts: 1 },
          });
        } catch (dbErr) {
          logger.debug(`Could not update notification status in DB: ${String(dbErr)}`);
        }
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : String(err);
        logger.error(`Job ${job.id} failed attempt ${job.attempts + 1}: ${errorMsg}`);
        job.attempts += 1;

        if (job.attempts < this.MAX_RETRIES) {
          const delay = this.BACKOFF_DELAYS[job.attempts - 1] || 10000;
          logger.info(`Re-queueing job ${job.id} after ${delay}ms...`);

          try {
            await Notification.findByIdAndUpdate(job.id, {
              status: 'retrying',
              error: errorMsg,
              $inc: { attempts: 1 },
            });
          } catch (dbErr) {
            logger.debug(`Could not update retry status in DB: ${String(dbErr)}`);
          }

          setTimeout(() => {
            this.queue.push(job);
            if (!this.isProcessing) this.processQueue();
          }, delay);
        } else {
          logger.error(`Job ${job.id} permanently failed after ${this.MAX_RETRIES} attempts.`);
          try {
            await Notification.findByIdAndUpdate(job.id, {
              status: 'failed',
              error: errorMsg,
              $inc: { attempts: 1 },
            });
          } catch (dbErr) {
            logger.debug(`Could not update failure status in DB: ${String(dbErr)}`);
          }
        }
      }
    }

    this.isProcessing = false;
  }

  private async executeJob(job: NotificationJob): Promise<void> {
    if (job.type === 'email') {
      const result = await emailProvider.sendEmail(job.payload as any);
      if (!result.success) throw new Error(result.error || 'Unknown email error');
    } else if (job.type === 'whatsapp') {
      const result = await whatsAppProvider.sendMessage({
        to: String(job.payload.to || ''),
        text: String(job.payload.text || ''),
        payload: job.payload.metaPayload as Record<string, unknown> | undefined,
      });
      if (!result.success) throw new Error(result.error || 'Unknown WhatsApp error');
    } else {
      throw new Error(`Unknown job type: ${job.type}`);
    }
  }
}

export const notificationQueue = new NotificationQueue();
