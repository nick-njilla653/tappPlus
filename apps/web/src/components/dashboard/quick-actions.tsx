'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  PlusIcon, 
  UserPlusIcon, 
  CalendarIcon, 
  BellIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { CreateInterventionModal } from '@/components/modals/create-intervention-modal';
import { CreatePatientModal } from '@/components/modals/create-patient-modal';

export function QuickActions() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const [showCreateIntervention, setShowCreateIntervention] = useState(false);
  const [showCreatePatient, setShowCreatePatient] = useState(false);

  const actions = [
    {
      name: 'Nouvelle intervention',
      description: 'Programmer une nouvelle intervention',
      icon: PlusIcon,
      color: 'bg-primary-500',
      action: 'modal',
      modal: 'intervention',
    },
    {
      name: 'Nouveau patient',
      description: 'Ajouter un nouveau patient',
      icon: UserPlusIcon,
      color: 'bg-success-500',
      action: 'modal',
      modal: 'patient',
    },
    {
      name: 'Nouvelle consultation',
      description: 'Enregistrer une consultation',
      icon: DocumentTextIcon,
      color: 'bg-warning-500',
      href: '/consultations/new',
    },
    {
      name: 'Rappels en attente',
      description: 'Voir les rappels programmés',
      icon: BellIcon,
      color: 'bg-danger-500',
      href: '/reminders',
    },
  ];

  const handleActionClick = (action: typeof actions[0]) => {
    if (action.action === 'modal') {
      if (action.modal === 'intervention') {
        setShowCreateIntervention(true);
      } else if (action.modal === 'patient') {
        setShowCreatePatient(true);
      }
    } else if (action.href) {
      setIsLoading(action.name);
      setTimeout(() => {
        router.push(action.href);
        setIsLoading(null);
      }, 500);
    }
  };

  return (
    <>
      <div className="card p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h3>
        <div className="space-y-3">
          {actions.map((action) => (
            <button
              key={action.name}
              onClick={() => handleActionClick(action)}
              disabled={isLoading === action.name}
              className="w-full flex items-center p-3 text-left rounded-lg border border-gray-200 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors disabled:opacity-50"
            >
              <div className={`flex-shrink-0 p-2 rounded-lg ${action.color}`}>
                <action.icon className="h-5 w-5 text-white" />
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {action.name}
                </p>
                <p className="text-sm text-gray-500">
                  {action.description}
                </p>
              </div>
              {isLoading === action.name && (
                <div className="flex-shrink-0">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Modales */}
      <CreateInterventionModal
        isOpen={showCreateIntervention}
        onClose={() => setShowCreateIntervention(false)}
      />
      
      <CreatePatientModal
        isOpen={showCreatePatient}
        onClose={() => setShowCreatePatient(false)}
      />
    </>
  );
}
