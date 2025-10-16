import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateInterventionDto } from './dto/create-intervention.dto';
import { UpdateInterventionDto } from './dto/update-intervention.dto';
import { ReminderSchedulerService } from './reminder-scheduler.service';
import * as moment from 'moment-timezone';

@Injectable()
export class InterventionsService {
  constructor(
    private prisma: PrismaService,
    private reminderScheduler: ReminderSchedulerService,
  ) {}

  async create(createInterventionDto: CreateInterventionDto, userId: string) {
    const { scheduledAt, rules, ...interventionData } = createInterventionDto;

    // Convertir la date en UTC
    const scheduledAtUtc = moment.tz(scheduledAt, 'Africa/Douala').utc().toDate();

    // Vérifier que la date est dans le futur
    if (scheduledAtUtc <= new Date()) {
      throw new BadRequestException('La date de l\'intervention doit être dans le futur');
    }

    // Vérifier que la personne et le médecin existent
    const [person, doctor] = await Promise.all([
      this.prisma.person.findUnique({ where: { id: createInterventionDto.personId } }),
      this.prisma.doctor.findUnique({ where: { id: createInterventionDto.doctorId } }),
    ]);

    if (!person) {
      throw new NotFoundException('Personne non trouvée');
    }

    if (!doctor) {
      throw new NotFoundException('Médecin non trouvé');
    }

    // Créer l'intervention
    const intervention = await this.prisma.intervention.create({
      data: {
        ...interventionData,
        scheduledAtUtc,
        status: 'PLANNED',
      },
      include: {
        person: true,
        doctor: {
          include: {
            user: true,
          },
        },
        reminders: true,
        rules: true,
      },
    });

    // Créer les règles de rappel par défaut si aucune n'est fournie
    const reminderRules = rules && rules.length > 0 
      ? rules 
      : this.getDefaultReminderRules();

    // Créer les règles de rappel
    for (const rule of reminderRules) {
      await this.prisma.reminderRule.create({
        data: {
          interventionId: intervention.id,
          offsetMinutes: rule.offsetMinutes,
          channel: rule.channel,
          enabled: rule.enabled !== false,
        },
      });
    }

    // Programmer les rappels
    await this.reminderScheduler.scheduleReminders(intervention.id);

    return this.findOne(intervention.id);
  }

  async findAll(filters: {
    doctorId?: string;
    status?: string;
    from?: string;
    to?: string;
    priority?: string;
  }) {
    const where: any = {};

    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.priority) {
      where.priority = filters.priority;
    }

    if (filters.from || filters.to) {
      where.scheduledAtUtc = {};
      if (filters.from) {
        where.scheduledAtUtc.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.scheduledAtUtc.lte = new Date(filters.to);
      }
    }

    return this.prisma.intervention.findMany({
      where,
      include: {
        person: true,
        doctor: {
          include: {
            user: true,
          },
        },
        reminders: {
          orderBy: { plannedSendUtc: 'asc' },
        },
        rules: true,
      },
      orderBy: { scheduledAtUtc: 'asc' },
    });
  }

  async findOne(id: string) {
    const intervention = await this.prisma.intervention.findUnique({
      where: { id },
      include: {
        person: true,
        doctor: {
          include: {
            user: true,
          },
        },
        reminders: {
          orderBy: { plannedSendUtc: 'asc' },
          include: {
            notificationLogs: true,
          },
        },
        rules: true,
      },
    });

    if (!intervention) {
      throw new NotFoundException('Intervention non trouvée');
    }

    return intervention;
  }

  async update(id: string, updateInterventionDto: UpdateInterventionDto) {
    const intervention = await this.findOne(id);

    const { scheduledAt, ...updateData } = updateInterventionDto;

    let scheduledAtUtc = intervention.scheduledAtUtc;

    // Si la date change, recalculer les rappels
    if (scheduledAt) {
      scheduledAtUtc = moment.tz(scheduledAt, 'Africa/Douala').utc().toDate();
      
      if (scheduledAtUtc <= new Date()) {
        throw new BadRequestException('La date de l\'intervention doit être dans le futur');
      }
    }

    // Filtrer les propriétés valides pour la mise à jour
    const validUpdateData: any = {};
    if (updateData.title !== undefined) validUpdateData.title = updateData.title;
    if (updateData.description !== undefined) validUpdateData.description = updateData.description;
    if (updateData.priority !== undefined) validUpdateData.priority = updateData.priority;
    if (updateData.status !== undefined) validUpdateData.status = updateData.status;
    if (updateData.location !== undefined) validUpdateData.location = updateData.location;

    const updatedIntervention = await this.prisma.intervention.update({
      where: { id },
      data: {
        ...validUpdateData,
        scheduledAtUtc,
      },
      include: {
        person: true,
        doctor: {
          include: {
            user: true,
          },
        },
        reminders: true,
        rules: true,
      },
    });

    // Si la date a changé, reprogrammer les rappels
    if (scheduledAt) {
      await this.reminderScheduler.rescheduleReminders(id);
    }

    // Si le statut change vers CANCELED ou DONE, annuler les rappels futurs
    if (updateInterventionDto.status === 'CANCELED' || updateInterventionDto.status === 'DONE') {
      await this.cancelFutureReminders(id);
    }

    return this.findOne(id);
  }

  async remove(id: string) {
    const intervention = await this.findOne(id);

    // Annuler tous les rappels futurs
    await this.cancelFutureReminders(id);

    // Supprimer l'intervention (cascade supprimera les règles et rappels)
    await this.prisma.intervention.delete({
      where: { id },
    });

    return { message: 'Intervention supprimée avec succès' };
  }

  private getDefaultReminderRules() {
    return [
      { offsetMinutes: -1440, channel: 'SMS', enabled: true }, // J-1
      { offsetMinutes: -60, channel: 'SMS', enabled: true },    // H-1
    ];
  }

  private async cancelFutureReminders(interventionId: string) {
    const now = new Date();
    
    await this.prisma.reminder.updateMany({
      where: {
        interventionId,
        status: 'PENDING',
        plannedSendUtc: { gt: now },
      },
      data: {
        status: 'CANCELLED',
      },
    });
  }

  async getUpcomingInterventions(doctorId: string, days: number = 7) {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + days);

    return this.prisma.intervention.findMany({
      where: {
        doctorId,
        status: { in: ['PLANNED', 'IN_PROGRESS'] },
        scheduledAtUtc: {
          gte: from,
          lte: to,
        },
      },
      include: {
        person: true,
        reminders: {
          where: { status: 'PENDING' },
          orderBy: { plannedSendUtc: 'asc' },
        },
      },
      orderBy: { scheduledAtUtc: 'asc' },
    });
  }

  async getUpcoming(days: number = 7) {
    const from = new Date();
    const to = new Date();
    to.setDate(to.getDate() + days);

    return this.prisma.intervention.findMany({
      where: {
        status: { in: ['PLANNED', 'IN_PROGRESS'] },
        scheduledAtUtc: {
          gte: from,
          lte: to,
        },
      },
      include: {
        person: true,
        doctor: {
          include: {
            user: true,
          },
        },
        reminders: {
          where: { status: 'PENDING' },
          orderBy: { plannedSendUtc: 'asc' },
        },
      },
      orderBy: { scheduledAtUtc: 'asc' },
    });
  }
}
