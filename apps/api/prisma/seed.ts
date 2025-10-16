import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  // Créer une organisation par défaut
  const organization = await prisma.organization.upsert({
    where: { id: 'org_default' },
    update: {},
    create: {
      id: 'org_default',
      name: 'Hôpital Central de Douala',
    },
  });

  // Créer un utilisateur admin par défaut
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@meditache.com' },
    update: {},
    create: {
      email: 'admin@meditache.com',
      phone: '+237 6 12 34 56 78',
      role: 'ADMIN',
      timezone: 'Africa/Douala',
      password: hashedPassword,
      organizationId: organization.id,
    },
  });

  // Créer un médecin par défaut
  const doctor = await prisma.doctor.upsert({
    where: { userId: adminUser.id },
    update: {},
    create: {
      userId: adminUser.id,
      speciality: 'Médecine Générale',
      license: 'MG001',
    },
  });

  // Créer quelques patients d'exemple
  const patients = await Promise.all([
    prisma.person.upsert({
      where: { id: 'person_1' },
      update: {},
      create: {
        id: 'person_1',
        fullName: 'Marie Nguema',
        birthdate: new Date('1985-03-15'),
        phone: '+237 6 98 76 54 32',
        email: 'marie.nguema@email.com',
        address: 'Quartier Akwa, Douala',
      },
    }),
    prisma.person.upsert({
      where: { id: 'person_2' },
      update: {},
      create: {
        id: 'person_2',
        fullName: 'Jean Mballa',
        birthdate: new Date('1978-11-22'),
        phone: '+237 6 55 44 33 22',
        email: 'jean.mballa@email.com',
        address: 'Quartier Bonanjo, Douala',
      },
    }),
    prisma.person.upsert({
      where: { id: 'person_3' },
      update: {},
      create: {
        id: 'person_3',
        fullName: 'Fatou Diallo',
        birthdate: new Date('1992-07-08'),
        phone: '+237 6 77 88 99 00',
        email: 'fatou.diallo@email.com',
        address: 'Quartier New Bell, Douala',
      },
    }),
  ]);

  // Lier les patients à l'organisation
  await Promise.all(
    patients.map((patient) =>
      prisma.personOrganization.upsert({
        where: {
          personId_orgId: {
            personId: patient.id,
            orgId: organization.id,
          },
        },
        update: {},
        create: {
          personId: patient.id,
          orgId: organization.id,
          role: 'EMPLOYEE',
        },
      })
    )
  );

  // Créer quelques consultations d'exemple
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfterTomorrow = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);

  await Promise.all([
    prisma.consultation.create({
      data: {
        personId: patients[0].id,
        doctorId: doctor.id,
        dateTimeUtc: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000), // Il y a 2 jours
        notes: 'Consultation de routine - Tension artérielle normale',
        status: 'COMPLETED',
      },
    }),
    prisma.consultation.create({
      data: {
        personId: patients[1].id,
        doctorId: doctor.id,
        dateTimeUtc: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000), // Il y a 1 semaine
        notes: 'Suivi post-opératoire - Cicatrisation normale',
        status: 'COMPLETED',
      },
    }),
  ]);

  // Créer quelques interventions avec rappels
  const interventions = await Promise.all([
    prisma.intervention.create({
      data: {
        personId: patients[0].id,
        doctorId: doctor.id,
        title: 'Visite à domicile - Suivi diabète',
        description: 'Contrôle glycémique et adaptation du traitement',
        scheduledAtUtc: tomorrow,
        priority: 'NORMAL',
        status: 'PLANNED',
        location: 'Quartier Akwa, Douala',
      },
    }),
    prisma.intervention.create({
      data: {
        personId: patients[1].id,
        doctorId: doctor.id,
        title: 'Consultation urgente - Douleurs thoraciques',
        description: 'Évaluation cardiaque urgente',
        scheduledAtUtc: dayAfterTomorrow,
        priority: 'URGENT',
        status: 'PLANNED',
        location: 'Hôpital Central de Douala',
      },
    }),
    prisma.intervention.create({
      data: {
        personId: patients[2].id,
        doctorId: doctor.id,
        title: 'Vaccination - Rappel DTP',
        description: 'Rappel vaccinal DTPolio',
        scheduledAtUtc: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
        priority: 'NORMAL',
        status: 'PLANNED',
        location: 'Centre de santé New Bell',
      },
    }),
  ]);

  // Créer les règles de rappel par défaut pour chaque intervention
  for (const intervention of interventions) {
    // Règle J-1 (24h avant)
    await prisma.reminderRule.create({
      data: {
        interventionId: intervention.id,
        offsetMinutes: -1440, // 24h avant
        channel: 'SMS',
        enabled: true,
      },
    });

    // Règle H-1 (1h avant)
    await prisma.reminderRule.create({
      data: {
        interventionId: intervention.id,
        offsetMinutes: -60, // 1h avant
        channel: 'SMS',
        enabled: true,
      },
    });

    // Pour les interventions urgentes, ajouter un rappel immédiat
    if (intervention.priority === 'URGENT') {
      await prisma.reminderRule.create({
        data: {
          interventionId: intervention.id,
          offsetMinutes: 0, // Immédiat
          channel: 'SMS',
          enabled: true,
        },
      });
    }
  }

  console.log('✅ Seeding terminé avec succès !');
  console.log(`📊 Données créées :
  - 1 Organisation: ${organization.name}
  - 1 Utilisateur Admin: ${adminUser.email}
  - 1 Médecin: ${doctor.speciality}
  - 3 Patients
  - 2 Consultations passées
  - 3 Interventions programmées
  - Règles de rappel automatiques`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seeding:', e);
    throw e;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
