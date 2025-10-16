import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: {
    status?: string;
    from?: string;
    to?: string;
    interventionId?: string;
  }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.interventionId) {
      where.interventionId = filters.interventionId;
    }

    if (filters.from || filters.to) {
      where.plannedSendUtc = {};
      if (filters.from) {
        where.plannedSendUtc.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.plannedSendUtc.lte = new Date(filters.to);
      }
    }

    return this.prisma.reminder.findMany({
      where,
      include: {
        intervention: {
          include: {
            person: true,
            doctor: {
              include: {
                user: true,
              },
            },
          },
        },
        notificationLogs: true,
      },
      orderBy: { plannedSendUtc: 'desc' },
    });
  }

  async findOne(id: string) {
    const reminder = await this.prisma.reminder.findUnique({
      where: { id },
      include: {
        intervention: {
          include: {
            person: true,
            doctor: {
              include: {
                user: true,
              },
            },
          },
        },
        notificationLogs: true,
      },
    });

    if (!reminder) {
      throw new NotFoundException('Rappel non trouvé');
    }

    return reminder;
  }

  async create(createReminderDto: CreateReminderDto) {
    return this.prisma.reminder.create({
      data: {
        interventionId: createReminderDto.interventionId,
        type: createReminderDto.type as string,
        plannedSendUtc: new Date(createReminderDto.scheduledAt),
        message: createReminderDto.message,
        recipient: createReminderDto.recipient,
        status: createReminderDto.status || 'PENDING',
        idempotencyKey: `reminder-${Date.now()}-${Math.random()}`,
      } as any,
      include: {
        intervention: {
          include: {
            person: true,
            doctor: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });
  }

  async update(id: string, updateReminderDto: UpdateReminderDto) {
    const reminder = await this.findOne(id);

    return this.prisma.reminder.update({
      where: { id },
      data: {
        ...(updateReminderDto.scheduledAt && { plannedSendUtc: new Date(updateReminderDto.scheduledAt) }),
        ...(updateReminderDto.message && { message: updateReminderDto.message }),
        ...(updateReminderDto.recipient && { recipient: updateReminderDto.recipient }),
        ...(updateReminderDto.status && { status: updateReminderDto.status }),
        ...(updateReminderDto.type && { type: updateReminderDto.type }),
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
          },
        },
      },
    });
  }

  async remove(id: string) {
    const reminder = await this.findOne(id);

    return this.prisma.reminder.delete({
      where: { id },
    });
  }

  async getStats() {
    const [total, sent, failed, pending, cancelled] = await Promise.all([
      this.prisma.reminder.count(),
      this.prisma.reminder.count({ where: { status: 'SENT' } }),
      this.prisma.reminder.count({ where: { status: 'FAILED' } }),
      this.prisma.reminder.count({ where: { status: 'PENDING' } }),
      this.prisma.reminder.count({ where: { status: 'CANCELLED' } }),
    ]);

    return {
      total,
      sent,
      failed,
      pending,
      cancelled,
      successRate: total > 0 ? ((sent / total) * 100).toFixed(2) : '0',
    };
  }

  async retryFailedReminder(id: string) {
    const reminder = await this.findOne(id);

    if (!reminder) {
      throw new Error('Rappel non trouvé');
    }

    if (reminder.status !== 'FAILED') {
      throw new Error('Seuls les rappels échoués peuvent être relancés');
    }

    // Marquer comme en attente pour retraitement
    return this.prisma.reminder.update({
      where: { id },
      data: {
        status: 'PENDING',
        lastError: null,
      },
    });
  }
}
