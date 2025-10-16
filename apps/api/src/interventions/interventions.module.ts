import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { InterventionsService } from './interventions.service';
import { InterventionsController } from './interventions.controller';
import { ReminderSchedulerService } from './reminder-scheduler.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'reminder-queue',
    }),
  ],
  providers: [InterventionsService, ReminderSchedulerService],
  controllers: [InterventionsController],
  exports: [InterventionsService, ReminderSchedulerService],
})
export class InterventionsModule {}
