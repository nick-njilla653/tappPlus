import { Injectable } from '@nestjs/common';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Queue, Job } from 'bull';
import { PrismaService } from '../common/prisma/prisma.service';
import { EmailService } from './providers/email.service';
import { SmsService } from './providers/sms.service';
import { PushService } from './providers/push.service';
import { ReminderSchedulerService } from '../interventions/reminder-scheduler.service';
import * as moment from 'moment-timezone';

@Processor('reminder-queue')
@Injectable()
export class NotificationsService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService,
    private smsService: SmsService,
    private pushService: PushService,
    private reminderScheduler: ReminderSchedulerService,
  ) {}

  @Process('send-reminder')
  async handleReminder(job: Job<any>) {
    const { reminderId, interventionId, channel, person, doctor, intervention } = job.data;

    try {
      console.log(`📤 Envoi du rappel ${reminderId} via ${channel}`);

      // Vérifier que l'intervention est toujours active
      const currentIntervention = await this.prisma.intervention.findUnique({
        where: { id: interventionId },
      });

      if (!currentIntervention || currentIntervention.status === 'CANCELED' || currentIntervention.status === 'DONE') {
        console.log(`⏭️ Intervention ${interventionId} annulée ou terminée, rappel ignoré`);
        await this.reminderScheduler.markReminderAsFailed(reminderId, 'Intervention annulée ou terminée');
        return;
      }

      // Construire le message
      const message = this.buildReminderMessage(intervention, person, doctor);

      // Envoyer selon le canal
      let result;
      switch (channel) {
        case 'EMAIL':
          result = await this.sendEmailReminder(person, doctor, message, intervention);
          break;
        case 'SMS':
          result = await this.sendSmsReminder(person, doctor, message, intervention);
          break;
        case 'PUSH':
          result = await this.sendPushReminder(person, doctor, message, intervention);
          break;
        default:
          throw new Error(`Canal non supporté: ${channel}`);
      }

      // Enregistrer le log de notification
      await this.prisma.notificationLog.create({
        data: {
          reminderId,
          channel,
          to: this.getRecipientAddress(person, channel),
          payload: JSON.stringify(message),
          status: 'SENT',
          providerMsgId: result?.messageId || result?.sid || result?.id,
        },
      });

      // Marquer le rappel comme envoyé
      await this.reminderScheduler.markReminderAsSent(reminderId);

      console.log(`✅ Rappel ${reminderId} envoyé avec succès via ${channel}`);

    } catch (error) {
      console.error(`❌ Erreur lors de l'envoi du rappel ${reminderId}:`, error);

      // Enregistrer l'erreur
      await this.prisma.notificationLog.create({
        data: {
          reminderId,
          channel,
          to: this.getRecipientAddress(person, channel),
          payload: JSON.stringify(job.data),
          status: 'FAILED',
          error: error.message,
        },
      });

      // Marquer le rappel comme échoué
      await this.reminderScheduler.markReminderAsFailed(reminderId, error.message);

      throw error;
    }
  }

  private buildReminderMessage(intervention: any, person: any, doctor: any) {
    const scheduledTime = moment(intervention.scheduledAtUtc)
      .tz('Africa/Douala')
      .format('dddd DD MMMM YYYY à HH:mm');

    const timeUntil = moment(intervention.scheduledAtUtc).fromNow();

    return {
      title: `Rappel: ${intervention.title}`,
      body: `Bonjour ${person.fullName},\n\n` +
            `Vous avez un rendez-vous médical prévu ${scheduledTime} (${timeUntil}).\n\n` +
            `Détails:\n` +
            `• Médecin: Dr. ${doctor.user?.email || 'Non spécifié'}\n` +
            `• Lieu: ${intervention.location || 'À confirmer'}\n` +
            `• Priorité: ${intervention.priority === 'URGENT' ? 'URGENTE' : 'Normale'}\n\n` +
            `Merci de confirmer votre présence.`,
      intervention: {
        id: intervention.id,
        title: intervention.title,
        scheduledAt: intervention.scheduledAtUtc,
        location: intervention.location,
        priority: intervention.priority,
      },
      person: {
        id: person.id,
        fullName: person.fullName,
        phone: person.phone,
        email: person.email,
      },
      doctor: {
        id: doctor.id,
        name: doctor.user?.email || 'Dr. Non spécifié',
        speciality: doctor.speciality,
      },
    };
  }

  private async sendEmailReminder(person: any, doctor: any, message: any, intervention: any) {
    if (!person.email) {
      throw new Error('Aucune adresse email disponible pour ce patient');
    }

    return this.emailService.sendReminder({
      to: person.email,
      subject: message.title,
      html: this.formatEmailMessage(message),
    });
  }

  private async sendSmsReminder(person: any, doctor: any, message: any, intervention: any) {
    if (!person.phone) {
      throw new Error('Aucun numéro de téléphone disponible pour ce patient');
    }

    return this.smsService.sendReminder({
      to: person.phone,
      message: this.formatSmsMessage(message),
    });
  }

  private async sendPushReminder(person: any, doctor: any, message: any, intervention: any) {
    // Pour l'instant, on utilise l'email comme fallback
    // Dans une vraie implémentation, on récupérerait les tokens FCM du patient
    return this.emailService.sendReminder({
      to: person.email || doctor.user.email,
      subject: `[PUSH] ${message.title}`,
      html: this.formatEmailMessage(message),
    });
  }

  private formatEmailMessage(message: any): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">${message.title}</h2>
        <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="white-space: pre-line; line-height: 1.6;">${message.body}</p>
        </div>
        <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 20px;">
          <p style="color: #6b7280; font-size: 14px;">
            Ce message a été envoyé automatiquement par le système Meditache.
          </p>
        </div>
      </div>
    `;
  }

  private formatSmsMessage(message: any): string {
    return `${message.title}\n\n${message.body.replace(/\n\n/g, '\n').substring(0, 150)}...`;
  }

  private getRecipientAddress(person: any, channel: string): string {
    switch (channel) {
      case 'EMAIL':
        return person.email || '';
      case 'SMS':
        return person.phone || '';
      case 'PUSH':
        return person.email || person.phone || '';
      default:
        return '';
    }
  }

  async getNotificationStats(interventionId?: string) {
    const where = interventionId ? { reminderId: interventionId } : {};

    const stats = await this.prisma.notificationLog.groupBy({
      by: ['status', 'channel'],
      where,
      _count: { status: true },
    });

    return stats.reduce((acc, stat) => {
      const key = `${stat.channel}_${stat.status}`;
      acc[key] = stat._count.status;
      return acc;
    }, {});
  }
}
