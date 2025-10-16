import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('Organizations')
@Controller('organizations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Post()
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Créer une nouvelle organisation' })
  @ApiResponse({ status: 201, description: 'Organisation créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() createOrganizationDto: CreateOrganizationDto) {
    return this.organizationsService.create(createOrganizationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les organisations' })
  @ApiResponse({ status: 200, description: 'Liste des organisations' })
  async findAll() {
    return this.organizationsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une organisation par ID' })
  @ApiResponse({ status: 200, description: 'Organisation trouvée' })
  @ApiResponse({ status: 404, description: 'Organisation non trouvée' })
  async findOne(@Param('id') id: string) {
    return this.organizationsService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Obtenir les statistiques d\'une organisation' })
  @ApiResponse({ status: 200, description: 'Statistiques de l\'organisation' })
  @ApiResponse({ status: 404, description: 'Organisation non trouvée' })
  async getStats(@Param('id') id: string) {
    return this.organizationsService.getStats(id);
  }

  @Patch(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Modifier une organisation' })
  @ApiResponse({ status: 200, description: 'Organisation modifiée avec succès' })
  @ApiResponse({ status: 404, description: 'Organisation non trouvée' })
  async update(
    @Param('id') id: string,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    return this.organizationsService.update(id, updateOrganizationDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Supprimer une organisation' })
  @ApiResponse({ status: 200, description: 'Organisation supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Organisation non trouvée' })
  async remove(@Param('id') id: string) {
    return this.organizationsService.remove(id);
  }
}
