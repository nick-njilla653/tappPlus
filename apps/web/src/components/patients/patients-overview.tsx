'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import { 
  UserGroupIcon, 
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  CalendarIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  PencilIcon,
  EyeIcon,
  TableCellsIcon,
  Squares2X2Icon,
  ChartBarIcon,
  DocumentTextIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';
import { CreatePatientModal } from '@/components/modals/create-patient-modal';
import { PatientDetailModal } from '@/components/modals/patient-detail-modal';
import { EditPatientModal } from '@/components/modals/edit-patient-modal';
import { PatientsTable } from './patients-table';
import { PatientsGrid } from './patients-grid';
import { PatientsStats } from './patients-stats';
import { MedicalRecords } from './medical-records';
import { PatientsExport } from './patients-export';
import { SearchFilter } from '@/components/ui/search-filter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';

interface Patient {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  medicalHistory: string[];
  lastVisit: string;
  nextAppointment?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'AT_RISK';
  bloodType?: string;
  allergies: string[];
}

// Interface pour mapper les données de l'API vers l'interface Patient
interface ApiPerson {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  medicalHistory?: string;
  lastVisit?: string;
  nextAppointment?: string;
  status?: string;
  bloodType?: string;
  allergies?: string;
  createdAt: string;
  updatedAt: string;
}

// Fonction pour mapper les données de l'API vers l'interface Patient
const mapApiPersonToPatient = (apiPerson: ApiPerson): Patient => {
  return {
    id: apiPerson.id,
    fullName: `${apiPerson.firstName} ${apiPerson.lastName}`,
    email: apiPerson.email || '',
    phone: apiPerson.phone || '',
    dateOfBirth: apiPerson.dateOfBirth || '',
    address: apiPerson.address || '',
    medicalHistory: apiPerson.medicalHistory ? apiPerson.medicalHistory.split(',').map(h => h.trim()) : [],
    lastVisit: apiPerson.lastVisit || '',
    nextAppointment: apiPerson.nextAppointment,
    status: (apiPerson.status as 'ACTIVE' | 'INACTIVE' | 'AT_RISK') || 'ACTIVE',
    bloodType: apiPerson.bloodType,
    allergies: apiPerson.allergies ? apiPerson.allergies.split(',').map(a => a.trim()) : []
  };
};

