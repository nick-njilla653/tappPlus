'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from 'react-query';
import { apiClient } from '@/lib/api';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/date-picker';
import { LoadingSpinner } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';
import { CreatePersonRequest } from '@/types';

interface CreatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreatePatientModal({ isOpen, onClose }: CreatePatientModalProps) {
  const [formData, setFormData] = useState<Partial<CreatePersonRequest>>({
    fullName: '',
    birthdate: '',
    phone: '',
    email: '',
    address: '',
  });

  const queryClient = useQueryClient();

  // Mutation pour créer le patient
  const createPatientMutation = useMutation(
    (data: CreatePersonRequest) => apiClient.createPerson(data),
    {
      onSuccess: () => {
        toast.success('Patient créé avec succès');
        queryClient.invalidateQueries('patients');
        queryClient.invalidateQueries('people');
        onClose();
        resetForm();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Erreur lors de la création du patient');
      },
    }
  );

  const resetForm = () => {
    setFormData({
      fullName: '',
      birthdate: '',
      phone: '',
      email: '',
      address: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.fullName) {
      toast.error('Le nom complet est obligatoire');
      return;
    }

    createPatientMutation.mutate({
      fullName: formData.fullName,
      birthdate: formData.birthdate,
      phone: formData.phone,
      email: formData.email,
      address: formData.address,
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" title="Nouveau patient">
      <form onSubmit={handleSubmit} className="space-y-6">
        <ModalContent>
          <div className="grid grid-cols-1 gap-6">
            {/* Nom complet */}
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

            {/* Date de naissance */}
            <div>
              <Label htmlFor="birthdate">Date de naissance</Label>
              <DatePicker
                id="birthdate"
                value={formData.birthdate}
                onChange={(value) => setFormData(prev => ({ ...prev, birthdate: value }))}
                max={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Téléphone */}
            <div>
              <Label htmlFor="phone">Téléphone</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="Ex: +237 6 12 34 56 78"
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Ex: marie.nguema@email.com"
              />
            </div>

            {/* Adresse */}
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                placeholder="Adresse complète du patient..."
                rows={3}
              />
            </div>
          </div>
        </ModalContent>

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={createPatientMutation.isLoading}
          >
            Annuler
          </Button>
          <Button
            type="submit"
            disabled={createPatientMutation.isLoading}
          >
            {createPatientMutation.isLoading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Création...
              </>
            ) : (
              'Créer le patient'
            )}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
