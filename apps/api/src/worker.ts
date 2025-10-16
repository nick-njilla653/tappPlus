import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ReminderSchedulerService } from './interventions/reminder-scheduler.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const reminderScheduler = app.get(ReminderSchedulerService);

  console.log('🔄 Worker de rappels démarré');

  // Traiter les rappels programmés toutes les minutes
  setInterval(async () => {
    try {
      await reminderScheduler.processScheduledReminders();
    } catch (error) {
      console.error('❌ Erreur dans le worker de rappels:', error);
    }
  }, 60000); // 1 minute

  // Traitement initial
  await reminderScheduler.processScheduledReminders();

  console.log('✅ Worker de rappels en cours d\'exécution...');
}

bootstrap().catch((error) => {
  console.error('❌ Erreur lors du démarrage du worker:', error);
  process.exit(1);
});
