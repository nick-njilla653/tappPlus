'use client';

import { useState } from 'react';
import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import { 
  DocumentArrowDownIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  PrinterIcon,
  ShareIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DateTimePicker } from '@/components/ui/date-picker';
import { Modal, ModalHeader, ModalContent, ModalFooter } from '@/components/ui/modal';
import { LoadingSpinner } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';

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

interface PatientsExportProps {
  patients: Patient[];
}

type ExportFormat = 'PDF' | 'EXCEL' | 'CSV';
type ReportType = 'PATIENTS_LIST' | 'STATISTICS' | 'MEDICAL_SUMMARY' | 'APPOINTMENTS';

export function PatientsExport({ patients }: PatientsExportProps) {
  const [showExportModal, setShowExportModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('PDF');
  const [reportType, setReportType] = useState<ReportType>('PATIENTS_LIST');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);

  // Chargement des données supplémentaires via React Query
  const { data: interventionsData, isLoading: interventionsLoading } = useQuery(
    'interventions-export',
    () => apiClient.getInterventions(),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des interventions:', error);
        toast.error('Erreur lors du chargement des données pour l\'export');
      }
    }
  );

  const { data: remindersData, isLoading: remindersLoading } = useQuery(
    'reminders-export',
    () => apiClient.getReminders(),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des rappels:', error);
        toast.error('Erreur lors du chargement des données pour l\'export');
      }
    }
  );

  const exportOptions = [
    {
      id: 'patients-list',
      title: 'Liste des patients',
      description: 'Export de la liste complète des patients avec leurs informations de base',
      icon: UserGroupIcon,
      format: 'PATIENTS_LIST' as ReportType,
      formats: ['PDF', 'EXCEL', 'CSV'] as ExportFormat[],
    },
    {
      id: 'statistics',
      title: 'Rapport statistique',
      description: 'Analyse statistique des patients avec graphiques et tendances',
      icon: ChartBarIcon,
      format: 'STATISTICS' as ReportType,
      formats: ['PDF', 'EXCEL'] as ExportFormat[],
    },
    {
      id: 'medical-summary',
      title: 'Résumé médical',
      description: 'Synthèse des informations médicales et des antécédents',
      icon: DocumentTextIcon,
      format: 'MEDICAL_SUMMARY' as ReportType,
      formats: ['PDF', 'EXCEL'] as ExportFormat[],
    },
    {
      id: 'appointments',
      title: 'Rapport des rendez-vous',
      description: 'Liste des rendez-vous passés et à venir sur une période donnée',
      icon: CalendarIcon,
      format: 'APPOINTMENTS' as ReportType,
      formats: ['PDF', 'EXCEL', 'CSV'] as ExportFormat[],
    },
  ];

  const handleExport = async (option: typeof exportOptions[0]) => {
    setReportType(option.format);
    setExportFormat(option.formats[0]);
    setShowExportModal(true);
  };

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      // Générer le rapport avec les données réelles
      // Simulation d'un délai de traitement (peut être remplacé par un vrai appel API)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Filtrer les patients selon les critères
      let filteredPatients = patients;
      
      if (filterStatus !== 'ALL') {
        filteredPatients = patients.filter(p => p.status === filterStatus);
      }
      
      if (dateFrom && dateTo) {
        const fromDate = new Date(dateFrom);
        const toDate = new Date(dateTo);
        filteredPatients = filteredPatients.filter(p => {
          const lastVisit = new Date(p.lastVisit);
          return lastVisit >= fromDate && lastVisit <= toDate;
        });
      }

      // Simuler le téléchargement
      const data = generateReportData(filteredPatients, reportType);
      downloadFile(data, `rapport-${reportType.toLowerCase()}-${new Date().toISOString().split('T')[0]}.${exportFormat.toLowerCase()}`);
      
      toast.success('Rapport généré et téléchargé avec succès');
      setShowExportModal(false);
    } catch (error) {
      toast.error('Erreur lors de la génération du rapport');
    } finally {
      setLoading(false);
    }
  };

  const generateReportData = (filteredPatients: Patient[], type: ReportType) => {
    const interventions = interventionsData || [];
    const reminders = remindersData || [];
    
    switch (type) {
      case 'PATIENTS_LIST':
        return filteredPatients.map(patient => {
          // Calculer les statistiques du patient basées sur les données réelles
          const patientInterventions = interventions.filter((i: any) => i.personId === patient.id);
          const patientReminders = reminders.filter((r: any) => 
            r.intervention?.person?.firstName === patient.fullName.split(' ')[0] &&
            r.intervention?.person?.lastName === patient.fullName.split(' ')[1]
          );
          
          return {
            'Nom complet': patient.fullName,
            'Email': patient.email,
            'Téléphone': patient.phone,
            'Date de naissance': new Date(patient.dateOfBirth).toLocaleDateString('fr-FR'),
            'Adresse': patient.address,
            'Statut': patient.status,
            'Groupe sanguin': patient.bloodType || 'Non spécifié',
            'Dernière visite': new Date(patient.lastVisit).toLocaleDateString('fr-FR'),
            'Nombre d\'interventions': patientInterventions.length,
            'Nombre de rappels': patientReminders.length,
            'Prochain RDV': patient.nextAppointment ? new Date(patient.nextAppointment).toLocaleDateString('fr-FR') : 'Aucun',
            'Antécédents': patient.medicalHistory.join(', '),
            'Allergies': patient.allergies.join(', '),
          };
        });
      
      case 'STATISTICS':
        const totalPatients = filteredPatients.length;
        const activePatients = filteredPatients.filter(p => p.status === 'ACTIVE').length;
        const atRiskPatients = filteredPatients.filter(p => p.status === 'AT_RISK').length;
        const inactivePatients = filteredPatients.filter(p => p.status === 'INACTIVE').length;
        
        // Calculer les statistiques basées sur les données réelles
        const totalInterventions = interventions.length;
        const totalReminders = reminders.length;
        const successfulReminders = reminders.filter((r: any) => r.status === 'SENT' || r.status === 'DELIVERED').length;
        const successRate = totalReminders > 0 ? Math.round((successfulReminders / totalReminders) * 100) : 0;
        
        return {
          'Total patients': totalPatients,
          'Patients actifs': activePatients,
          'Patients à risque': atRiskPatients,
          'Patients inactifs': inactivePatients,
          'Pourcentage actifs': `${Math.round((activePatients / totalPatients) * 100)}%`,
          'Pourcentage à risque': `${Math.round((atRiskPatients / totalPatients) * 100)}%`,
          'Total interventions': totalInterventions,
          'Total rappels': totalReminders,
          'Taux de réussite rappels': `${successRate}%`,
          'Interventions par patient': totalPatients > 0 ? Math.round(totalInterventions / totalPatients * 10) / 10 : 0,
        };
      
      case 'MEDICAL_SUMMARY':
        return filteredPatients.map(patient => ({
          'Patient': patient.fullName,
          'Conditions médicales': patient.medicalHistory.join(', ') || 'Aucune',
          'Allergies': patient.allergies.join(', ') || 'Aucune',
          'Groupe sanguin': patient.bloodType || 'Non spécifié',
          'Statut': patient.status,
        }));
      
      case 'APPOINTMENTS':
        return filteredPatients
          .filter(p => p.nextAppointment)
          .map(patient => ({
            'Patient': patient.fullName,
            'Téléphone': patient.phone,
            'Email': patient.email,
            'Date du RDV': new Date(patient.nextAppointment!).toLocaleDateString('fr-FR'),
            'Heure': new Date(patient.nextAppointment!).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            'Statut': patient.status,
          }));
      
      default:
        return [];
    }
  };

  const downloadFile = (data: any, filename: string) => {
    if (exportFormat === 'CSV') {
      const csv = convertToCSV(data);
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    } else {
      // Pour PDF et EXCEL, on simule juste le téléchargement
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      link.click();
    }
  };

  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => headers.map(header => `"${row[header] || ''}"`).join(','))
    ].join('\n');
    
    return csvContent;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Exports et rapports</h2>
          <p className="text-sm text-gray-500">Générez et téléchargez des rapports sur vos patients</p>
        </div>
      </div>

      {/* Export Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {exportOptions.map((option) => (
          <Card key={option.id} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                    <option.icon className="h-5 w-5 text-primary-600" />
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">{option.title}</h3>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport(option)}
                    >
                      <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                    <div className="flex space-x-1">
                      {option.formats.map((format) => (
                        <span
                          key={format}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                        >
                          {format}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Informations sur les données disponibles */}
      {!interventionsLoading && !remindersLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Données disponibles pour l'export</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Patients:</span>
                <span className="ml-1 font-medium">{patients.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Interventions:</span>
                <span className="ml-1 font-medium">{interventionsData?.length || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Rappels:</span>
                <span className="ml-1 font-medium">{remindersData?.length || 0}</span>
              </div>
              <div>
                <span className="text-gray-600">Taux de réussite:</span>
                <span className="ml-1 font-medium">
                  {remindersData?.length > 0 ? 
                    Math.round((remindersData.filter((r: any) => r.status === 'SENT' || r.status === 'DELIVERED').length / remindersData.length) * 100) : 0}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Actions rapides</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              onClick={() => {
                const data = generateReportData(patients, 'PATIENTS_LIST');
                downloadFile(data, `liste-patients-${new Date().toISOString().split('T')[0]}.csv`);
                toast.success('Liste des patients exportée');
              }}
            >
              <TableCellsIcon className="h-4 w-4 mr-2" />
              Export rapide CSV
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const data = generateReportData(patients, 'STATISTICS');
                downloadFile(data, `statistiques-${new Date().toISOString().split('T')[0]}.json`);
                toast.success('Statistiques exportées');
              }}
            >
              <ChartBarIcon className="h-4 w-4 mr-2" />
              Statistiques
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                const data = generateReportData(patients, 'APPOINTMENTS');
                downloadFile(data, `rendez-vous-${new Date().toISOString().split('T')[0]}.csv`);
                toast.success('Rendez-vous exportés');
              }}
            >
              <CalendarIcon className="h-4 w-4 mr-2" />
              Rendez-vous
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Export Modal */}
      <Modal isOpen={showExportModal} onClose={() => setShowExportModal(false)} size="lg" title="Générer un rapport">
        <ModalContent>
          <div className="space-y-6">
            <div>
              <Label htmlFor="report-type">Type de rapport</Label>
              <Select
                id="report-type"
                value={reportType}
                onValueChange={(value) => setReportType(value as ReportType)}
                options={[
                  { value: 'PATIENTS_LIST', label: 'Liste des patients' },
                  { value: 'STATISTICS', label: 'Rapport statistique' },
                  { value: 'MEDICAL_SUMMARY', label: 'Résumé médical' },
                  { value: 'APPOINTMENTS', label: 'Rapport des rendez-vous' },
                ]}
              />
            </div>

            <div>
              <Label htmlFor="export-format">Format d'export</Label>
              <Select
                id="export-format"
                value={exportFormat}
                onValueChange={(value) => setExportFormat(value as ExportFormat)}
                options={[
                  { value: 'PDF', label: 'PDF' },
                  { value: 'EXCEL', label: 'Excel' },
                  { value: 'CSV', label: 'CSV' },
                ]}
              />
            </div>

            <div>
              <Label htmlFor="filter-status">Filtrer par statut</Label>
              <Select
                id="filter-status"
                value={filterStatus}
                onValueChange={setFilterStatus}
                options={[
                  { value: 'ALL', label: 'Tous les statuts' },
                  { value: 'ACTIVE', label: 'Actif' },
                  { value: 'AT_RISK', label: 'À risque' },
                  { value: 'INACTIVE', label: 'Inactif' },
                ]}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date-from">Date de début</Label>
                <DateTimePicker
                  id="date-from"
                  value={dateFrom}
                  onChange={setDateFrom}
                />
              </div>
              <div>
                <Label htmlFor="date-to">Date de fin</Label>
                <DateTimePicker
                  id="date-to"
                  value={dateTo}
                  onChange={setDateTo}
                />
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Informations sur le rapport</h4>
              <p className="text-sm text-blue-700">
                {reportType === 'PATIENTS_LIST' && 'Ce rapport contiendra la liste complète des patients avec leurs informations de base.'}
                {reportType === 'STATISTICS' && 'Ce rapport contiendra des statistiques détaillées sur la population de patients.'}
                {reportType === 'MEDICAL_SUMMARY' && 'Ce rapport contiendra un résumé des informations médicales des patients.'}
                {reportType === 'APPOINTMENTS' && 'Ce rapport contiendra la liste des rendez-vous sur la période sélectionnée.'}
              </p>
            </div>
          </div>
        </ModalContent>
        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowExportModal(false)}
            disabled={loading}
          >
            Annuler
          </Button>
          <Button
            type="button"
            onClick={handleGenerateReport}
            disabled={loading}
          >
            {loading ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Génération...
              </>
            ) : (
              <>
                <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
                Générer et télécharger
              </>
            )}
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
