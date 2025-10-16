import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail', // Ou configurer avec SMTP personnalisé
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendReminder(data: {
    to: string;
    subject: string;
    html: string;
  }) {
    try {
      const result = await this.transporter.sendMail({
        from: this.configService.get<string>('EMAIL_FROM', 'noreply@meditache.com'),
        to: data.to,
        subject: data.subject,
        html: data.html,
      });

      console.log(`📧 Email envoyé à ${data.to}: ${result.messageId}`);
      return { messageId: result.messageId, success: true };
    } catch (error) {
      console.error(`❌ Erreur envoi email à ${data.to}:`, error);
      throw error;
    }
  }

  async sendTestEmail(to: string) {
    return this.sendReminder({
      to,
      subject: 'Test Meditache - Configuration Email',
      html: `
        <h2>Test de configuration email</h2>
        <p>Si vous recevez ce message, la configuration email de Meditache fonctionne correctement.</p>
        <p>Date: ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })}</p>
      `,
    });
  }
}
