import { PartialType } from '@nestjs/swagger';
import { CreateInterventionDto } from './create-intervention.dto';
import { IsEnum, IsOptional } from 'class-validator';

export class UpdateInterventionDto extends PartialType(CreateInterventionDto) {
  @IsOptional()
  @IsEnum(['PLANNED', 'IN_PROGRESS', 'DONE', 'CANCELED'])
  status?: string;
}
