import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import * as moment from 'moment-timezone';

@Injectable()
export class ConsultationsService {
  constructor(private prisma: PrismaService) {}

  async create(createConsultationDto: CreateConsultationDto) {
    const { dateTime, ...consultationData } = createConsultationDto;

    // Convertir la date en UTC
    const dateTimeUtc = moment.tz(dateTime, 'Africa/Douala').utc().toDate();

    // Vérifier que la personne et le médecin existent
    const [person, doctor] = await Promise.all([
      this.prisma.person.findUnique({ where: { id: createConsultationDto.personId } }),
      this.prisma.doctor.findUnique({ where: { id: createConsultationDto.doctorId } }),
    ]);

    if (!person) {
      throw new NotFoundException('Personne non trouvée');
    }

    if (!doctor) {
      throw new NotFoundException('Médecin non trouvé');
    }

    return this.prisma.consultation.create({
      data: {
        ...consultationData,
        dateTimeUtc,
      },
      include: {
        person: true,
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findAll(filters: {
    personId?: string;
    doctorId?: string;
    from?: string;
    to?: string;
    status?: string;
  }) {
    const where: any = {};

    if (filters.personId) {
      where.personId = filters.personId;
    }

    if (filters.doctorId) {
      where.doctorId = filters.doctorId;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.from || filters.to) {
      where.dateTimeUtc = {};
      if (filters.from) {
        where.dateTimeUtc.gte = new Date(filters.from);
      }
      if (filters.to) {
        where.dateTimeUtc.lte = new Date(filters.to);
      }
    }

    return this.prisma.consultation.findMany({
      where,
      include: {
        person: true,
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { dateTimeUtc: 'desc' },
    });
  }

  async findOne(id: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id },
      include: {
        person: true,
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!consultation) {
      throw new NotFoundException('Consultation non trouvée');
    }

    return consultation;
  }

  async update(id: string, updateConsultationDto: UpdateConsultationDto) {
    const consultation = await this.findOne(id);

    const { dateTime, ...updateData } = updateConsultationDto;

    let dateTimeUtc = consultation.dateTimeUtc;

    if (dateTime) {
      dateTimeUtc = moment.tz(dateTime, 'Africa/Douala').utc().toDate();
    }

    return this.prisma.consultation.update({
      where: { id },
      data: {
        ...updateData,
        dateTimeUtc,
      },
      include: {
        person: true,
        doctor: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const consultation = await this.findOne(id);

    await this.prisma.consultation.delete({
      where: { id },
    });

    return { message: 'Consultation supprimée avec succès' };
  }

  async getPatientHistory(personId: string, doctorId?: string) {
    const where: any = { personId };

    if (doctorId) {
      where.doctorId = doctorId;
    }

    return this.prisma.consultation.findMany({
      where,
      include: {
        doctor: {
          include: {
            user: true,
          },
        },
      },
      orderBy: { dateTimeUtc: 'desc' },
    });
  }
}
