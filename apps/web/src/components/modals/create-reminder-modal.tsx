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

interface CreateReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReminderFormData {
  title: string;
  description: string;
  scheduledAt: string;
  type: 'EMAIL' | 'SMS' | 'PUSH';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  patientId: string;
  interventionId: string;
  template: string;
  recipient: {
    email?: string;
    phone?: string;
  };
}

export function CreateReminderModal({ isOpen, onClose }: CreateReminderModalProps) {
  const [formData, setFormData] = useState<ReminderFormData>({
    title: '',
    description: '',
    scheduledAt: '',
    type: 'EMAIL',
    priority: 'NORMAL',
    patientId: '',
    interventionId: '',
    template: '',
    recipient: {
      email: '',
      phone: ''
    }
  });

  const queryClient = useQueryClient();

  // Récupérer la liste des patients
  const { data: patients } = useQuery(
    'patients',
    () => apiClient.getPeople({ limit: 100 }),
    {
      enabled: isOpen,
    }
  );

  // Récupérer la liste des interventions
  const { data: interventions } = useQuery(
    'interventions',
    () => apiClient.getInterventions({ limit: 100 }),
    {
      enabled: isOpen,
    }
  );

  // Mutation pour créer le rappel
  const createReminderMutation = useMutation(
    (data: ReminderFormData) => {
      return apiClient.createReminder({
        interventionId: data.interventionId,
        type: data.type,
        scheduledAt: data.scheduledAt,
        message: data.description,
        recipient: data.type === 'EMAIL' ? data.recipient.email : data.recipient.phone,
      });
    },
    {
      onSuccess: () => {
        toast.success('Rappel créé avec succès');
        queryClient.invalidateQueries('reminders');
        onClose();
        // Reset form
        setFormData({
          title: '',
          description: '',
          scheduledAt: '',
          type: 'EMAIL',
          priority: 'NORMAL',
          patientId: '',
          interventionId: '',
          template: '',
          recipient: {
            email: '',
            phone: ''
          }
        });
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erreur lors de la création du rappel');
      },
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.scheduledAt || !formData.patientId) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    createReminderMutation.mutate(formData);
  };

  const patientOptions = patients?.data?.map((patient: any) => ({
    value: patient.id,
    label: patient.fullName,
  })) || [];

  const interventionOptions = interventions?.data?.map((intervention: any) => ({
    value: intervention.id,
    label: intervention.title,
  })) || [];

  const getTemplatePlaceholder = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return 'Bonjour {patientName},\n\nCeci est un rappel pour votre {interventionTitle} prévu le {date}.\n\nCordialement,\nL\'équipe médicale';
      case 'SMS':
        return 'Rappel: {interventionTitle} le {date}. Patient: {patientName}';
      case 'PUSH':
        return 'Rappel: {interventionTitle} prévu le {date}';
      default:
        return '';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Créer un nouveau rappel">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ModalContent>
          <div className="grid grid-cols-1 gap-6">
            {/* Titre */}
            <div>
              <Label htmlFor="title">Titre du rappel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Ex: Rappel consultation - Marie Nguema"
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
                placeholder="Description du rappel..."
                rows={3}
              />
            </div>

            {/* Date et heure */}
            <div>
              <Label htmlFor="scheduledAt">Date et heure programmées *</Label>
              <DateTimePicker
                id="scheduledAt"
                value={formData.scheduledAt}
                onChange={(value) => setFormData(prev => ({ ...prev, scheduledAt: value }))}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            {/* Type et priorité */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Type de rappel *</Label>
                <Select
                  id="type"
                  value={formData.type}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value as 'EMAIL' | 'SMS' | 'PUSH' }))}
                  options={[
                    { value: 'EMAIL', label: 'Email' },
                    { value: 'SMS', label: 'SMS' },
                    { value: 'PUSH', label: 'Notification Push' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priorité</Label>
                <Select
                  id="priority"
                  value={formData.priority}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as 'LOW' | 'NORMAL' | 'HIGH' }))}
                  options={[
                    { value: 'LOW', label: 'Faible' },
                    { value: 'NORMAL', label: 'Normale' },
                    { value: 'HIGH', label: 'Élevée' },
                  ]}
                />
              </div>
            </div>

            {/* Patient et intervention */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="patientId">Patient *</Label>
                <Select
                  id="patientId"
                  value={formData.patientId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, patientId: value }))}
                  options={patientOptions}
                />
              </div>
              <div>
                <Label htmlFor="interventionId">Intervention</Label>
                <Select
                  id="interventionId"
                  value={formData.interventionId}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, interventionId: value }))}
                  options={interventionOptions}
                />
              </div>
            </div>

            {/* Informations de contact */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email du destinataire</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.recipient.email}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    recipient: { ...prev.recipient, email: e.target.value }
                  }))}
                  placeholder="email@example.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone du destinataire</Label>
                <Input
                  id="phone"
                  value={formData.recipient.phone}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    recipient: { ...prev.recipient, phone: e.target.value }
                  }))}
                  placeholder="+237 6 12 34 56 78"
                />
              </div>
            </div>

            {/* Template du message */}
            <div>
              <Label htmlFor="template">Template du message</Label>
              <Textarea
                id="template"
                value={formData.template}
                onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
                placeholder={getTemplatePlaceholder(formData.type)}
                rows={6}
              />
              <p className="text-sm text-gray-500 mt-1">
                Variables disponibles: {'{patientName}'}, {'{interventionTitle}'}, {'{date}'}
              </p>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={createReminderMutation.isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={createReminderMutation.isLoading}
          >
            {createReminderMutation.isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Création...
              </>
            ) : (
              'Créer le rappel'
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
