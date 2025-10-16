import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { ConsultationsService } from './consultations.service';
import { CreateConsultationDto } from './dto/create-consultation.dto';
import { UpdateConsultationDto } from './dto/update-consultation.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Consultations')
@Controller('consultations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class ConsultationsController {
  constructor(private readonly consultationsService: ConsultationsService) {}

  @Post()
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Créer une nouvelle consultation' })
  @ApiResponse({ status: 201, description: 'Consultation créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() createConsultationDto: CreateConsultationDto) {
    return this.consultationsService.create(createConsultationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les consultations' })
  @ApiQuery({ name: 'personId', required: false, description: 'ID de la personne' })
  @ApiQuery({ name: 'doctorId', required: false, description: 'ID du médecin' })
  @ApiQuery({ name: 'status', required: false, description: 'Statut de la consultation' })
  @ApiQuery({ name: 'from', required: false, description: 'Date de début (ISO 8601)' })
  @ApiQuery({ name: 'to', required: false, description: 'Date de fin (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Liste des consultations' })
  async findAll(
    @Query('personId') personId?: string,
    @Query('doctorId') doctorId?: string,
    @Query('status') status?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.consultationsService.findAll({
      personId,
      doctorId,
      status,
      from,
      to,
    });
  }

  @Get('history/:personId')
  @ApiOperation({ summary: 'Obtenir l\'historique médical d\'une personne' })
  @ApiQuery({ name: 'doctorId', required: false, description: 'ID du médecin (optionnel)' })
  @ApiResponse({ status: 200, description: 'Historique médical' })
  async getPatientHistory(
    @Param('personId') personId: string,
    @Query('doctorId') doctorId?: string,
  ) {
    return this.consultationsService.getPatientHistory(personId, doctorId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une consultation par ID' })
  @ApiResponse({ status: 200, description: 'Consultation trouvée' })
  @ApiResponse({ status: 404, description: 'Consultation non trouvée' })
  async findOne(@Param('id') id: string) {
    return this.consultationsService.findOne(id);
  }

  @Patch(':id')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Modifier une consultation' })
  @ApiResponse({ status: 200, description: 'Consultation modifiée avec succès' })
  @ApiResponse({ status: 404, description: 'Consultation non trouvée' })
  async update(
    @Param('id') id: string,
    @Body() updateConsultationDto: UpdateConsultationDto,
  ) {
    return this.consultationsService.update(id, updateConsultationDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Supprimer une consultation' })
  @ApiResponse({ status: 200, description: 'Consultation supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Consultation non trouvée' })
  async remove(@Param('id') id: string) {
    return this.consultationsService.remove(id);
  }
}