export function PatientsOverview() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(12);
  const [activeTab, setActiveTab] = useState<'overview' | 'stats' | 'records' | 'export'>('overview');
  
  // États des modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Utilisation de React Query pour charger les patients
  const { data: peopleData, isLoading, error, refetch } = useQuery(
    'people',
    () => apiClient.getPeople({ limit: 100 }),
    {
      onSuccess: (data) => {
        const mappedPatients = data.data.map(mapApiPersonToPatient);
        setPatients(mappedPatients);
        setLoading(false);
      },
      onError: (error) => {
        console.error('Erreur lors du chargement des patients:', error);
        toast.error('Erreur lors du chargement des patients');
        setLoading(false);
      }
    }
  );

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.phone.includes(searchTerm);
    const matchesStatus = filterStatus === 'ALL' || patient.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination
  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedPatients = filteredPatients.slice(startIndex, endIndex);

  // Handlers
  const handleViewPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedPatientId(patient.id);
    setShowDetailModal(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setSelectedPatientId(patient.id);
    setShowEditModal(true);
  };

  const handleDeletePatient = async (patient: Patient) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      try {
        await apiClient.deletePerson(patient.id);
        setPatients(prev => prev.filter(p => p.id !== patient.id));
        toast.success('Patient supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression du patient');
      }
    }
  };

  const handleCreateSuccess = () => {
    // Recharger les patients via React Query
    refetch();
  };

  const filterOptions = [
    {
      key: 'status',
      label: 'Statut',
      type: 'select' as const,
      options: [
        { value: 'ALL', label: 'Tous' },
        { value: 'ACTIVE', label: 'Actif' },
        { value: 'AT_RISK', label: 'À risque' },
        { value: 'INACTIVE', label: 'Inactif' },
      ],
    },
  ];

  const filterValues = {
    status: filterStatus,
  };

  const handleFilterChange = (key: string, value: string) => {
    if (key === 'status') {
      setFilterStatus(value);
    }
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleClearFilters = () => {
    setFilterStatus('ALL');
    setSearchTerm('');
    setCurrentPage(1);
  };

  const stats = [
    {
      name: 'Total patients',
      value: patients.length,
      icon: UserGroupIcon,
      color: 'blue',
    },
    {
      name: 'Patients actifs',
      value: patients.filter(p => p.status === 'ACTIVE').length,
      icon: CheckCircleIcon,
      color: 'green',
    },
    {
      name: 'À risque',
      value: patients.filter(p => p.status === 'AT_RISK').length,
      icon: ExclamationTriangleIcon,
      color: 'yellow',
    },
    {
      name: 'Rendez-vous à venir',
      value: patients.filter(p => p.nextAppointment).length,
      icon: CalendarIcon,
      color: 'purple',
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
        <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Erreur de chargement</h3>
        <p className="mt-1 text-sm text-gray-500">
          Impossible de charger les patients. Veuillez réessayer.
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
        {/* Tabs Navigation */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', label: 'Vue d\'ensemble', icon: UserGroupIcon },
              { id: 'stats', label: 'Statistiques', icon: ChartBarIcon },
              { id: 'records', label: 'Dossiers médicaux', icon: DocumentTextIcon },
              { id: 'export', label: 'Exports', icon: DocumentArrowDownIcon },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="h-4 w-4 inline mr-2" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <>
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
              placeholder="Rechercher par nom, email, téléphone..."
            />

            {/* Actions and View Toggle */}
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">
                Patients ({filteredPatients.length})
              </h2>
              <div className="flex items-center space-x-3">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3"
                  >
                    <Squares2X2Icon className="h-4 w-4 mr-1" />
                    Grille
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'secondary'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="px-3"
                  >
                    <TableCellsIcon className="h-4 w-4 mr-1" />
                    Tableau
                  </Button>
                </div>
                
                <Button onClick={() => setShowCreateModal(true)}>
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Nouveau patient
                </Button>
              </div>
            </div>

            {/* Content based on view mode */}
            {viewMode === 'grid' ? (
              <PatientsGrid
                patients={paginatedPatients}
                onView={handleViewPatient}
                onEdit={handleEditPatient}
                onDelete={handleDeletePatient}
              />
            ) : (
              <PatientsTable
                patients={paginatedPatients}
                onView={handleViewPatient}
                onEdit={handleEditPatient}
                onDelete={handleDeletePatient}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
                itemsPerPage={itemsPerPage}
                totalItems={filteredPatients.length}
              />
            )}
          </>
        )}

        {activeTab === 'stats' && (
          <PatientsStats patients={patients} />
        )}

        {activeTab === 'records' && selectedPatient && (
          <MedicalRecords 
            patientId={selectedPatient.id} 
            patientName={selectedPatient.fullName} 
          />
        )}

        {activeTab === 'records' && !selectedPatient && (
          <div className="text-center py-12">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sélectionnez un patient</h3>
            <p className="mt-1 text-sm text-gray-500">
              Veuillez sélectionner un patient pour voir son dossier médical.
            </p>
          </div>
        )}

        {activeTab === 'export' && (
          <PatientsExport patients={patients} />
        )}
      </div>

      {/* Modales */}
      <CreatePatientModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
      />
      
      <PatientDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedPatient(null);
          setSelectedPatientId(null);
        }}
        patientId={selectedPatientId}
        onEdit={(id) => {
          setShowDetailModal(false);
          setShowEditModal(true);
        }}
        onDelete={(id) => {
          setPatients(prev => prev.filter(p => p.id !== id));
          setShowDetailModal(false);
          setSelectedPatient(null);
          setSelectedPatientId(null);
        }}
      />
      
      <EditPatientModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedPatient(null);
          setSelectedPatientId(null);
        }}
        patientId={selectedPatientId}
      />
    </>
  );
}
