import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../common/prisma/prisma.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';

@Injectable()
export class OrganizationsService {
  constructor(private prisma: PrismaService) {}

  async create(createOrganizationDto: CreateOrganizationDto) {
    return this.prisma.organization.create({
      data: createOrganizationDto,
      include: {
        people: {
          include: {
            person: true,
          },
        },
        users: {
          include: {
            doctor: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.organization.findMany({
      include: {
        people: {
          include: {
            person: true,
          },
        },
        users: {
          include: {
            doctor: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const organization = await this.prisma.organization.findUnique({
      where: { id },
      include: {
        people: {
          include: {
            person: true,
          },
        },
        users: {
          include: {
            doctor: true,
          },
        },
      },
    });

    if (!organization) {
      throw new NotFoundException('Organisation non trouvée');
    }

    return organization;
  }

  async update(id: string, updateOrganizationDto: UpdateOrganizationDto) {
    const organization = await this.findOne(id);

    return this.prisma.organization.update({
      where: { id },
      data: updateOrganizationDto,
      include: {
        people: {
          include: {
            person: true,
          },
        },
        users: {
          include: {
            doctor: true,
          },
        },
      },
    });
  }

  async remove(id: string) {
    const organization = await this.findOne(id);

    await this.prisma.organization.delete({
      where: { id },
    });

    return { message: 'Organisation supprimée avec succès' };
  }

  async getStats(id: string) {
    const organization = await this.findOne(id);

    const [totalPeople, totalUsers, totalConsultations, totalInterventions] = await Promise.all([
      this.prisma.personOrganization.count({
        where: { orgId: id, isActive: true },
      }),
      this.prisma.user.count({
        where: { organizationId: id, isActive: true },
      }),
      this.prisma.consultation.count({
        where: {
          person: {
            organizations: {
              some: { orgId: id, isActive: true },
            },
          },
        },
      }),
      this.prisma.intervention.count({
        where: {
          person: {
            organizations: {
              some: { orgId: id, isActive: true },
            },
          },
        },
      }),
    ]);

    return {
      organization: organization.name,
      stats: {
        totalPeople,
        totalUsers,
        totalConsultations,
        totalInterventions,
      },
    };
  }
}
