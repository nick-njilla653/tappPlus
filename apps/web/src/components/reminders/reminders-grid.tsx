'use client';

import { 
  BellIcon,
  CalendarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
  PencilIcon,
  EyeIcon,
  TrashIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
}

interface RemindersGridProps {
  reminders: Reminder[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export function RemindersGrid({ reminders, onView, onEdit, onDelete }: RemindersGridProps) {
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
        return <EnvelopeIcon className="h-5 w-5 text-blue-500" />;
      case 'SMS':
        return <DevicePhoneMobileIcon className="h-5 w-5 text-green-500" />;
      case 'PUSH':
        return <BellIcon className="h-5 w-5 text-purple-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'SENT':
        return <BellIcon className="h-4 w-4 text-blue-500" />;
      case 'DELIVERED':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'FAILED':
        return <XCircleIcon className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCardBorderColor = (status: string, priority: string) => {
    if (status === 'FAILED') return 'border-red-200';
    if (priority === 'HIGH') return 'border-orange-200';
    if (status === 'DELIVERED') return 'border-green-200';
    return 'border-gray-200';
  };

  if (reminders.length === 0) {
    return (
      <div className="text-center py-12">
        <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun rappel</h3>
        <p className="mt-1 text-sm text-gray-500">
          Commencez par créer un nouveau rappel.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {reminders.map((reminder) => (
        <Card 
          key={reminder.id} 
          className={`hover:shadow-lg transition-shadow duration-200 ${getCardBorderColor(reminder.status, reminder.priority)}`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2">
                {getTypeIcon(reminder.type)}
                <CardTitle className="text-sm font-medium text-gray-900 line-clamp-2">
                  {reminder.title}
                </CardTitle>
              </div>
              <div className="flex flex-col space-y-1">
                {getPriorityBadge(reminder.priority)}
                {getStatusBadge(reminder.status)}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {/* Description */}
            <p className="text-sm text-gray-600 line-clamp-3">
              {reminder.description}
            </p>

            {/* Patient et intervention */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <UserIcon className="h-4 w-4 text-gray-400" />
                <span className="text-sm font-medium text-gray-900">{reminder.patientName}</span>
              </div>
              <div className="text-sm text-gray-500 ml-6">
                {reminder.interventionTitle}
              </div>
            </div>

            {/* Date programmée */}
            <div className="flex items-center space-x-2">
              <CalendarIcon className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-900">
                {formatDate(reminder.scheduledAt)}
              </span>
            </div>

            {/* Statut de livraison */}
            {reminder.sentAt && (
              <div className="flex items-center space-x-2">
                {getStatusIcon(reminder.status)}
                <span className="text-xs text-gray-500">
                  Envoyé le {formatDate(reminder.sentAt)}
                </span>
              </div>
            )}

            {/* Message d'erreur pour les échecs */}
            {reminder.status === 'FAILED' && reminder.deliveryStatus && (
              <div className="bg-red-50 border border-red-200 rounded-md p-2">
                <p className="text-xs text-red-700">
                  {reminder.deliveryStatus}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-100">
              <div className="flex space-x-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onView(reminder.id)}
                >
                  <EyeIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(reminder.id)}
                >
                  <PencilIcon className="h-4 w-4" />
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => onDelete(reminder.id)}
                >
                  <TrashIcon className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Indicateur de priorité */}
              {reminder.priority === 'HIGH' && (
                <div className="flex items-center">
                  <ExclamationTriangleIcon className="h-4 w-4 text-orange-500" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
