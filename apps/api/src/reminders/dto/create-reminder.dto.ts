import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum ReminderType {
  EMAIL = 'EMAIL',
  SMS = 'SMS',
  PUSH = 'PUSH',
}

export enum ReminderStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  FAILED = 'FAILED',
  CANCELLED = 'CANCELLED',
}

export class CreateReminderDto {
  @ApiProperty({ description: 'ID de l\'intervention associée' })
  @IsString()
  interventionId: string;

  @ApiProperty({ description: 'Type de rappel', enum: ReminderType })
  @IsEnum(ReminderType)
  type: ReminderType;

  @ApiProperty({ description: 'Date et heure d\'envoi du rappel' })
  @IsDateString()
  scheduledAt: string;

  @ApiPropertyOptional({ description: 'Message personnalisé' })
  @IsOptional()
  @IsString()
  message?: string;

  @ApiPropertyOptional({ description: 'Destinataire (email, téléphone, etc.)' })
  @IsOptional()
  @IsString()
  recipient?: string;

  @ApiPropertyOptional({ description: 'Statut du rappel', enum: ReminderStatus, default: ReminderStatus.PENDING })
  @IsOptional()
  @IsEnum(ReminderStatus)
  status?: ReminderStatus;
}
