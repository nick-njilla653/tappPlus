'use client';

import { format, isToday, isTomorrow, parseISO } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ClockIcon, MapPinIcon, ExclamationTriangleIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { Intervention } from '@/types';

interface UpcomingInterventionsProps {
  interventions: Intervention[];
  isLoading: boolean;
}

export function UpcomingInterventions({ interventions, isLoading }: UpcomingInterventionsProps) {
  if (isLoading) {
    return (
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Interventions à venir</h3>
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

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    
    if (isToday(date)) {
      return `Aujourd'hui à ${format(date, 'HH:mm', { locale: fr })}`;
    } else if (isTomorrow(date)) {
      return `Demain à ${format(date, 'HH:mm', { locale: fr })}`;
    } else {
      return format(date, 'EEEE dd MMMM à HH:mm', { locale: fr });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-danger-100 text-danger-800';
      case 'NORMAL':
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLANNED':
        return 'bg-blue-100 text-blue-800';
      case 'IN_PROGRESS':
        return 'bg-yellow-100 text-yellow-800';
      case 'DONE':
        return 'bg-success-100 text-success-800';
      case 'CANCELED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Interventions à venir</h3>
        <span className="text-sm text-gray-500">
          {interventions?.length || 0} intervention(s)
        </span>
      </div>

      {!interventions || interventions.length === 0 ? (
        <div className="text-center py-8">
          <CalendarIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune intervention</h3>
          <p className="mt-1 text-sm text-gray-500">
            Vous n'avez pas d'interventions programmées pour les 7 prochains jours.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {interventions.map((intervention) => (
            <div
              key={intervention.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h4 className="text-sm font-medium text-gray-900">
                      {intervention.title}
                    </h4>
                    {intervention.priority === 'URGENT' && (
                      <ExclamationTriangleIcon className="h-4 w-4 text-danger-500" />
                    )}
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 space-x-4">
                    <div className="flex items-center">
                      <ClockIcon className="h-4 w-4 mr-1" />
                      {formatDate(intervention.scheduledAtUtc)}
                    </div>
                    
                    {intervention.location && (
                      <div className="flex items-center">
                        <MapPinIcon className="h-4 w-4 mr-1" />
                        {intervention.location}
                      </div>
                    )}
                  </div>

                  {intervention.description && (
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {intervention.description}
                    </p>
                  )}

                  <div className="mt-3 flex items-center space-x-2">
                    <span className={`badge ${getPriorityColor(intervention.priority)}`}>
                      {intervention.priority === 'URGENT' ? 'Urgent' : 'Normal'}
                    </span>
                    <span className={`badge ${getStatusColor(intervention.status)}`}>
                      {intervention.status === 'PLANNED' ? 'Planifiée' :
                       intervention.status === 'IN_PROGRESS' ? 'En cours' :
                       intervention.status === 'DONE' ? 'Terminée' : 'Annulée'}
                    </span>
                  </div>
                </div>

                <div className="ml-4 flex-shrink-0">
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {intervention.person?.fullName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {intervention.doctor?.speciality}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
