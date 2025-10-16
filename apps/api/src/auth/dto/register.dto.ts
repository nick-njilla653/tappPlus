import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Adresse email de l\'utilisateur',
    example: 'docteur@meditache.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Mot de passe',
    example: 'password123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Numéro de téléphone',
    example: '+237 6 12 34 56 78',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Rôle de l\'utilisateur',
    enum: ['ADMIN', 'DOCTOR', 'NURSE'],
    example: 'DOCTOR',
    required: false,
  })
  @IsOptional()
  @IsEnum(['ADMIN', 'DOCTOR', 'NURSE'])
  role?: string;

  @ApiProperty({
    description: 'Fuseau horaire',
    example: 'Africa/Douala',
    required: false,
  })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiProperty({
    description: 'ID de l\'organisation',
    example: 'org_123',
    required: false,
  })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiProperty({
    description: 'Spécialité médicale (pour les médecins)',
    example: 'Médecine Générale',
    required: false,
  })
  @IsOptional()
  @IsString()
  speciality?: string;

  @ApiProperty({
    description: 'Numéro de licence médicale',
    example: 'MG001',
    required: false,
  })
  @IsOptional()
  @IsString()
  license?: string;
}
