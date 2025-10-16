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
import { LoadingSpinner } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string | null;
}

interface PatientFormData {
  fullName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  address: string;
  gender: string;
  bloodType: string;
  status: 'ACTIVE' | 'INACTIVE' | 'AT_RISK';
  medicalHistory: string[];
  allergies: string[];
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  insurance: {
    provider: string;
    policyNumber: string;
  };
}

export function EditPatientModal({ isOpen, onClose, patientId }: EditPatientModalProps) {
  const [formData, setFormData] = useState<PatientFormData>({
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    address: '',
    gender: '',
    bloodType: '',
    status: 'ACTIVE',
    medicalHistory: [],
    allergies: [],
    emergencyContact: {
      name: '',
      phone: '',
      relationship: ''
    },
    insurance: {
      provider: '',
      policyNumber: ''
    }
  });

  const [medicalHistoryInput, setMedicalHistoryInput] = useState('');
  const [allergiesInput, setAllergiesInput] = useState('');

  const queryClient = useQueryClient();

  // Récupérer les détails du patient
  const { data: patient, isLoading } = useQuery(
    ['patient', patientId],
    () => apiClient.getPerson(patientId!),
    {
      enabled: isOpen && !!patientId,
    }
  );

  // Mutation pour mettre à jour le patient
  const updatePatientMutation = useMutation(
    (data: Partial<PatientFormData>) => apiClient.updatePerson(patientId!, data),
    {
      onSuccess: () => {
        toast.success('Patient mis à jour avec succès');
        queryClient.invalidateQueries('patients');
        queryClient.invalidateQueries(['patient', patientId]);
        onClose();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erreur lors de la mise à jour du patient');
      },
    }
  );

  // Initialiser le formulaire avec les données du patient
  useEffect(() => {
    if (patient) {
      setFormData({
        fullName: patient.fullName || '',
        email: patient.email || '',
        phone: patient.phone || '',
        dateOfBirth: patient.dateOfBirth || '',
        address: patient.address || '',
        gender: patient.gender || '',
        bloodType: patient.bloodType || '',
        status: patient.status || 'ACTIVE',
        medicalHistory: patient.medicalHistory || [],
        allergies: patient.allergies || [],
        emergencyContact: patient.emergencyContact || {
          name: '',
          phone: '',
          relationship: ''
        },
        insurance: patient.insurance || {
          provider: '',
          policyNumber: ''
        }
      });
    }
  }, [patient]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName || !formData.email || !formData.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    updatePatientMutation.mutate(formData);
  };

  const addMedicalHistory = () => {
    if (medicalHistoryInput.trim()) {
      setFormData(prev => ({
        ...prev,
        medicalHistory: [...prev.medicalHistory, medicalHistoryInput.trim()]
      }));
      setMedicalHistoryInput('');
    }
  };

  const removeMedicalHistory = (index: number) => {
    setFormData(prev => ({
      ...prev,
      medicalHistory: prev.medicalHistory.filter((_, i) => i !== index)
    }));
  };

  const addAllergy = () => {
    if (allergiesInput.trim()) {
      setFormData(prev => ({
        ...prev,
        allergies: [...prev.allergies, allergiesInput.trim()]
      }));
      setAllergiesInput('');
    }
  };

  const removeAllergy = (index: number) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.filter((_, i) => i !== index)
    }));
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
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Modifier le patient">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ModalContent>
          <div className="grid grid-cols-1 gap-6">
            {/* Informations personnelles */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Informations personnelles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fullName">Nom complet *</Label>
                  <Input
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => setFormData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Ex: Marie Nguema"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Ex: marie.nguema@email.com"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Ex: +237 6 12 34 56 78"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date de naissance</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData(prev => ({ ...prev, dateOfBirth: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Genre</Label>
                  <Select
                    id="gender"
                    value={formData.gender}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                    options={[
                      { value: '', label: 'Sélectionner' },
                      { value: 'MALE', label: 'Homme' },
                      { value: 'FEMALE', label: 'Femme' },
                      { value: 'OTHER', label: 'Autre' },
                    ]}
                  />
                </div>
                <div>
                  <Label htmlFor="bloodType">Groupe sanguin</Label>
                  <Select
                    id="bloodType"
                    value={formData.bloodType}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, bloodType: value }))}
                    options={[
                      { value: '', label: 'Sélectionner' },
                      { value: 'A+', label: 'A+' },
                      { value: 'A-', label: 'A-' },
                      { value: 'B+', label: 'B+' },
                      { value: 'B-', label: 'B-' },
                      { value: 'AB+', label: 'AB+' },
                      { value: 'AB-', label: 'AB-' },
                      { value: 'O+', label: 'O+' },
                      { value: 'O-', label: 'O-' },
                    ]}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Adresse</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                  placeholder="Ex: Quartier Akwa, Douala"
                  rows={2}
                />
              </div>
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select
                  id="status"
                  value={formData.status}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as 'ACTIVE' | 'INACTIVE' | 'AT_RISK' }))}
                  options={[
                    { value: 'ACTIVE', label: 'Actif' },
                    { value: 'AT_RISK', label: 'À risque' },
                    { value: 'INACTIVE', label: 'Inactif' },
                  ]}
                />
              </div>
            </div>

            {/* Antécédents médicaux */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Antécédents médicaux</h3>
              <div className="flex space-x-2">
                <Input
                  value={medicalHistoryInput}
                  onChange={(e) => setMedicalHistoryInput(e.target.value)}
                  placeholder="Ajouter un antécédent médical"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addMedicalHistory())}
                />
                <Button type="button" onClick={addMedicalHistory} variant="outline">
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.medicalHistory.map((condition, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800">
                    {condition}
                    <button
                      type="button"
                      onClick={() => removeMedicalHistory(index)}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Allergies */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Allergies</h3>
              <div className="flex space-x-2">
                <Input
                  value={allergiesInput}
                  onChange={(e) => setAllergiesInput(e.target.value)}
                  placeholder="Ajouter une allergie"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergy())}
                />
                <Button type="button" onClick={addAllergy} variant="outline">
                  Ajouter
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.allergies.map((allergy, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                    {allergy}
                    <button
                      type="button"
                      onClick={() => removeAllergy(index)}
                      className="ml-2 text-yellow-600 hover:text-yellow-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Contact d'urgence */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Contact d'urgence</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="emergencyName">Nom</Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyContact.name}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      emergencyContact: { ...prev.emergencyContact, name: e.target.value }
                    }))}
                    placeholder="Nom du contact"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyPhone">Téléphone</Label>
                  <Input
                    id="emergencyPhone"
                    value={formData.emergencyContact.phone}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      emergencyContact: { ...prev.emergencyContact, phone: e.target.value }
                    }))}
                    placeholder="Téléphone du contact"
                  />
                </div>
                <div>
                  <Label htmlFor="emergencyRelationship">Relation</Label>
                  <Input
                    id="emergencyRelationship"
                    value={formData.emergencyContact.relationship}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      emergencyContact: { ...prev.emergencyContact, relationship: e.target.value }
                    }))}
                    placeholder="Ex: Époux(se), Parent, etc."
                  />
                </div>
              </div>
            </div>

            {/* Assurance */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Assurance</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="insuranceProvider">Compagnie d'assurance</Label>
                  <Input
                    id="insuranceProvider"
                    value={formData.insurance.provider}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      insurance: { ...prev.insurance, provider: e.target.value }
                    }))}
                    placeholder="Nom de la compagnie"
                  />
                </div>
                <div>
                  <Label htmlFor="insurancePolicy">N° de police</Label>
                  <Input
                    id="insurancePolicy"
                    value={formData.insurance.policyNumber}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      insurance: { ...prev.insurance, policyNumber: e.target.value }
                    }))}
                    placeholder="Numéro de police"
                  />
                </div>
              </div>
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={updatePatientMutation.isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={updatePatientMutation.isLoading}
          >
            {updatePatientMutation.isLoading ? (
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
