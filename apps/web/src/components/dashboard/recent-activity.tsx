'use client';

import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import { format, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  BellIcon, 
  CalendarIcon, 
  UserIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export function RecentActivity() {
  const { data: reminders, isLoading } = useQuery(
    'recent-reminders',
    () => apiClient.getReminders({ limit: 5 }),
    {
      refetchInterval: 30000,
    }
  );

  const getActivityIcon = (status: string, channel: string) => {
    switch (status) {
      case 'SENT':
        return <CheckCircleIcon className="h-5 w-5 text-success-500" />;
      case 'FAILED':
        return <XCircleIcon className="h-5 w-5 text-danger-500" />;
      case 'SCHEDULED':
        return <ClockIcon className="h-5 w-5 text-warning-500" />;
      default:
        return <BellIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getActivityColor = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'text-success-600';
      case 'FAILED':
        return 'text-danger-600';
      case 'SCHEDULED':
        return 'text-warning-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'Envoyé';
      case 'FAILED':
        return 'Échec';
      case 'SCHEDULED':
        return 'Programmé';
      case 'SKIPPED':
        return 'Ignoré';
      default:
        return status;
    }
  };

  const getChannelText = (channel: string) => {
    switch (channel) {
      case 'EMAIL':
        return 'Email';
      case 'SMS':
        return 'SMS';
      case 'PUSH':
        return 'Push';
      default:
        return channel;
    }
  };

  if (isLoading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Activité récente</h3>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Activité récente</h3>
      
      {!reminders || reminders.length === 0 ? (
        <div className="text-center py-4">
          <BellIcon className="mx-auto h-8 w-8 text-gray-400" />
          <p className="mt-2 text-sm text-gray-500">Aucune activité récente</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reminders.map((reminder: any) => (
            <div key={reminder.id} className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                {getActivityIcon(reminder.status, reminder.channel)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900">
                    Rappel {getChannelText(reminder.channel)}
                  </p>
                  <p className="text-xs text-gray-500">
                    {format(parseISO(reminder.createdAt), 'dd/MM HH:mm', { locale: fr })}
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  {reminder.intervention?.title}
                </p>
                <p className="text-sm text-gray-500">
                  {reminder.intervention?.person?.fullName}
                </p>
                <div className="mt-1">
                  <span className={`text-xs font-medium ${getActivityColor(reminder.status)}`}>
                    {getStatusText(reminder.status)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="mt-4 pt-4 border-t border-gray-200">
        <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
          Voir toute l'activité →
        </button>
      </div>
    </div>
  );
}
