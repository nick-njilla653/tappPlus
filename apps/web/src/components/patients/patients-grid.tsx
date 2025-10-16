'use client';

import { 
  EyeIcon, 
  PencilIcon, 
  TrashIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon,
  HeartIcon,
  CalendarIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

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
}

interface PatientsGridProps {
  patients: Patient[];
  onView: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
  onDelete: (patient: Patient) => void;
}

export function PatientsGrid({ patients, onView, onEdit, onDelete }: PatientsGridProps) {
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR');
  };

  if (patients.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500">
          <p className="text-lg font-medium">Aucun patient trouvé</p>
          <p className="text-sm mt-1">Commencez par ajouter un nouveau patient</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {patients.map((patient) => (
        <Card key={patient.id} className="hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            {/* En-tête du patient */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
                    <span className="text-primary-600 font-medium text-lg">
                      {patient.fullName.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-gray-900 truncate">
                    {patient.fullName}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {calculateAge(patient.dateOfBirth)} ans
                  </p>
                </div>
              </div>
              {getStatusBadge(patient.status)}
            </div>

            {/* Informations de contact */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center text-sm text-gray-600">
                <EnvelopeIcon className="flex-shrink-0 mr-2 h-4 w-4" />
                <span className="truncate">{patient.email}</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <PhoneIcon className="flex-shrink-0 mr-2 h-4 w-4" />
                {patient.phone}
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <MapPinIcon className="flex-shrink-0 mr-2 h-4 w-4" />
                <span className="truncate">{patient.address}</span>
              </div>
            </div>

            {/* Informations médicales */}
            <div className="space-y-2 mb-4">
              {patient.bloodType && (
                <div className="flex items-center text-sm text-gray-600">
                  <HeartIcon className="flex-shrink-0 mr-2 h-4 w-4" />
                  Groupe sanguin: {patient.bloodType}
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <CalendarIcon className="flex-shrink-0 mr-2 h-4 w-4" />
                Dernière visite: {formatDate(patient.lastVisit)}
              </div>
              {patient.nextAppointment && (
                <div className="flex items-center text-sm text-blue-600">
                  <CalendarIcon className="flex-shrink-0 mr-2 h-4 w-4" />
                  Prochain RDV: {formatDate(patient.nextAppointment)}
                </div>
              )}
            </div>

            {/* Antécédents médicaux */}
            {patient.medicalHistory.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Antécédents</h4>
                <div className="flex flex-wrap gap-1">
                  {patient.medicalHistory.slice(0, 2).map((condition, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {condition}
                    </span>
                  ))}
                  {patient.medicalHistory.length > 2 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{patient.medicalHistory.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Allergies */}
            {patient.allergies.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">Allergies</h4>
                <div className="flex flex-wrap gap-1">
                  {patient.allergies.slice(0, 2).map((allergy, index) => (
                    <span key={index} className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                      {allergy}
                    </span>
                  ))}
                  {patient.allergies.length > 2 && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{patient.allergies.length - 2}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onView(patient)}
                className="flex-1"
              >
                <EyeIcon className="h-4 w-4 mr-1" />
                Voir
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(patient)}
                className="flex-1"
              >
                <PencilIcon className="h-4 w-4 mr-1" />
                Modifier
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onDelete(patient)}
              >
                <TrashIcon className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
