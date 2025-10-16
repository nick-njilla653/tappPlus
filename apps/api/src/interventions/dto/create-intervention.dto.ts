import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsEnum, IsOptional, IsArray, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class ReminderRuleDto {
  @ApiProperty({
    description: 'Délai en minutes avant l\'intervention (négatif)',
    example: -1440,
  })
  @IsNumber()
  offsetMinutes: number;

  @ApiProperty({
    description: 'Canal de notification',
    enum: ['EMAIL', 'SMS', 'PUSH'],
    example: 'SMS',
  })
  @IsEnum(['EMAIL', 'SMS', 'PUSH'])
  channel: string;

  @ApiProperty({
    description: 'Activer cette règle',
    example: true,
    required: false,
  })
  @IsOptional()
  enabled?: boolean;
}

export class CreateInterventionDto {
  @ApiProperty({
    description: 'ID de la personne',
    example: 'person_123',
  })
  @IsString()
  personId: string;

  @ApiProperty({
    description: 'ID du médecin',
    example: 'doctor_456',
  })
  @IsString()
  doctorId: string;

  @ApiProperty({
    description: 'Titre de l\'intervention',
    example: 'Visite à domicile - Suivi diabète',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Description de l\'intervention',
    example: 'Contrôle glycémique et adaptation du traitement',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Date et heure programmée (ISO 8601)',
    example: '2025-10-16T10:30:00+01:00',
  })
  @IsDateString()
  scheduledAt: string;

  @ApiProperty({
    description: 'Priorité de l\'intervention',
    enum: ['NORMAL', 'URGENT'],
    example: 'NORMAL',
    required: false,
  })
  @IsOptional()
  @IsEnum(['NORMAL', 'URGENT'])
  priority?: string;

  @ApiProperty({
    description: 'Lieu de l\'intervention',
    example: 'Quartier Akwa, Douala',
    required: false,
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'Règles de rappel personnalisées',
    type: [ReminderRuleDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReminderRuleDto)
  rules?: ReminderRuleDto[];
}
