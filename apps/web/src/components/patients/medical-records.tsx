'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import { 
  DocumentTextIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  CalendarIcon,
  UserIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-picker';
import { LoadingSpinner } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';

interface MedicalRecord {
  id: string;
  patientId: string;
  title: string;
  description: string;
  type: 'CONSULTATION' | 'EXAMEN' | 'PRESCRIPTION' | 'HOSPITALISATION' | 'VACCINATION' | 'AUTRE';
  date: string;
  doctor: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
  attachments?: string[];
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
  updatedAt: string;
}

interface MedicalRecordsProps {
  patientId: string;
  patientName: string;
}

// Interface pour mapper les données de l'API vers l'interface MedicalRecord
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

// Fonction pour mapper les interventions en dossiers médicaux
const mapInterventionToMedicalRecord = (intervention: ApiIntervention): MedicalRecord => {
  const doctorName = intervention.doctor?.user 
    ? `Dr. ${intervention.doctor.user.firstName} ${intervention.doctor.user.lastName}`
    : 'Dr. Inconnu';

  return {
    id: intervention.id,
    patientId: intervention.personId,
    title: intervention.title,
    description: intervention.description || '',
    type: 'CONSULTATION', // Par défaut, toutes les interventions sont des consultations
    date: intervention.scheduledAtUtc,
    doctor: doctorName,
    diagnosis: intervention.status === 'DONE' ? 'Intervention terminée' : 'En cours',
    treatment: intervention.description || 'Aucun traitement spécifique',
    notes: `Intervention ${intervention.priority.toLowerCase()} - ${intervention.location || 'Lieu non spécifié'}`,
    status: intervention.status === 'CANCELLED' ? 'ARCHIVED' : 'ACTIVE',
    createdAt: intervention.createdAt,
    updatedAt: intervention.updatedAt
  };
};

