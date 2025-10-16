import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsDateString, IsOptional, IsEnum, IsArray } from 'class-validator';

export class CreateConsultationDto {
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
    description: 'Date et heure de la consultation (ISO 8601)',
    example: '2025-10-16T10:30:00+01:00',
  })
  @IsDateString()
  dateTime: string;

  @ApiProperty({
    description: 'Notes de la consultation',
    example: 'Consultation de routine - Tension artérielle normale',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    description: 'Pièces jointes (URLs des fichiers)',
    type: [String],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ApiProperty({
    description: 'Statut de la consultation',
    enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
    example: 'COMPLETED',
    required: false,
  })
  @IsOptional()
  @IsEnum(['SCHEDULED', 'COMPLETED', 'CANCELLED'])
  status?: string;
}
