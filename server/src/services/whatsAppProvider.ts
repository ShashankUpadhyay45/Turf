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

export interface SendWhatsAppOptions {
  to: string;
  text?: string;
  payload?: any;
}

export interface WhatsAppProviderResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

class WhatsAppProvider {
  private providerType: string;

  constructor() {
    this.providerType = config.WHATSAPP_PROVIDER || 'mock';
  }

  async sendMessage(options: SendWhatsAppOptions): Promise<WhatsAppProviderResult> {
    try {
      if (this.providerType === 'meta' && config.WHATSAPP_ACCESS_TOKEN && config.WHATSAPP_PHONE_NUMBER_ID) {
        return await this.sendMetaMessage(options);
      } else if (this.providerType === 'twilio' && config.TWILIO_ACCOUNT_SID && config.TWILIO_AUTH_TOKEN) {
        return await this.sendTwilioMessage(options);
      }

      return this.sendMockMessage(options);
    } catch (error: any) {
      logger.error('Error sending WhatsApp message', { error: error.message });
      return { success: false, error: error.message };
    }
  }

  private async sendMetaMessage(options: SendWhatsAppOptions): Promise<WhatsAppProviderResult> {
    const phoneNumberId = config.WHATSAPP_PHONE_NUMBER_ID;
    const token = config.WHATSAPP_ACCESS_TOKEN;

    const payload = options.payload || {
      messaging_product: 'whatsapp',
      to: options.to.replace(/\D/g, ''),
      type: 'text',
      text: { body: options.text || '' }
    };

    const response = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Meta API Error: ${JSON.stringify(errorData)}`);
    }

    const data: any = await response.json();
    const msgId = data.messages?.[0]?.id || `meta-${Date.now()}`;
    logger.info(`WhatsApp message dispatched via Meta Cloud API: ${msgId}`);
    return { success: true, messageId: msgId };
  }

  private async sendTwilioMessage(options: SendWhatsAppOptions): Promise<WhatsAppProviderResult> {
    const sid = config.TWILIO_ACCOUNT_SID;
    const auth = config.TWILIO_AUTH_TOKEN;
    const from = config.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';
    const to = options.to.startsWith('whatsapp:') ? options.to : `whatsapp:${options.to}`;

    const params = new URLSearchParams();
    params.append('From', from);
    params.append('To', to);
    params.append('Body', options.text || '');

    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${auth}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Twilio API Error: ${JSON.stringify(errorData)}`);
    }

    const data: any = await response.json();
    logger.info(`WhatsApp message dispatched via Twilio: ${data.sid}`);
    return { success: true, messageId: data.sid };
  }

  private async sendMockMessage(options: SendWhatsAppOptions): Promise<WhatsAppProviderResult> {
    const mockMessageId = `mock-wa-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    logger.info('--- MOCK WHATSAPP MESSAGE SENT ---');
    logger.info(`To: ${options.to}`);
    if (options.text) {
      logger.info(`Text:\n${options.text}`);
    } else {
      logger.info('Payload attached (Meta format)');
    }
    logger.info('----------------------------------');

    await new Promise((resolve) => setTimeout(resolve, 200));

    return {
      success: true,
      messageId: mockMessageId,
    };
  }
}

export const whatsAppProvider = new WhatsAppProvider();
