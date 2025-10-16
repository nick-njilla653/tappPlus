'use client';

import { useState, useEffect } from 'react';
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
import { Intervention } from '@/types';

interface EditInterventionModalProps {
  isOpen: boolean;
  onClose: () => void;
  interventionId: string | null;
}

export function EditInterventionModal({ isOpen, onClose, interventionId }: EditInterventionModalProps) {
  const [formData, setFormData] = useState<Partial<Intervention>>({
    title: '',
    description: '',
    scheduledAtUtc: '',
    priority: 'NORMAL',
    location: '',
    status: 'PLANNED',
  });

  const queryClient = useQueryClient();

  // Récupérer les détails de l'intervention
  const { data: intervention, isLoading } = useQuery(
    ['intervention', interventionId],
    () => apiClient.getInterventions({ id: interventionId }),
    {
      enabled: isOpen && !!interventionId,
    }
  );

  // Récupérer la liste des patients
  const { data: patients } = useQuery(
    'patients',
    () => apiClient.getPeople({ limit: 100 }),
    {
      enabled: isOpen,
    }
  );

  // Mutation pour mettre à jour l'intervention
  const updateInterventionMutation = useMutation(
    (data: Partial<Intervention>) => apiClient.updateIntervention(interventionId!, data),
    {
      onSuccess: () => {
        toast.success('Intervention mise à jour avec succès');
        queryClient.invalidateQueries('interventions');
        queryClient.invalidateQueries('upcoming-interventions');
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour de l\'intervention');
      },
    }
  );

  // Initialiser le formulaire avec les données de l'intervention
  useEffect(() => {
    if (intervention) {
      setFormData({
        title: intervention.title,
        description: intervention.description,
        scheduledAtUtc: intervention.scheduledAtUtc,
        priority: intervention.priority,
        location: intervention.location,
        status: intervention.status,
      });
    }
  }, [intervention]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.scheduledAtUtc) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    updateInterventionMutation.mutate(formData);
  };

  const patientOptions = patients?.data?.map((patient: any) => ({
    value: patient.id,
    label: patient.fullName,
  })) || [];

  if (isLoading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <div className="flex items-center justify-center h-64">
            <LoadingSpinner size="lg" />
          </div>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Modifier l'intervention">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ModalContent>
          <div className="grid grid-cols-1 gap-6">
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
              <Label htmlFor="scheduledAtUtc">Date et heure *</Label>
              <DateTimePicker
                id="scheduledAtUtc"
                value={formData.scheduledAtUtc}
                onChange={(value) => setFormData(prev => ({ ...prev, scheduledAtUtc: value }))}
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
                  { value: 'LOW', label: 'Faible' },
                  { value: 'NORMAL', label: 'Normale' },
                  { value: 'URGENT', label: 'Urgente' },
                ]}
              />
            </div>

            {/* Statut */}
            <div>
              <Label htmlFor="status">Statut</Label>
              <Select
                id="status"
                value={formData.status}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'PLANNED' | 'IN_PROGRESS' | 'DONE' | 'CANCELED' }))}
                options={[
                  { value: 'PLANNED', label: 'Planifiée' },
                  { value: 'IN_PROGRESS', label: 'En cours' },
                  { value: 'DONE', label: 'Terminée' },
                  { value: 'CANCELED', label: 'Annulée' },
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
            disabled={updateInterventionMutation.isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={updateInterventionMutation.isLoading}
          >
            {updateInterventionMutation.isLoading ? (
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
  );
}
