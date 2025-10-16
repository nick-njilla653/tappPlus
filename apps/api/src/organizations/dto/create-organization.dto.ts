import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty } from 'class-validator';

export class CreateOrganizationDto {
  @ApiProperty({
    description: 'Nom de l\'organisation',
    example: 'Hôpital Central de Douala',
  })
  @IsString()
  @IsNotEmpty()
  name: string;
}
