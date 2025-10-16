'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowDownTrayIcon,
  DocumentTextIcon,
  TableCellsIcon,
  ChartBarIcon,
  CalendarIcon,
  FunnelIcon,
  CheckIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';

interface ExportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'interventions' | 'patients' | 'reminders' | 'performance' | 'custom';
  format: 'PDF' | 'Excel' | 'CSV' | 'JSON';
  fields: string[];
  isDefault: boolean;
}

interface DataExportsProps {
  period: string;
}

export function DataExports({ period }: DataExportsProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customFields, setCustomFields] = useState<string[]>([]);
  const [exportFormat, setExportFormat] = useState<string>('PDF');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all'
  });
  const [isExporting, setIsExporting] = useState(false);
  const [exportHistory, setExportHistory] = useState<any[]>([]);

  // Chargement des données via React Query
  const { data: interventionsData, isLoading: interventionsLoading } = useQuery(
    'interventions-exports',
    () => apiClient.getInterventions(),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des interventions:', error);
        toast.error('Erreur lors du chargement des données pour l\'export');
      }
    }
  );

  const { data: peopleData, isLoading: peopleLoading } = useQuery(
    'people-exports',
    () => apiClient.getPeople({ limit: 1000 }),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des personnes:', error);
        toast.error('Erreur lors du chargement des données pour l\'export');
      }
    }
  );

  const { data: remindersData, isLoading: remindersLoading } = useQuery(
    'reminders-exports',
    () => apiClient.getReminders(),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des rappels:', error);
        toast.error('Erreur lors du chargement des données pour l\'export');
      }
    }
  );

  const { data: remindersStats, isLoading: remindersStatsLoading } = useQuery(
    'reminders-stats-exports',
    () => apiClient.getReminderStats(),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des statistiques des rappels:', error);
        toast.error('Erreur lors du chargement des données pour l\'export');
      }
    }
  );

  const exportTemplates: ExportTemplate[] = [
    {
      id: '1',
      name: 'Rapport complet des interventions',
      description: 'Rapport détaillé de toutes les interventions avec statistiques',
      category: 'interventions',
      format: 'PDF',
      fields: ['ID', 'Titre', 'Patient', 'Date', 'Statut', 'Priorité', 'Médecin'],
      isDefault: true
    },
    {
      id: '2',
      name: 'Liste des patients actifs',
      description: 'Export Excel des patients actifs avec informations de contact',
      category: 'patients',
      format: 'Excel',
      fields: ['Nom', 'Email', 'Téléphone', 'Date de naissance', 'Statut', 'Dernière visite'],
      isDefault: true
    },
    {
      id: '3',
      name: 'Historique des rappels',
      description: 'Export CSV de l\'historique complet des rappels',
      category: 'reminders',
      format: 'CSV',
      fields: ['ID', 'Type', 'Destinataire', 'Date d\'envoi', 'Statut', 'Message'],
      isDefault: true
    },
    {
      id: '4',
      name: 'Métriques de performance',
      description: 'Rapport JSON des KPIs et métriques de performance',
      category: 'performance',
      format: 'JSON',
      fields: ['KPI', 'Valeur', 'Objectif', 'Tendance', 'Période'],
      isDefault: true
    },
    {
      id: '5',
      name: 'Rapport personnalisé',
      description: 'Créez votre propre rapport avec les champs de votre choix',
      category: 'custom',
      format: 'PDF',
      fields: [],
      isDefault: false
    }
  ];

  const availableFields = [
    { value: 'id', label: 'ID' },
    { value: 'title', label: 'Titre' },
    { value: 'patient', label: 'Patient' },
    { value: 'date', label: 'Date' },
    { value: 'status', label: 'Statut' },
    { value: 'priority', label: 'Priorité' },
    { value: 'doctor', label: 'Médecin' },
    { value: 'email', label: 'Email' },
    { value: 'phone', label: 'Téléphone' },
    { value: 'birthDate', label: 'Date de naissance' },
    { value: 'lastVisit', label: 'Dernière visite' },
    { value: 'type', label: 'Type' },
    { value: 'recipient', label: 'Destinataire' },
    { value: 'sentDate', label: 'Date d\'envoi' },
    { value: 'message', label: 'Message' },
    { value: 'kpi', label: 'KPI' },
    { value: 'value', label: 'Valeur' },
    { value: 'target', label: 'Objectif' },
    { value: 'trend', label: 'Tendance' }
  ];

  const selectedTemplateData = exportTemplates.find(t => t.id === selectedTemplate);

  const handleFieldToggle = (field: string) => {
    if (customFields.indexOf(field) !== -1) {
      setCustomFields(customFields.filter(f => f !== field));
    } else {
      setCustomFields([...customFields, field]);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Calculer la taille estimée basée sur les données réelles
      const interventions = interventionsData || [];
      const people = peopleData?.data || [];
      const reminders = remindersData || [];
      
      let estimatedSize = 0;
      let recordCount = 0;
      
      switch (selectedTemplateData?.category) {
        case 'interventions':
          recordCount = interventions.length;
          estimatedSize = interventions.length * 0.05; // 50KB par intervention
          break;
        case 'patients':
          recordCount = people.length;
          estimatedSize = people.length * 0.06; // 60KB par patient
          break;
        case 'reminders':
          recordCount = reminders.length;
          estimatedSize = reminders.length * 0.01; // 10KB par rappel
          break;
        case 'performance':
          recordCount = interventions.length + people.length + reminders.length;
          estimatedSize = recordCount * 0.02; // 20KB par enregistrement
          break;
        default:
          recordCount = interventions.length + people.length + reminders.length;
          estimatedSize = recordCount * 0.03; // 30KB par enregistrement
      }
      
      // Simuler l'export avec des données réelles
      setTimeout(() => {
        const newExport = {
          id: Date.now().toString(),
          name: selectedTemplateData?.name || 'Export personnalisé',
          format: exportFormat,
          date: new Date().toISOString(),
          status: 'completed',
          size: `${estimatedSize.toFixed(1)} MB`,
          downloadUrl: '#',
          recordCount: recordCount
        };
        
        setExportHistory([newExport, ...exportHistory]);
        setIsExporting(false);
        toast.success(`Export terminé avec succès (${recordCount} enregistrements)`);
      }, 3000);
    } catch (error) {
      console.error('Erreur lors de l\'export:', error);
      toast.error('Erreur lors de l\'export des données');
      setIsExporting(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'interventions':
        return <CalendarIcon className="h-5 w-5" />;
      case 'patients':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'reminders':
        return <TableCellsIcon className="h-5 w-5" />;
      case 'performance':
        return <ChartBarIcon className="h-5 w-5" />;
      default:
        return <FunnelIcon className="h-5 w-5" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'interventions':
        return 'bg-blue-100 text-blue-800';
      case 'patients':
        return 'bg-green-100 text-green-800';
      case 'reminders':
        return 'bg-purple-100 text-purple-800';
      case 'performance':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'PDF':
        return <DocumentTextIcon className="h-4 w-4" />;
      case 'Excel':
        return <TableCellsIcon className="h-4 w-4" />;
      case 'CSV':
        return <TableCellsIcon className="h-4 w-4" />;
      case 'JSON':
        return <DocumentTextIcon className="h-4 w-4" />;
      default:
        return <DocumentTextIcon className="h-4 w-4" />;
    }
  };

  // État de chargement global
  const isLoading = interventionsLoading || peopleLoading || remindersLoading || remindersStatsLoading;

  return (
    <div className="space-y-6">
      {/* Configuration de l'export */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
            Exporter les données
            {isLoading && (
              <div className="ml-2 h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Sélection du modèle */}
            <div>
              <Label htmlFor="template">Modèle d'export</Label>
              <Select
                id="template"
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}
                options={exportTemplates.map(template => ({
                  value: template.id,
                  label: template.name
                }))}
              />
              {selectedTemplateData && (
                <p className="text-sm text-gray-600 mt-1">
                  {selectedTemplateData.description}
                </p>
              )}
            </div>

            {/* Champs personnalisés */}
            {selectedTemplateData?.category === 'custom' && (
              <div>
                <Label>Champs à inclure</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {availableFields.map((field) => (
                    <label key={field.value} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={customFields.indexOf(field.value) !== -1}
                        onChange={() => handleFieldToggle(field.value)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm text-gray-700">{field.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Format d'export */}
            <div>
              <Label htmlFor="format">Format d'export</Label>
              <Select
                id="format"
                value={exportFormat}
                onValueChange={setExportFormat}
                options={[
                  { value: 'PDF', label: 'PDF' },
                  { value: 'Excel', label: 'Excel (.xlsx)' },
                  { value: 'CSV', label: 'CSV' },
                  { value: 'JSON', label: 'JSON' },
                ]}
              />
            </div>

            {/* Période */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startDate">Date de début</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="endDate">Date de fin</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                />
              </div>
            </div>

            {/* Informations sur les données disponibles */}
            {!isLoading && (
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Données disponibles</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Interventions:</span>
                    <span className="ml-1 font-medium">{interventionsData?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Patients:</span>
                    <span className="ml-1 font-medium">{peopleData?.data?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Rappels:</span>
                    <span className="ml-1 font-medium">{remindersData?.length || 0}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Taux de réussite:</span>
                    <span className="ml-1 font-medium">{remindersStats?.successRate || '0'}%</span>
                  </div>
                </div>
              </div>
            )}

            {/* Filtres */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="status">Statut</Label>
                <Select
                  id="status"
                  value={filters.status}
                  onValueChange={(value) => setFilters({ ...filters, status: value })}
                  options={[
                    { value: 'all', label: 'Tous' },
                    { value: 'active', label: 'Actif' },
                    { value: 'completed', label: 'Terminé' },
                    { value: 'pending', label: 'En attente' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="type">Type</Label>
                <Select
                  id="type"
                  value={filters.type}
                  onValueChange={(value) => setFilters({ ...filters, type: value })}
                  options={[
                    { value: 'all', label: 'Tous' },
                    { value: 'consultation', label: 'Consultation' },
                    { value: 'emergency', label: 'Urgence' },
                    { value: 'follow-up', label: 'Suivi' },
                  ]}
                />
              </div>
              <div>
                <Label htmlFor="priority">Priorité</Label>
                <Select
                  id="priority"
                  value={filters.priority}
                  onValueChange={(value) => setFilters({ ...filters, priority: value })}
                  options={[
                    { value: 'all', label: 'Toutes' },
                    { value: 'high', label: 'Élevée' },
                    { value: 'normal', label: 'Normale' },
                    { value: 'low', label: 'Faible' },
                  ]}
                />
              </div>
            </div>

            {/* Bouton d'export */}
            <div className="flex justify-end">
              <Button
                onClick={handleExport}
                disabled={isExporting || !selectedTemplate}
                className="min-w-[120px]"
              >
                {isExporting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Export...
                  </>
                ) : (
                  <>
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    Exporter
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Historique des exports */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des exports</CardTitle>
        </CardHeader>
        <CardContent>
          {exportHistory.length === 0 ? (
            <div className="text-center py-8">
              <ArrowDownTrayIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun export</h3>
              <p className="mt-1 text-sm text-gray-500">
                Vos exports récents apparaîtront ici.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {exportHistory.map((exportItem) => (
                <div key={exportItem.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getFormatIcon(exportItem.format)}
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{exportItem.name}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(exportItem.date).toLocaleDateString('fr-FR')} - {exportItem.size}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">{exportItem.format}</Badge>
                    <Button variant="outline" size="sm">
                      <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modèles prédéfinis */}
      <Card>
        <CardHeader>
          <CardTitle>Modèles d'export disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {exportTemplates.filter(t => t.isDefault).map((template) => (
              <div key={template.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3 mb-2">
                  <div className={`p-2 rounded-lg ${getCategoryColor(template.category)}`}>
                    {getCategoryIcon(template.category)}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">{template.name}</h4>
                    <p className="text-xs text-gray-500">{template.description}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex space-x-2">
                    <Badge className={getCategoryColor(template.category)}>
                      {template.category}
                    </Badge>
                    <Badge variant="outline">{template.format}</Badge>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedTemplate(template.id)}
                  >
                    Utiliser
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
