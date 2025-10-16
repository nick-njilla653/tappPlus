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

interface EditReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminderId: string | null;
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

export function EditReminderModal({ isOpen, onClose, reminderId }: EditReminderModalProps) {
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

  // Récupérer les détails du rappel
  const { data: reminder, isLoading } = useQuery(
    ['reminder', reminderId],
    () => apiClient.getReminder(reminderId!),
    {
      enabled: isOpen && !!reminderId,
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

  // Récupérer la liste des interventions
  const { data: interventions } = useQuery(
    'interventions',
    () => apiClient.getInterventions({ limit: 100 }),
    {
      enabled: isOpen,
    }
  );

  // Mutation pour mettre à jour le rappel
  const updateReminderMutation = useMutation(
    (data: Partial<ReminderFormData>) => {
      return apiClient.updateReminder(reminderId!, {
        type: data.type,
        scheduledAt: data.scheduledAt,
        message: data.description,
        recipient: data.type === 'EMAIL' ? data.recipient?.email : data.recipient?.phone,
      });
    },
    {
      onSuccess: () => {
        toast.success('Rappel mis à jour avec succès');
        queryClient.invalidateQueries('reminders');
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du rappel');
      },
    }
  );

  // Initialiser le formulaire avec les données du rappel
  useEffect(() => {
    if (reminder) {
      setFormData({
        title: reminder.title || '',
        description: reminder.description || '',
        scheduledAt: reminder.scheduledAt || '',
        type: reminder.type || 'EMAIL',
        priority: reminder.priority || 'NORMAL',
        patientId: reminder.patientId || '',
        interventionId: reminder.interventionId || '',
        template: reminder.template || '',
        recipient: {
          email: reminder.recipient?.email || '',
          phone: reminder.recipient?.phone || ''
        }
      });
    }
  }, [reminder]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.scheduledAt || !formData.patientId) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    updateReminderMutation.mutate(formData);
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
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Modifier le rappel">
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
            disabled={updateReminderMutation.isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={updateReminderMutation.isLoading}
          >
            {updateReminderMutation.isLoading ? (
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