export function MedicalRecords({ patientId, patientName }: MedicalRecordsProps) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Chargement des interventions du patient via React Query
  const { data: interventionsData, isLoading, error, refetch } = useQuery(
    ['patient-interventions', patientId],
    () => apiClient.getInterventions({ personId: patientId }),
    {
      enabled: !!patientId,
      onSuccess: (data) => {
        const mappedRecords = data.map(mapInterventionToMedicalRecord);
        setRecords(mappedRecords);
        setLoading(false);
      },
      onError: (error) => {
        console.error('Erreur lors du chargement des dossiers médicaux:', error);
        toast.error('Erreur lors du chargement des dossiers médicaux');
        setLoading(false);
      }
    }
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [filterType, setFilterType] = useState<string>('ALL');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'CONSULTATION' as 'CONSULTATION' | 'EXAMEN' | 'PRESCRIPTION' | 'HOSPITALISATION' | 'VACCINATION' | 'AUTRE',
    date: '',
    doctor: '',
    diagnosis: '',
    treatment: '',
    notes: '',
  });

  const filteredRecords = records.filter(record => 
    filterType === 'ALL' || record.type === filterType
  );

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return <Badge variant="default">Consultation</Badge>;
      case 'EXAMEN':
        return <Badge variant="secondary">Examen</Badge>;
      case 'PRESCRIPTION':
        return <Badge variant="outline">Prescription</Badge>;
      case 'HOSPITALISATION':
        return <Badge variant="destructive">Hospitalisation</Badge>;
      case 'VACCINATION':
        return <Badge variant="secondary">Vaccination</Badge>;
      case 'AUTRE':
        return <Badge variant="outline">Autre</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CONSULTATION':
        return <UserIcon className="h-5 w-5" />;
      case 'EXAMEN':
        return <HeartIcon className="h-5 w-5" />;
      case 'PRESCRIPTION':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'HOSPITALISATION':
        return <ExclamationTriangleIcon className="h-5 w-5" />;
      case 'VACCINATION':
        return <CheckCircleIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleCreateRecord = async () => {
    setLoading(true);
    try {
      const newRecord: MedicalRecord = {
        id: Date.now().toString(),
        patientId,
        ...formData,
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      setRecords(prev => [newRecord, ...prev]);
      setShowCreateModal(false);
      resetForm();
      toast.success('Dossier médical créé avec succès');
    } catch (error) {
      toast.error('Erreur lors de la création du dossier');
    } finally {
      setLoading(false);
    }
  };

  const handleEditRecord = async () => {
    if (!selectedRecord) return;
    
    setLoading(true);
    try {
      const updatedRecord = {
        ...selectedRecord,
        ...formData,
        updatedAt: new Date().toISOString()
      };
      
      setRecords(prev => prev.map(r => r.id === selectedRecord.id ? updatedRecord : r));
      setShowEditModal(false);
      setSelectedRecord(null);
      resetForm();
      toast.success('Dossier médical mis à jour avec succès');
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du dossier');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async (record: MedicalRecord) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce dossier médical ?')) {
      try {
        setRecords(prev => prev.filter(r => r.id !== record.id));
        toast.success('Dossier médical supprimé avec succès');
      } catch (error) {
        toast.error('Erreur lors de la suppression du dossier');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      type: 'CONSULTATION',
      date: '',
      doctor: '',
      diagnosis: '',
      treatment: '',
      notes: '',
    });
  };

  const openEditModal = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setFormData({
      title: record.title,
      description: record.description,
      type: record.type,
      date: record.date,
      doctor: record.doctor,
      diagnosis: record.diagnosis || '',
      treatment: record.treatment || '',
      notes: record.notes || '',
    });
    setShowEditModal(true);
  };

  const openDetailModal = (record: MedicalRecord) => {
    setSelectedRecord(record);
    setShowDetailModal(true);
  };

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
        <DocumentTextIcon className="mx-auto h-12 w-12 text-red-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Erreur de chargement</h3>
        <p className="mt-1 text-sm text-gray-500">
          Impossible de charger les dossiers médicaux. Veuillez réessayer.
        </p>
        <Button onClick={() => refetch()} className="mt-4">
          Réessayer
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Dossier médical</h2>
          <p className="text-sm text-gray-500">Gestion du dossier médical de {patientName}</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouveau dossier
        </Button>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <Label htmlFor="filter-type">Type de dossier</Label>
        <Select
          id="filter-type"
          value={filterType}
          onValueChange={setFilterType}
          options={[
            { value: 'ALL', label: 'Tous les types' },
            { value: 'CONSULTATION', label: 'Consultations' },
            { value: 'EXAMEN', label: 'Examens' },
            { value: 'PRESCRIPTION', label: 'Prescriptions' },
            { value: 'HOSPITALISATION', label: 'Hospitalisations' },
            { value: 'VACCINATION', label: 'Vaccinations' },
            { value: 'AUTRE', label: 'Autres' },
          ]}
        />
      </div>

      {/* Records List */}
      <div className="space-y-4">
        {filteredRecords.length > 0 ? (
          filteredRecords.map((record) => (
            <Card key={record.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                        {getTypeIcon(record.type)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h3 className="text-lg font-medium text-gray-900">{record.title}</h3>
                        {getTypeBadge(record.type)}
                      </div>
                      <p className="text-gray-600 mb-2">{record.description}</p>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <CalendarIcon className="h-4 w-4 mr-1" />
                          {formatDate(record.date)}
                        </div>
                        <div className="flex items-center">
                          <UserIcon className="h-4 w-4 mr-1" />
                          {record.doctor}
                        </div>
                      </div>
                      {record.diagnosis && (
                        <div className="mt-2">
                          <span className="text-sm font-medium text-gray-900">Diagnostic: </span>
                          <span className="text-sm text-gray-600">{record.diagnosis}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openDetailModal(record)}
                    >
                      <EyeIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditModal(record)}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteRecord(record)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="text-center py-8">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun dossier médical</h3>
            <p className="mt-1 text-sm text-gray-500">
              Commencez par créer un nouveau dossier médical pour ce patient.
            </p>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} size="lg" title="Nouveau dossier médical">
        <form onSubmit={(e) => { e.preventDefault(); handleCreateRecord(); }}>
          <ModalContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Titre *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Consultation de suivi"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du dossier médical"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="type">Type *</Label>
                  <Select
                    id="type"
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                    options={[
                      { value: 'CONSULTATION', label: 'Consultation' },
                      { value: 'EXAMEN', label: 'Examen' },
                      { value: 'PRESCRIPTION', label: 'Prescription' },
                      { value: 'HOSPITALISATION', label: 'Hospitalisation' },
                      { value: 'VACCINATION', label: 'Vaccination' },
                      { value: 'AUTRE', label: 'Autre' },
                    ]}
                  />
                </div>
                <div>
                  <Label htmlFor="date">Date *</Label>
                  <DateTimePicker
                    id="date"
                    value={formData.date}
                    onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="doctor">Médecin *</Label>
                <Input
                  id="doctor"
                  value={formData.doctor}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctor: e.target.value }))}
                  placeholder="Ex: Dr. Jean Mballa"
                  required
                />
              </div>
              <div>
                <Label htmlFor="diagnosis">Diagnostic</Label>
                <Input
                  id="diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Diagnostic établi"
                />
              </div>
              <div>
                <Label htmlFor="treatment">Traitement</Label>
                <Textarea
                  id="treatment"
                  value={formData.treatment}
                  onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                  placeholder="Traitement prescrit"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes supplémentaires"
                  rows={2}
                />
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowCreateModal(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Création...
                </>
              ) : (
                'Créer'
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} size="lg" title="Modifier le dossier médical">
        <form onSubmit={(e) => { e.preventDefault(); handleEditRecord(); }}>
          <ModalContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Titre *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Ex: Consultation de suivi"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description du dossier médical"
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-type">Type *</Label>
                  <Select
                    id="edit-type"
                    value={formData.type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as any }))}
                    options={[
                      { value: 'CONSULTATION', label: 'Consultation' },
                      { value: 'EXAMEN', label: 'Examen' },
                      { value: 'PRESCRIPTION', label: 'Prescription' },
                      { value: 'HOSPITALISATION', label: 'Hospitalisation' },
                      { value: 'VACCINATION', label: 'Vaccination' },
                      { value: 'AUTRE', label: 'Autre' },
                    ]}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-date">Date *</Label>
                  <DateTimePicker
                    id="edit-date"
                    value={formData.date}
                    onChange={(value) => setFormData(prev => ({ ...prev, date: value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-doctor">Médecin *</Label>
                <Input
                  id="edit-doctor"
                  value={formData.doctor}
                  onChange={(e) => setFormData(prev => ({ ...prev, doctor: e.target.value }))}
                  placeholder="Ex: Dr. Jean Mballa"
                  required
                />
              </div>
              <div>
                <Label htmlFor="edit-diagnosis">Diagnostic</Label>
                <Input
                  id="edit-diagnosis"
                  value={formData.diagnosis}
                  onChange={(e) => setFormData(prev => ({ ...prev, diagnosis: e.target.value }))}
                  placeholder="Diagnostic établi"
                />
              </div>
              <div>
                <Label htmlFor="edit-treatment">Traitement</Label>
                <Textarea
                  id="edit-treatment"
                  value={formData.treatment}
                  onChange={(e) => setFormData(prev => ({ ...prev, treatment: e.target.value }))}
                  placeholder="Traitement prescrit"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="edit-notes">Notes</Label>
                <Textarea
                  id="edit-notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Notes supplémentaires"
                  rows={2}
                />
              </div>
            </div>
          </ModalContent>
          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowEditModal(false)}
              disabled={loading}
            >
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Mise à jour...
                </>
              ) : (
                'Mettre à jour'
              )}
            </Button>
          </ModalFooter>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} size="lg" title="Détails du dossier médical">
        {selectedRecord && (
          <>
            <ModalContent>
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                      {getTypeIcon(selectedRecord.type)}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h2 className="text-xl font-bold text-gray-900">{selectedRecord.title}</h2>
                      {getTypeBadge(selectedRecord.type)}
                    </div>
                    <p className="text-gray-600">{selectedRecord.description}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Informations générales</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">Date:</span>
                        <p className="text-gray-900">{formatDate(selectedRecord.date)}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Médecin:</span>
                        <p className="text-gray-900">{selectedRecord.doctor}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">Statut:</span>
                        <Badge variant={selectedRecord.status === 'ACTIVE' ? 'default' : 'secondary'}>
                          {selectedRecord.status === 'ACTIVE' ? 'Actif' : 'Archivé'}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-medium text-gray-900">Informations médicales</h3>
                    {selectedRecord.diagnosis && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Diagnostic:</span>
                        <p className="text-gray-900">{selectedRecord.diagnosis}</p>
                      </div>
                    )}
                    {selectedRecord.treatment && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Traitement:</span>
                        <p className="text-gray-900">{selectedRecord.treatment}</p>
                      </div>
                    )}
                    {selectedRecord.notes && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Notes:</span>
                        <p className="text-gray-900">{selectedRecord.notes}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </ModalContent>
            <ModalFooter>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDetailModal(false)}
              >
                Fermer
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDetailModal(false);
                  openEditModal(selectedRecord);
                }}
              >
                <PencilIcon className="h-4 w-4 mr-2" />
                Modifier
              </Button>
            </ModalFooter>
          </>
        )}
      </Modal>
    </div>
  );
}
