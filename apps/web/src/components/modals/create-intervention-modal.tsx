'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { apiClient } from '@/lib/api';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select } from '@/components/ui/select';
import { DateTimePicker } from '@/components/ui/date-picker';
import { LoadingSpinner } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';
import { CreateInterventionRequest } from '@/types';

interface CreateInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateInterventionModal({ isOpen, onClose }: CreateInterventionModalProps) {
  const [formData, setFormData] = useState<Partial<CreateInterventionRequest>>({
    title: '',
    description: '',
    scheduledAt: '',
    priority: 'NORMAL',
    location: '',
  });

  const queryClient = useQueryClient();

  // Récupérer la liste des patients
  const { data: patients, isLoading: loadingPatients } = useQuery(
    'patients',
    () => apiClient.getPeople({ limit: 100 }),
    {
      enabled: isOpen,
    }
  );

  // Récupérer le profil du médecin
  const { data: profile } = useQuery(
    'profile',
    () => apiClient.getProfile(),
    {
      enabled: isOpen,
    }
  );

  // Mutation pour créer l'intervention
  const createInterventionMutation = useMutation(
    (data: CreateInterventionRequest) => apiClient.createIntervention(data),
    {
      onSuccess: () => {
        toast.success('Intervention créée avec succès');
        queryClient.invalidateQueries('upcoming-interventions');
        queryClient.invalidateQueries('interventions');
        onClose();
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erreur lors de la création de l\'intervention');
      },
    }
  );

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      scheduledAt: '',
      priority: 'NORMAL',
      location: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.personId || !formData.title || !formData.scheduledAt) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!profile?.doctor?.id) {
      toast.error('Profil médecin non trouvé');
      return;
    }

    createInterventionMutation.mutate({
      personId: formData.personId,
      doctorId: profile.doctor.id,
      title: formData.title,
      description: formData.description,
      scheduledAt: formData.scheduledAt,
      priority: formData.priority as 'NORMAL' | 'URGENT',
      location: formData.location,
    });
  };

  const patientOptions = patients?.data?.map((patient: any) => ({
    value: patient.id,
    label: patient.fullName,
  })) || [];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Nouvelle intervention">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ModalContent>
          <div className="grid grid-cols-1 gap-6">
            {/* Patient */}
            <div>
              <Label htmlFor="patient">Patient *</Label>
              <Select
                id="patient"
                value={formData.personId}
                onValueChange={(value) => setFormData(prev => ({ ...prev, personId: value }))}
                placeholder="Sélectionner un patient"
                options={patientOptions}
                disabled={loadingPatients}
              />
              {loadingPatients && (
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <LoadingSpinner size="sm" className="mr-2" />
                  Chargement des patients...
                </div>
              )}
            </div>

            {/* Titre */}
            <div>
              <Label htmlFor="title">Titre de l'intervention *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Visite à domicile - Suivi diabète"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Détails de l'intervention..."
                rows={3}
              />
            </div>

            {/* Date et heure */}
            <div>
              <Label htmlFor="scheduledAt">Date et heure *</Label>
              <DateTimePicker
                id="scheduledAt"
                value={formData.scheduledAt}
                onChange={(value) => setFormData(prev => ({ ...prev, scheduledAt: value }))}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            {/* Priorité */}
            <div>
              <Label htmlFor="priority">Priorité</Label>
              <Select
                id="priority"
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as 'NORMAL' | 'URGENT' }))}
                options={[
                  { value: 'NORMAL', label: 'Normale' },
                  { value: 'URGENT', label: 'Urgente' },
                ]}
              />
            </div>

            {/* Lieu */}
            <div>
              <Label htmlFor="location">Lieu</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="Ex: Hôpital Central de Douala"
              />
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={createInterventionMutation.isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={createInterventionMutation.isLoading}
          >
            {createInterventionMutation.isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Création...
              </>
            ) : (
              'Créer l\'intervention'
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
