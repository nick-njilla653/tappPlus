import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsDateString } from 'class-validator';

export class CreatePersonDto {
  @ApiProperty({
    description: 'Nom complet de la personne',
    example: 'Marie Nguema',
  })
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Date de naissance',
    example: '1985-03-15',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  birthdate?: string;

  @ApiProperty({
    description: 'Numéro de téléphone',
    example: '+237 6 12 34 56 78',
    required: false,
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Adresse email',
    example: 'marie.nguema@email.com',
    required: false,
  })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({
    description: 'Adresse physique',
    example: 'Quartier Akwa, Douala',
    required: false,
  })
  @IsOptional()
  @IsString()
  address?: string;
}
