import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';

@Injectable()
export class PeopleService {
  constructor(private prisma: PrismaService) {}

  async create(createPersonDto: CreatePersonDto) {
    const person = await this.prisma.person.create({
      data: createPersonDto,
      include: {
        organizations: {
          include: {
            org: true,
          },
        },
        consultations: {
          include: {
            doctor: {
              include: {
                user: true,
              },
            },
          },
          orderBy: { dateTimeUtc: 'desc' },
          take: 5, // Dernières 5 consultations
        },
        interventions: {
          include: {
            doctor: {
              include: {
                user: true,
              },
            },
          },
          orderBy: { scheduledAtUtc: 'desc' },
          take: 5, // Prochaines 5 interventions
        },
      },
    });

    return person;
  }

  async findAll(filters: {
    search?: string;
    organizationId?: string;
    limit?: number;
    offset?: number;
  }) {
    const where: any = {};

    if (filters.search) {
      where.OR = [
        { fullName: { contains: filters.search, mode: 'insensitive' } },
        { email: { contains: filters.search, mode: 'insensitive' } },
        { phone: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters.organizationId) {
      where.organizations = {
        some: {
          orgId: filters.organizationId,
          isActive: true,
        },
      };
    }

    const [people, total] = await Promise.all([
      this.prisma.person.findMany({
        where,
        include: {
          organizations: {
            include: {
              org: true,
            },
          },
        },
        take: filters.limit || 50,
        skip: filters.offset || 0,
        orderBy: { fullName: 'asc' },
      }),
      this.prisma.person.count({ where }),
    ]);

    return {
      data: people,
      total,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    };
  }

  async findOne(id: string) {
    const person = await this.prisma.person.findUnique({
      where: { id },
      include: {
        organizations: {
          include: {
            org: true,
          },
        },
        consultations: {
          include: {
            doctor: {
              include: {
                user: true,
              },
            },
          },
          orderBy: { dateTimeUtc: 'desc' },
        },
        interventions: {
          include: {
            doctor: {
              include: {
                user: true,
              },
            },
            reminders: {
              where: { status: 'SCHEDULED' },
              orderBy: { plannedSendUtc: 'asc' },
            },
          },
          orderBy: { scheduledAtUtc: 'asc' },
        },
      },
    });

    if (!person) {
      throw new NotFoundException('Personne non trouvée');
    }

    return person;
  }

  async update(id: string, updatePersonDto: UpdatePersonDto) {
    const person = await this.findOne(id);

    return this.prisma.person.update({
      where: { id },
      data: updatePersonDto,
      include: {
        organizations: {
          include: {
            org: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const person = await this.findOne(id);

    await this.prisma.person.delete({
      where: { id },
    });

    return { message: 'Personne supprimée avec succès' };
  }

  async attachToOrganization(personId: string, organizationId: string, role?: string) {
    const [person, organization] = await Promise.all([
      this.prisma.person.findUnique({ where: { id: personId } }),
      this.prisma.organization.findUnique({ where: { id: organizationId } }),
    ]);

    if (!person) {
      throw new NotFoundException('Personne non trouvée');
    }

    if (!organization) {
      throw new NotFoundException('Organisation non trouvée');
    }

    return this.prisma.personOrganization.upsert({
      where: {
        personId_orgId: {
          personId,
          orgId: organizationId,
        },
      },
      update: {
        role,
        isActive: true,
      },
      create: {
        personId,
        orgId: organizationId,
        role,
        isActive: true,
      },
    });
  }

  async detachFromOrganization(personId: string, organizationId: string) {
    return this.prisma.personOrganization.update({
      where: {
        personId_orgId: {
          personId,
          orgId: organizationId,
        },
      },
      data: {
        isActive: false,
        endAt: new Date(),
      },
    });
  }
}
