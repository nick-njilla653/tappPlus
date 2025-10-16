import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';
import { NotificationsService } from './notifications.service';
import { NotificationsController } from './notifications.controller';
import { EmailService } from './providers/email.service';
import { SmsService } from './providers/sms.service';
import { PushService } from './providers/push.service';
import { InterventionsModule } from '../interventions/interventions.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'reminder-queue',
    }),
    InterventionsModule,
  ],
  providers: [
    NotificationsService,
    EmailService,
    SmsService,
    PushService,
  ],
  controllers: [NotificationsController],
  exports: [NotificationsService],
})
export class NotificationsModule {}
