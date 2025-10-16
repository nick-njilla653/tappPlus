import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class PushService {
  private app: admin.app.App;

  constructor(private configService: ConfigService) {
    const serviceAccount = this.configService.get<string>('FCM_SERVICE_ACCOUNT');
    
    if (serviceAccount) {
      try {
        const serviceAccountKey = JSON.parse(serviceAccount);
        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccountKey),
        });
      } catch (error) {
        console.warn('⚠️ Configuration FCM invalide:', error.message);
      }
    } else {
      console.warn('⚠️ FCM non configuré');
    }
  }

  async sendReminder(data: {
    to: string; // Device token ou topic
    title: string;
    body: string;
    data?: any;
  }) {
    if (!this.app) {
      console.warn('⚠️ FCM non configuré, simulation d\'envoi push');
      return { id: 'simulated_' + Date.now(), success: true };
    }

    try {
      const message = {
        notification: {
          title: data.title,
          body: data.body,
        },
        data: {
          ...data.data,
          timestamp: Date.now().toString(),
        },
        token: data.to, // Pour un token spécifique
        // topic: 'all-users', // Pour un topic
      };

      const result = await this.app.messaging().send(message);
      
      console.log(`📲 Push envoyé: ${result}`);
      return { id: result, success: true };
    } catch (error) {
      console.error(`❌ Erreur envoi push:`, error);
      throw error;
    }
  }

  async sendToTopic(topic: string, data: {
    title: string;
    body: string;
    data?: any;
  }) {
    if (!this.app) {
      console.warn('⚠️ FCM non configuré, simulation d\'envoi push topic');
      return { id: 'simulated_' + Date.now(), success: true };
    }

    try {
      const message = {
        notification: {
          title: data.title,
          body: data.body,
        },
        data: {
          ...data.data,
          timestamp: Date.now().toString(),
        },
        topic,
      };

      const result = await this.app.messaging().send(message);
      
      console.log(`📲 Push envoyé au topic ${topic}: ${result}`);
      return { id: result, success: true };
    } catch (error) {
      console.error(`❌ Erreur envoi push topic:`, error);
      throw error;
    }
  }

  async sendTestPush(token: string) {
    return this.sendReminder({
      to: token,
      title: 'Test Meditache',
      body: `Configuration push OK - ${new Date().toLocaleString('fr-FR', { timeZone: 'Africa/Douala' })}`,
      data: { type: 'test' },
    });
  }
}
