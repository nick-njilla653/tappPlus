import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private client: twilio.Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');

    if (accountSid && authToken) {
      this.client = twilio(accountSid, authToken);
    }
  }

  async sendReminder(data: {
    to: string;
    message: string;
  }) {
    if (!this.client) {
      console.warn('⚠️ Twilio non configuré, simulation d\'envoi SMS');
      return { sid: 'simulated_' + Date.now(), success: true };
    }

    try {
      const result = await this.client.messages.create({
        body: data.message,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to: data.to,
      });

      console.log(`📱 SMS envoyé à ${data.to}: ${result.sid}`);
      return { sid: result.sid, success: true };
    } catch (error) {
      console.error(`❌ Erreur envoi SMS à ${data.to}:`, error);
      throw error;
    }
  }

  async sendTestSms(to: string) {
    return this.sendReminder({
      to,
      message: `Test Meditache - Configuration SMS OK. Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })}`,
    });
  }

  async sendUrgentAlert(data: {
    to: string;
    message: string;
    interventionId: string;
  }) {
    const urgentMessage = `🚨 URGENT - ${data.message}`;
    return this.sendReminder({
      to: data.to,
      message: urgentMessage,
    });
  }
}
