import { Controller, Get, Post, Body, Param, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { NotificationsService } from './notifications.service';
import { EmailService } from './providers/email.service';
import { SmsService } from './providers/sms.service';
import { PushService } from './providers/push.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly emailService: EmailService,
    private readonly smsService: SmsService,
    private readonly pushService: PushService,
  ) {}

  @Get('stats')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Obtenir les statistiques des notifications' })
  @ApiResponse({ status: 200, description: 'Statistiques des notifications' })
  async getStats(@Query('interventionId') interventionId?: string) {
    return this.notificationsService.getNotificationStats(interventionId);
  }

  @Post('test/email')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Tester l\'envoi d\'email' })
  @ApiResponse({ status: 200, description: 'Email de test envoyé' })
  async testEmail(@Body('to') to: string) {
    return this.emailService.sendTestEmail(to);
  }

  @Post('test/sms')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Tester l\'envoi de SMS' })
  @ApiResponse({ status: 200, description: 'SMS de test envoyé' })
  async testSms(@Body('to') to: string) {
    return this.smsService.sendTestSms(to);
  }

  @Post('test/push')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Tester l\'envoi de push notification' })
  @ApiResponse({ status: 200, description: 'Push de test envoyé' })
  async testPush(@Body('token') token: string) {
    return this.pushService.sendTestPush(token);
  }
}
