import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as crypto from 'crypto';
import * as moment from 'moment-timezone';

@Injectable()
export class ReminderSchedulerService {
  constructor(
    private prisma: PrismaService,
    @InjectQueue('reminder-queue') private reminderQueue: Queue,
  ) {}

  async scheduleReminders(interventionId: string) {
    const intervention = await this.prisma.intervention.findUnique({
      where: { id: interventionId },
      include: {
        rules: true,
        person: true,
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!intervention) {
      throw new Error('Intervention non trouvée');
    }

    // Supprimer les anciens rappels programmés
    await this.prisma.reminder.deleteMany({
      where: {
        interventionId,
        status: 'SCHEDULED',
      },
    });

    // Créer de nouveaux rappels basés sur les règles
    for (const rule of intervention.rules) {
      if (!rule.enabled) continue;

      const plannedSendUtc = moment(intervention.scheduledAtUtc)
        .add(rule.offsetMinutes, 'minutes')
        .toDate();

      // Ne programmer que les rappels futurs
      if (plannedSendUtc > new Date()) {
        const idempotencyKey = this.generateIdempotencyKey(
          interventionId,
          plannedSendUtc,
          rule.channel,
        );

        await this.prisma.reminder.create({
          data: {
            interventionId,
            type: rule.channel,
            plannedSendUtc,
            status: 'PENDING',
            idempotencyKey,
          } as any,
        });
      }
    }
  }

  async rescheduleReminders(interventionId: string) {
    // Supprimer tous les rappels existants
    await this.prisma.reminder.deleteMany({
      where: { interventionId },
    });

    // Recréer les rappels avec la nouvelle date
    await this.scheduleReminders(interventionId);
  }

  async processScheduledReminders() {
    const now = new Date();
    const batchSize = 100;

    // Récupérer les rappels à envoyer maintenant
    const reminders = await this.prisma.reminder.findMany({
      where: {
        status: 'SCHEDULED',
        plannedSendUtc: { lte: now },
      },
      include: {
        intervention: {
          include: {
            person: true,
            doctor: {
              include: {
                user: true,
              },
            },
            rules: true,
          },
        },
      },
      take: batchSize,
      orderBy: { plannedSendUtc: 'asc' },
    });

    console.log(`📅 Traitement de ${reminders.length} rappels programmés`);

    for (const reminder of reminders) {
      try {
        // Trouver la règle correspondante
        const rule = reminder.intervention.rules.find(
          r => r.offsetMinutes === this.getOffsetMinutes(reminder.intervention.scheduledAtUtc, reminder.plannedSendUtc)
        );

        if (!rule) {
          console.warn(`⚠️ Aucune règle trouvée pour le rappel ${reminder.id}`);
          continue;
        }

        // Ajouter le job à la queue
        await this.reminderQueue.add('send-reminder', {
          reminderId: reminder.id,
          interventionId: reminder.interventionId,
          channel: rule.channel,
          person: reminder.intervention.person,
          doctor: reminder.intervention.doctor,
          intervention: reminder.intervention,
        }, {
          jobId: reminder.idempotencyKey,
          removeOnComplete: 10,
          removeOnFail: 5,
        });

        console.log(`✅ Rappel ${reminder.id} ajouté à la queue (${rule.channel})`);

      } catch (error) {
        console.error(`❌ Erreur lors du traitement du rappel ${reminder.id}:`, error);
        
        // Marquer le rappel comme échoué
        await this.prisma.reminder.update({
          where: { id: reminder.id },
          data: {
            status: 'FAILED',
            lastError: error.message,
          },
        });
      }
    }
  }

  private generateIdempotencyKey(interventionId: string, plannedSendUtc: Date, channel: string): string {
    const data = `${interventionId}:${plannedSendUtc.toISOString()}:${channel}`;
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  private getOffsetMinutes(scheduledAt: Date, plannedSend: Date): number {
    return moment(plannedSend).diff(moment(scheduledAt), 'minutes');
  }

  async markReminderAsSent(reminderId: string) {
    await this.prisma.reminder.update({
      where: { id: reminderId },
      data: {
        status: 'SENT',
        sentAt: new Date(),
      },
    });
  }

  async markReminderAsFailed(reminderId: string, error: string) {
    await this.prisma.reminder.update({
      where: { id: reminderId },
      data: {
        status: 'FAILED',
        lastError: error,
      },
    });
  }
}
