'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading';
import { 
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  CalendarIcon,
  HeartIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  ClockIcon,
  PencilIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

interface PatientDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string | null;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
}

interface Patient {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  medicalHistory: string[];
  lastVisit: string;
  nextAppointment?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'AT_RISK';
  bloodType?: string;
  allergies: string[];
  gender?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance?: {
    provider: string;
    policyNumber: string;
  };
}

export function PatientDetailModal({ isOpen, onClose, patientId, onEdit, onDelete }: PatientDetailModalProps) {
  const [patient, setPatient] = useState<Patient | null>(null);

  // Récupérer les détails du patient
  const { data: patientData, isLoading } = useQuery(
    ['patient', patientId],
    () => apiClient.getPerson(patientId!),
    {
      enabled: isOpen && !!patientId,
    }
  );

  // Récupérer les interventions du patient
  const { data: interventions } = useQuery(
    ['patient-interventions', patientId],
    () => apiClient.getInterventions({ personId: patientId }),
    {
      enabled: isOpen && !!patientId,
    }
  );

  useEffect(() => {
    if (patientData) {
      setPatient(patientData);
    }
  }, [patientData]);

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="default">Actif</Badge>;
      case 'AT_RISK':
        return <Badge variant="outline">À risque</Badge>;
      case 'INACTIVE':
        return <Badge variant="secondary">Inactif</Badge>;
      default:
        return null;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  if (!patient) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          <div className="text-center py-8">
            <p className="text-gray-500">Patient non trouvé</p>
          </div>
        </ModalContent>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Détails du patient">
      <ModalContent>
        <div className="space-y-6">
          {/* En-tête du patient */}
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 rounded-full bg-primary-100 flex items-center justify-center">
                <UserIcon className="h-8 w-8 text-primary-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{patient.fullName}</h2>
                  <p className="text-gray-600">{calculateAge(patient.dateOfBirth)} ans • {patient.gender || 'Non spécifié'}</p>
                </div>
                {getStatusBadge(patient.status)}
              </div>
            </div>
          </div>

          {/* Informations de contact */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Informations de contact</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{patient.email}</span>
                </div>
                <div className="flex items-center">
                  <PhoneIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{patient.phone}</span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{patient.address}</span>
                </div>
                <div className="flex items-center">
                  <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">Né(e) le {formatDate(patient.dateOfBirth)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Informations médicales</h3>
              <div className="space-y-3">
                {patient.bloodType && (
                  <div className="flex items-center">
                    <HeartIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">Groupe sanguin: {patient.bloodType}</span>
                  </div>
                )}
                <div className="flex items-center">
                  <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">Dernière visite: {formatDate(patient.lastVisit)}</span>
                </div>
                {patient.nextAppointment && (
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">Prochain RDV: {formatDate(patient.nextAppointment)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Antécédents médicaux */}
          {patient.medicalHistory.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Antécédents médicaux</h3>
              <div className="flex flex-wrap gap-2">
                {patient.medicalHistory.map((condition, index) => (
                  <Badge key={index} variant="destructive">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Allergies */}
          {patient.allergies.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Allergies</h3>
              <div className="flex flex-wrap gap-2">
                {patient.allergies.map((allergy, index) => (
                  <Badge key={index} variant="outline">
                    <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                    {allergy}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Contact d'urgence */}
          {patient.emergencyContact && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Contact d'urgence</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{patient.emergencyContact.name}</p>
                <p className="text-gray-600">{patient.emergencyContact.relationship}</p>
                <p className="text-gray-600">{patient.emergencyContact.phone}</p>
              </div>
            </div>
          )}

          {/* Assurance */}
          {patient.insurance && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Assurance</h3>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-900">{patient.insurance.provider}</p>
                <p className="text-gray-600">N° de police: {patient.insurance.policyNumber}</p>
              </div>
            </div>
          )}

          {/* Interventions récentes */}
          {interventions && interventions.length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Interventions récentes</h3>
              <div className="space-y-2">
                {interventions.slice(0, 5).map((intervention: any) => (
                  <div key={intervention.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{intervention.title}</p>
                      <p className="text-sm text-gray-600">{formatDate(intervention.scheduledAtUtc)}</p>
                    </div>
                    <Badge variant={intervention.status === 'DONE' ? 'default' : 'secondary'}>
                      {intervention.status === 'DONE' ? 'Terminée' : 'Planifiée'}
                    </Badge>
                  </div>
                ))}
              </div>
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
            onClick={() => onEdit(patient.id)}
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        )}
        {onDelete && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => onDelete(patient.id)}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Supprimer
          </Button>
        )}
      </ModalFooter>
    </Modal>
  );
}
