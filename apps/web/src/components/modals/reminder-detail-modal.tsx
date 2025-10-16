'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';
import { 
  BellIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  UserIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

interface ReminderDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  reminderId: string | null;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

interface Reminder {
  id: string;
  title: string;
  description: string;
  scheduledAt: string;
  type: 'EMAIL' | 'SMS' | 'PUSH';
  status: 'PENDING' | 'SENT' | 'DELIVERED' | 'FAILED';
  priority: 'LOW' | 'NORMAL' | 'HIGH';
  patientName: string;
  interventionTitle: string;
  createdAt: string;
  sentAt?: string;
  deliveryStatus?: string;
  retryCount?: number;
  errorMessage?: string;
  template?: string;
  recipient?: {
    email?: string;
    phone?: string;
    name: string;
  };
}

export function ReminderDetailModal({ isOpen, onClose, reminderId, onEdit, onDelete }: ReminderDetailModalProps) {
  const [reminder, setReminder] = useState<Reminder | null>(null);

  // Récupérer les détails du rappel
  const { data: reminderData, isLoading } = useQuery(
    ['reminder', reminderId],
    () => apiClient.getReminder(reminderId!),
    {
      enabled: isOpen && !!reminderId,
    }
  );

  useEffect(() => {
    if (reminderData) {
      setReminder(reminderData);
    }
  }, [reminderData]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="outline">En attente</Badge>;
      case 'SENT':
        return <Badge variant="default">Envoyé</Badge>;
      case 'DELIVERED':
        return <Badge variant="default">Livré</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Échec</Badge>;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'EMAIL':
        return <EnvelopeIcon className="h-6 w-6 text-blue-500" />;
      case 'SMS':
        return <DevicePhoneMobileIcon className="h-6 w-6 text-green-500" />;
      case 'PUSH':
        return <BellIcon className="h-6 w-6 text-purple-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return <Badge variant="destructive">Élevée</Badge>;
      case 'NORMAL':
        return <Badge variant="default">Normale</Badge>;
      case 'LOW':
        return <Badge variant="secondary">Faible</Badge>;
      default:
        return null;
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

  const handleRetry = async () => {
    if (!reminder) return;
    try {
      await apiClient.retryReminder(reminder.id);
      toast.success('Rappel relancé avec succès');
      // Recharger les données
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la nouvelle tentative:', error);
      toast.error('Erreur lors de la relance du rappel');
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

  if (!reminder) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Rappel non trouvé</p>
          </div>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Détails du rappel">
      <ModalContent>
        <div className="space-y-6">
          {/* En-tête du rappel */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                {getTypeIcon(reminder.type)}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{reminder.title}</h2>
                  <p className="text-gray-600 mt-1">{reminder.description}</p>
                </div>
                <div className="flex space-x-2">
                  {getPriorityBadge(reminder.priority)}
                  {getStatusBadge(reminder.status)}
                </div>
              </div>
            </div>
          </div>

          {/* Informations principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Informations générales</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Type:</span>
                  <div className="flex items-center mt-1">
                    {getTypeIcon(reminder.type)}
                    <span className="ml-2 text-gray-900">
                      {reminder.type === 'EMAIL' ? 'Email' : 
                       reminder.type === 'SMS' ? 'SMS' : 'Notification Push'}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Date programmée:</span>
                  <p className="text-gray-900">{formatDate(reminder.scheduledAt)}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Créé le:</span>
                  <p className="text-gray-900">{formatDate(reminder.createdAt)}</p>
                </div>
                {reminder.sentAt && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Envoyé le:</span>
                    <p className="text-gray-900">{formatDate(reminder.sentAt)}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Destinataire</h3>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-500">Patient:</span>
                  <p className="text-gray-900">{reminder.patientName}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-500">Intervention:</span>
                  <p className="text-gray-900">{reminder.interventionTitle}</p>
                </div>
                {reminder.recipient && (
                  <div>
                    <span className="text-sm font-medium text-gray-500">Contact:</span>
                    <div className="mt-1">
                      {reminder.recipient.email && (
                        <p className="text-gray-900">{reminder.recipient.email}</p>
                      )}
                      {reminder.recipient.phone && (
                        <p className="text-gray-900">{reminder.recipient.phone}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Statut de livraison */}
          {reminder.deliveryStatus && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Statut de livraison</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-900">{reminder.deliveryStatus}</p>
                {reminder.errorMessage && (
                  <p className="text-red-600 text-sm mt-2">{reminder.errorMessage}</p>
                )}
                {reminder.retryCount && reminder.retryCount > 0 && (
                  <p className="text-gray-600 text-sm mt-2">
                    Tentatives: {reminder.retryCount}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Template */}
          {reminder.template && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Contenu du message</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <pre className="text-sm text-gray-900 whitespace-pre-wrap">{reminder.template}</pre>
              </div>
            </div>
          )}

          {/* Actions rapides */}
          {reminder.status === 'FAILED' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <XCircleIcon className="h-5 w-5 text-red-400 mr-2" />
                <span className="text-red-800 font-medium">Échec de livraison</span>
              </div>
              <p className="text-red-700 text-sm mt-1">
                Ce rappel n'a pas pu être livré. Vous pouvez réessayer de l'envoyer.
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRetry}
                className="mt-3"
              >
                <ArrowPathIcon className="h-4 w-4 mr-2" />
                Réessayer
              </Button>
            </div>
          )}
        </div>
      </ModalContent>

      <ModalFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={onClose}
        >
          Fermer
        </Button>
        {onEdit && (
          <Button
            type="button"
            variant="outline"
            onClick={() => onEdit(reminder.id)}
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        )}
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete(reminder.id)}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
