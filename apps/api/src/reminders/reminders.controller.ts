import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RemindersService } from './reminders.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Reminders')
@Controller('reminders')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class RemindersController {
  constructor(private readonly remindersService: RemindersService) {}

  @Get()
  @ApiOperation({ summary: 'Lister les rappels' })
  @ApiQuery({ name: 'status', required: false, description: 'Statut du rappel' })
  @ApiQuery({ name: 'interventionId', required: false, description: 'ID de l\'intervention' })
  @ApiQuery({ name: 'from', required: false, description: 'Date de début (ISO 8601)' })
  @ApiQuery({ name: 'to', required: false, description: 'Date de fin (ISO 8601)' })
  @ApiResponse({ status: 200, description: 'Liste des rappels' })
  async findAll(
    @Query('status') status?: string,
    @Query('interventionId') interventionId?: string,
    @Query('from') from?: string,
    @Query('to') to?: string,
  ) {
    return this.remindersService.findAll({
      status,
      interventionId,
      from,
      to,
    });
  }

  @Get('stats')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Obtenir les statistiques des rappels' })
  @ApiResponse({ status: 200, description: 'Statistiques des rappels' })
  async getStats() {
    return this.remindersService.getStats();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir un rappel par ID' })
  @ApiResponse({ status: 200, description: 'Rappel trouvé' })
  @ApiResponse({ status: 404, description: 'Rappel non trouvé' })
  async findOne(@Param('id') id: string) {
    return this.remindersService.findOne(id);
  }

  @Post()
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Créer un nouveau rappel' })
  @ApiResponse({ status: 201, description: 'Rappel créé avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() createReminderDto: CreateReminderDto) {
    return this.remindersService.create(createReminderDto);
  }

  @Patch(':id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Mettre à jour un rappel' })
  @ApiResponse({ status: 200, description: 'Rappel mis à jour avec succès' })
  @ApiResponse({ status: 404, description: 'Rappel non trouvé' })
  async update(@Param('id') id: string, @Body() updateReminderDto: UpdateReminderDto) {
    return this.remindersService.update(id, updateReminderDto);
  }

  @Delete(':id')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Supprimer un rappel' })
  @ApiResponse({ status: 200, description: 'Rappel supprimé avec succès' })
  @ApiResponse({ status: 404, description: 'Rappel non trouvé' })
  async remove(@Param('id') id: string) {
    return this.remindersService.remove(id);
  }

  @Post(':id/retry')
  @Roles('ADMIN', 'DOCTOR')
  @ApiOperation({ summary: 'Relancer un rappel échoué' })
  @ApiResponse({ status: 200, description: 'Rappel relancé avec succès' })
  @ApiResponse({ status: 400, description: 'Impossible de relancer ce rappel' })
  async retryFailedReminder(@Param('id') id: string) {
    return this.remindersService.retryFailedReminder(id);
  }
}
