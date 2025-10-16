'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import { 
  CalendarIcon, 
  MapPinIcon, 
  UserIcon, 
  ClockIcon,
  PlusIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  PencilIcon,
  EyeIcon,
  TableCellsIcon,
  CalendarDaysIcon
} from '@heroicons/react/24/outline';
import { CreateInterventionModal } from '@/components/modals/create-intervention-modal';
import { InterventionDetailModal } from '@/components/modals/intervention-detail-modal';
import { EditInterventionModal } from '@/components/modals/edit-intervention-modal';
import { CalendarView } from './calendar-view';
import { InterventionsTable } from './interventions-table';
import { SearchFilter } from '@/components/ui/search-filter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';
import { Intervention } from '@/types';

// Interface pour mapper les données de l'API vers l'interface Intervention
interface ApiIntervention {
  id: string;
  personId: string;
  doctorId: string;
  title: string;
  description?: string;
  scheduledAtUtc: string;
  priority: string;
  status: string;
  location?: string;
  createdAt: string;
  updatedAt: string;
  person?: {
    id: string;
    firstName: string;
    lastName: string;
    createdAt: string;
    updatedAt: string;
  };
  doctor?: {
    id: string;
    userId: string;
    speciality?: string;
    isActive: boolean;
    user?: {
      firstName: string;
      lastName: string;
    };
  };
}

// Fonction pour mapper les données de l'API vers l'interface Intervention
const mapApiInterventionToIntervention = (apiIntervention: ApiIntervention): Intervention => {
  return {
    id: apiIntervention.id,
    personId: apiIntervention.personId,
    doctorId: apiIntervention.doctorId,
    title: apiIntervention.title,
    description: apiIntervention.description,
    scheduledAtUtc: apiIntervention.scheduledAtUtc,
    priority: apiIntervention.priority as 'NORMAL' | 'URGENT' | 'LOW',
    status: apiIntervention.status as 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'CANCELED',
    location: apiIntervention.location,
    createdAt: apiIntervention.createdAt,
    updatedAt: apiIntervention.updatedAt,
    person: apiIntervention.person ? {
      id: apiIntervention.person.id,
      fullName: `${apiIntervention.person.firstName} ${apiIntervention.person.lastName}`,
      createdAt: apiIntervention.person.createdAt,
      updatedAt: apiIntervention.person.updatedAt
    } : undefined,
    doctor: apiIntervention.doctor ? {
      id: apiIntervention.doctor.id,
      userId: apiIntervention.doctor.userId,
      speciality: apiIntervention.doctor.speciality,
      isActive: apiIntervention.doctor.isActive
    } : undefined
  };
};

