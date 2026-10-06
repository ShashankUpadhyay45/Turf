import winston from 'winston';
import { config } from '../config/index.js';

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

export interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export interface EmailProviderResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class EmailProvider {
  private providerType: string;

  constructor() {
    this.providerType = config.EMAIL_PROVIDER || 'mock';
  }

  async sendEmail(options: SendEmailOptions): Promise<EmailProviderResult> {
    try {
      if (this.providerType === 'resend' && config.EMAIL_API_KEY) {
        return await this.sendResendEmail(options);
      } else if (this.providerType === 'sendgrid' && config.EMAIL_API_KEY) {
        return await this.sendSendGridEmail(options);
      }

      // Default or mock mode
      return this.sendMockEmail(options);
    } catch (error: any) {
      logger.error('Error sending email', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  private async sendResendEmail(options: SendEmailOptions): Promise<EmailProviderResult> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.EMAIL_API_KEY}`,
        },
        body: JSON.stringify({
          from: config.EMAIL_FROM,
          to: [options.to],
          subject: options.subject,
          html: options.html,
        }),
      });

      const data: any = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Resend API error');
      }

      logger.info(`Email sent via Resend API: ${data.id}`);
      return { success: true, messageId: data.id };
    } catch (err: any) {
      logger.error('Resend delivery failed, falling back to mock logging', { error: err.message });
      return this.sendMockEmail(options);
    }
  }

  private async sendSendGridEmail(options: SendEmailOptions): Promise<EmailProviderResult> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${config.EMAIL_API_KEY}`,
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: options.to }] }],
          from: { email: config.EMAIL_FROM },
          subject: options.subject,
          content: [{ type: 'text/html', value: options.html }],
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'SendGrid API error');
      }

      const msgId = `sg-${Date.now()}`;
      logger.info(`Email sent via SendGrid API: ${msgId}`);
      return { success: true, messageId: msgId };
    } catch (err: any) {
      logger.error('SendGrid delivery failed, falling back to mock logging', { error: err.message });
      return this.sendMockEmail(options);
    }
  }

  private async sendMockEmail(options: SendEmailOptions): Promise<EmailProviderResult> {
    const mockMessageId = `mock-email-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    logger.info('--- MOCK EMAIL SENT ---');
    logger.info(`To: ${options.to}`);
    logger.info(`Subject: ${options.subject}`);
    logger.info(`Body length: ${options.html.length} chars`);
    logger.info('-----------------------');

    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    return {
      success: true,
      messageId: mockMessageId,
    };
  }
}

export const emailProvider = new EmailProvider();
