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
import { PeopleService } from './people.service';
import { CreatePersonDto } from './dto/create-person.dto';
import { UpdatePersonDto } from './dto/update-person.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';

@ApiTags('People')
@Controller('people')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class PeopleController {
  constructor(private readonly peopleService: PeopleService) {}

  @Post()
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Créer une nouvelle personne' })
  @ApiResponse({ status: 201, description: 'Personne créée avec succès' })
  @ApiResponse({ status: 400, description: 'Données invalides' })
  async create(@Body() createPersonDto: CreatePersonDto) {
    return this.peopleService.create(createPersonDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lister les personnes' })
  @ApiQuery({ name: 'search', required: false, description: 'Recherche par nom, email ou téléphone' })
  @ApiQuery({ name: 'organizationId', required: false, description: 'ID de l\'organisation' })
  @ApiQuery({ name: 'limit', required: false, description: 'Nombre d\'éléments par page' })
  @ApiQuery({ name: 'offset', required: false, description: 'Décalage pour la pagination' })
  @ApiResponse({ status: 200, description: 'Liste des personnes' })
  async findAll(
    @Query('search') search?: string,
    @Query('organizationId') organizationId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.peopleService.findAll({
      search,
      organizationId,
      limit: limit ? parseInt(limit) : undefined,
      offset: offset ? parseInt(offset) : undefined,
    });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtenir une personne par ID' })
  @ApiResponse({ status: 200, description: 'Personne trouvée' })
  @ApiResponse({ status: 404, description: 'Personne non trouvée' })
  async findOne(@Param('id') id: string) {
    return this.peopleService.findOne(id);
  }

  @Patch(':id')
  @Roles('DOCTOR', 'ADMIN')
  @ApiOperation({ summary: 'Modifier une personne' })
  @ApiResponse({ status: 200, description: 'Personne modifiée avec succès' })
  @ApiResponse({ status: 404, description: 'Personne non trouvée' })
  async update(@Param('id') id: string, @Body() updatePersonDto: UpdatePersonDto) {
    return this.peopleService.update(id, updatePersonDto);
  }

  @Delete(':id')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Supprimer une personne' })
  @ApiResponse({ status: 200, description: 'Personne supprimée avec succès' })
  @ApiResponse({ status: 404, description: 'Personne non trouvée' })
  async remove(@Param('id') id: string) {
    return this.peopleService.remove(id);
  }

  @Post(':id/organizations/:organizationId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Attacher une personne à une organisation' })
  @ApiResponse({ status: 200, description: 'Personne attachée avec succès' })
  async attachToOrganization(
    @Param('id') id: string,
    @Param('organizationId') organizationId: string,
    @Body('role') role?: string,
  ) {
    return this.peopleService.attachToOrganization(id, organizationId, role);
  }

  @Delete(':id/organizations/:organizationId')
  @Roles('ADMIN')
  @ApiOperation({ summary: 'Détacher une personne d\'une organisation' })
  @ApiResponse({ status: 200, description: 'Personne détachée avec succès' })
  async detachFromOrganization(
    @Param('id') id: string,
    @Param('organizationId') organizationId: string,
  ) {
    return this.peopleService.detachFromOrganization(id, organizationId);
  }
}