export function InterventionsOverview() {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'calendar'>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  
  // États des modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedIntervention, setSelectedIntervention] = useState<Intervention | null>(null);
  const [selectedInterventionId, setSelectedInterventionId] = useState<string | null>(null);

  // Utilisation de React Query pour charger les interventions
  const { data: interventionsData, isLoading, error, refetch } = useQuery(
    'interventions',
    () => apiClient.getInterventions(),
    {
      onSuccess: (data) => {
        const mappedInterventions = data.map(mapApiInterventionToIntervention);
        setInterventions(mappedInterventions);
        setLoading(false);
      },
      onError: (error) => {
        console.error('Erreur lors du chargement des interventions:', error);
        toast.error('Erreur lors du chargement des interventions');
        setLoading(false);
      }
    }
  );

  const filteredInterventions = interventions.filter(intervention => {
    const matchesSearch = intervention.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (intervention.person?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
                         (intervention.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    const matchesStatus = filterStatus === 'ALL' || intervention.status === filterStatus;
    const matchesPriority = filterPriority === 'ALL' || intervention.priority === filterPriority;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination
  const totalPages = Math.ceil(filteredInterventions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInterventions = filteredInterventions.slice(startIndex, endIndex);

  // Handlers
  const handleViewIntervention = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
    setSelectedInterventionId(intervention.id);
    setShowDetailModal(true);
  };

  const handleEditIntervention = (intervention: Intervention) => {
    setSelectedIntervention(intervention);
    setSelectedInterventionId(intervention.id);
    setShowEditModal(true);
  };

  const handleDeleteIntervention = async (intervention: Intervention) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette intervention ?')) {
      try {
        await apiClient.deleteIntervention(intervention.id);
        setInterventions(prev => prev.filter(i => i.id !== intervention.id));
        toast.success('Intervention supprimée avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression de l\'intervention');
      }
    }
  };

  const handleCreateSuccess = () => {
    // Recharger les interventions via React Query
    refetch();
  };

  const filterOptions = [
    {
      key: 'status',
      label: 'Statut',
      type: 'select' as const,
      options: [
        { value: 'ALL', label: 'Tous' },
        { value: 'PLANNED', label: 'Planifiée' },
        { value: 'IN_PROGRESS', label: 'En cours' },
        { value: 'DONE', label: 'Terminée' },
        { value: 'CANCELLED', label: 'Annulée' },
      ],
    },
    {
      key: 'priority',
      label: 'Priorité',
      type: 'select' as const,
      options: [
        { value: 'ALL', label: 'Toutes' },
        { value: 'URGENT', label: 'Urgent' },
        { value: 'NORMAL', label: 'Normal' },
        { value: 'LOW', label: 'Faible' },
      ],
    },
  ];

  const filterValues = {
    status: filterStatus,
    priority: filterPriority,
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') {
      setFilterStatus(value);
    } else if (key === 'priority') {
      setFilterPriority(value);
    }
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleClearFilters = () => {
    setFilterStatus('ALL');
    setFilterPriority('ALL');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <ExclamationTriangleIcon className="w-3 h-3 mr-1" />
            Urgent
          </span>
        );
      case 'NORMAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Normal
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Faible
          </span>
        );
      default:
        return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Planifiée
          </span>
        );
      case 'IN_PROGRESS':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            En cours
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="w-3 h-3 mr-1" />
            Terminée
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircleIcon className="w-3 h-3 mr-1" />
            Annulée
          </span>
        );
      default:
        return null;
    }
  };

  const stats = [
    {
      name: 'Total interventions',
      value: interventions.length,
      icon: CalendarIcon,
      color: 'blue',
    },
    {
      name: 'À venir',
      value: interventions.filter(i => i.status === 'PLANNED').length,
      icon: ClockIcon,
      color: 'yellow',
    },
    {
      name: 'Urgentes',
      value: interventions.filter(i => i.priority === 'URGENT').length,
      icon: ExclamationTriangleIcon,
      color: 'red',
    },
    {
      name: 'Terminées',
      value: interventions.filter(i => i.status === 'DONE').length,
      icon: CheckCircleIcon,
      color: 'green',
    },
  ];

  if (loading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <CalendarIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Erreur de chargement</h3>
        <p className="mt-1 text-sm text-gray-500">
          Impossible de charger les interventions. Veuillez réessayer.
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.name}>
              <CardContent className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                      <dd className="text-lg font-medium text-gray-900">{stat.value}</dd>
                    </dl>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search and Filters */}
        <SearchFilter
          searchValue={searchTerm}
          onSearchChange={setSearchTerm}
          filters={filterOptions}
          filterValues={filterValues}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          placeholder="Rechercher par titre, patient..."
        />

        {/* Actions and View Toggle */}
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            Interventions ({filteredInterventions.length})
          </h2>
          <div className="flex items-center space-x-3">
            {/* View Mode Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <Button
                variant={viewMode === 'table' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="px-3"
              >
                <TableCellsIcon className="h-4 w-4 mr-1" />
                Tableau
              </Button>
              <Button
                variant={viewMode === 'calendar' ? 'default' : 'secondary'}
                size="sm"
                onClick={() => setViewMode('calendar')}
                className="px-3"
              >
                <CalendarDaysIcon className="h-4 w-4 mr-1" />
                Calendrier
              </Button>
            </div>
            
            <Button onClick={() => setShowCreateModal(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouvelle intervention
            </Button>
          </div>
        </div>

        {/* Content based on view mode */}
        {viewMode === 'table' ? (
          <InterventionsTable
            interventions={paginatedInterventions}
            onView={handleViewIntervention}
            onEdit={handleEditIntervention}
            onDelete={handleDeleteIntervention}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            totalItems={filteredInterventions.length}
          />
        ) : (
          <CalendarView
            interventions={filteredInterventions}
            onInterventionClick={handleViewIntervention}
          />
        )}
      </div>

      {/* Modales */}
      <CreateInterventionModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      
      <InterventionDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedIntervention(null);
          setSelectedInterventionId(null);
        }}
        interventionId={selectedInterventionId}
        onEdit={(id) => {
          setShowDetailModal(false);
          setShowEditModal(true);
        }}
        onDelete={(id) => {
          setInterventions(prev => prev.filter(i => i.id !== id));
          setShowDetailModal(false);
          setSelectedIntervention(null);
          setSelectedInterventionId(null);
        }}
      />
      
      <EditInterventionModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedIntervention(null);
          setSelectedInterventionId(null);
        }}
        interventionId={selectedInterventionId}
      />
    </>
  );
}
