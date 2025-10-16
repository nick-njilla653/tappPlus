'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DocumentTextIcon,
  ChartBarIcon,
  UserGroupIcon,
  BellIcon,
  CalendarIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

interface ReportData {
  id: string;
  title: string;
  category: 'interventions' | 'patients' | 'reminders' | 'performance';
  description: string;
  lastGenerated: string;
  size: string;
  format: 'PDF' | 'Excel' | 'CSV';
  status: 'ready' | 'generating' | 'error';
  metrics: {
    totalRecords: number;
    dateRange: string;
    filters: string[];
  };
}

interface DetailedReportsProps {
  period: string;
}

export function DetailedReports({ period }: DetailedReportsProps) {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Chargement des données via React Query
  const { data: interventionsData, isLoading: interventionsLoading } = useQuery(
    'interventions-reports',
    () => apiClient.getInterventions(),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des interventions:', error);
        toast.error('Erreur lors du chargement des données pour les rapports');
      }
    }
  );

  const { data: peopleData, isLoading: peopleLoading } = useQuery(
    'people-reports',
    () => apiClient.getPeople({ limit: 1000 }),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des personnes:', error);
        toast.error('Erreur lors du chargement des données pour les rapports');
      }
    }
  );

  const { data: remindersData, isLoading: remindersLoading } = useQuery(
    'reminders-reports',
    () => apiClient.getReminders(),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des rappels:', error);
        toast.error('Erreur lors du chargement des données pour les rapports');
      }
    }
  );

  const { data: remindersStats, isLoading: remindersStatsLoading } = useQuery(
    'reminders-stats-reports',
    () => apiClient.getReminderStats(),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des statistiques des rappels:', error);
        toast.error('Erreur lors du chargement des données pour les rapports');
      }
    }
  );

  useEffect(() => {
    if (!interventionsLoading && !peopleLoading && !remindersLoading && !remindersStatsLoading) {
      // Génération de rapports basés sur les données réelles
      const interventions = interventionsData || [];
      const people = peopleData?.data || [];
      const reminders = remindersData || [];
      const remindersStatsData = remindersStats || { total: 0, sent: 0, failed: 0, successRate: '0' };

      const currentDate = new Date();
      const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const lastMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0);

      const completedInterventions = interventions.filter((i: any) => i.status === 'DONE').length;
      const urgentInterventions = interventions.filter((i: any) => i.priority === 'URGENT').length;

      const dynamicReports: ReportData[] = [
        {
          id: '1',
          title: `Rapport des interventions - ${lastMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
          category: 'interventions',
          description: `Rapport détaillé de toutes les interventions médicales effectuées en ${lastMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
          lastGenerated: new Date().toISOString(),
          size: `${(interventions.length * 0.05).toFixed(1)} MB`,
          format: 'PDF',
          status: 'ready',
          metrics: {
            totalRecords: interventions.length,
            dateRange: `${lastMonth.getDate()}-${lastMonthEnd.getDate()} ${lastMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
            filters: [`Statut: Terminées (${completedInterventions})`, 'Type: Toutes']
          }
        },
        {
          id: '2',
          title: 'Analyse des patients actifs',
          category: 'patients',
          description: 'Statistiques détaillées sur les patients actifs et leur évolution',
          lastGenerated: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          size: `${(people.length * 0.06).toFixed(1)} MB`,
          format: 'Excel',
          status: 'ready',
          metrics: {
            totalRecords: people.length,
            dateRange: '30 derniers jours',
            filters: ['Statut: Actif', 'Tous âges']
          }
        },
        {
          id: '3',
          title: 'Performance des rappels',
          category: 'reminders',
          description: 'Analyse de l\'efficacité des rappels par type et canal',
          lastGenerated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          size: `${(reminders.length * 0.01).toFixed(1)} MB`,
          format: 'CSV',
          status: 'ready',
          metrics: {
            totalRecords: reminders.length,
            dateRange: '7 derniers jours',
            filters: ['Type: Email, SMS, Push', `Taux de réussite: ${remindersStatsData.successRate}%`]
          }
        },
        {
          id: '4',
          title: 'Métriques de performance globales',
          category: 'performance',
          description: 'KPIs et métriques de performance de l\'équipe médicale',
          lastGenerated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          size: `${((interventions.length + people.length + reminders.length) * 0.02).toFixed(1)} MB`,
          format: 'PDF',
          status: 'ready',
          metrics: {
            totalRecords: interventions.length + people.length + reminders.length,
            dateRange: `${lastMonth.getDate()}-${lastMonthEnd.getDate()} ${lastMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}`,
            filters: ['Toutes catégories', 'Période: Mensuelle', `Taux de réussite: ${remindersStatsData.successRate}%`]
          }
        },
        {
          id: '5',
          title: 'Rapport des interventions urgentes',
          category: 'interventions',
          description: 'Analyse des interventions marquées comme urgentes',
          lastGenerated: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          size: `${(urgentInterventions * 0.15).toFixed(1)} MB`,
          format: 'PDF',
          status: urgentInterventions > 0 ? 'ready' : 'generating',
          metrics: {
            totalRecords: urgentInterventions,
            dateRange: '30 derniers jours',
            filters: ['Priorité: Urgente']
          }
        }
      ];

      setReports(dynamicReports);
      setLoading(false);
    }
  }, [interventionsLoading, peopleLoading, remindersLoading, remindersStatsLoading, interventionsData, peopleData, remindersData, remindersStats, period]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'interventions':
        return <CalendarIcon className="h-5 w-5" />;
      case 'patients':
        return <UserGroupIcon className="h-5 w-5" />;
      case 'reminders':
        return <BellIcon className="h-5 w-5" />;
      case 'performance':
        return <ChartBarIcon className="h-5 w-5" />;
      default:
        return <DocumentTextIcon className="h-5 w-5" />;
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

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'interventions':
        return 'Interventions';
      case 'patients':
        return 'Patients';
      case 'reminders':
        return 'Rappels';
      case 'performance':
        return 'Performance';
      default:
        return category;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Prêt';
      case 'generating':
        return 'Génération...';
      case 'error':
        return 'Erreur';
      default:
        return status;
    }
  };

  const getFormatColor = (format: string) => {
    switch (format) {
      case 'PDF':
        return 'bg-red-100 text-red-800';
      case 'Excel':
        return 'bg-green-100 text-green-800';
      case 'CSV':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredReports = selectedCategory === 'all' 
    ? reports 
    : reports.filter(report => report.category === selectedCategory);

  const categories = [
    { value: 'all', label: 'Tous les rapports' },
    { value: 'interventions', label: 'Interventions' },
    { value: 'patients', label: 'Patients' },
    { value: 'reminders', label: 'Rappels' },
    { value: 'performance', label: 'Performance' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filtres de catégorie */}
      <Card>
        <CardHeader>
          <CardTitle>Rapports détaillés</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            {categories.map((category) => (
              <Button
                key={category.value}
                variant={selectedCategory === category.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category.value)}
              >
                {category.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Liste des rapports */}
      <div className="grid grid-cols-1 gap-4">
        {filteredReports.map((report) => (
          <Card key={report.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <div className={`p-2 rounded-lg ${getCategoryColor(report.category)}`}>
                      {getCategoryIcon(report.category)}
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">{report.title}</h3>
                      <p className="text-sm text-gray-600">{report.description}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-4">
                    <Badge className={getCategoryColor(report.category)}>
                      {getCategoryIcon(report.category)}
                      <span className="ml-1">{getCategoryLabel(report.category)}</span>
                    </Badge>
                    <Badge className={getStatusColor(report.status)}>
                      {getStatusLabel(report.status)}
                    </Badge>
                    <Badge className={getFormatColor(report.format)}>
                      {report.format}
                    </Badge>
                    <Badge variant="outline">
                      {report.size}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Dernière génération:</span>
                      <p>{new Date(report.lastGenerated).toLocaleDateString('fr-FR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}</p>
                    </div>
                    <div>
                      <span className="font-medium">Enregistrements:</span>
                      <p>{report.metrics.totalRecords} éléments</p>
                    </div>
                    <div>
                      <span className="font-medium">Période:</span>
                      <p>{report.metrics.dateRange}</p>
                    </div>
                  </div>

                  {report.metrics.filters.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm font-medium text-gray-700">Filtres appliqués:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {report.metrics.filters.map((filter, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {filter}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col space-y-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={report.status !== 'ready'}
                  >
                    <EyeIcon className="h-4 w-4 mr-1" />
                    Voir
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={report.status !== 'ready'}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                    Télécharger
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={report.status !== 'ready'}
                  >
                    <PrinterIcon className="h-4 w-4 mr-1" />
                    Imprimer
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Statistiques des rapports */}
      <Card>
        <CardHeader>
          <CardTitle>Statistiques des rapports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">{reports.length}</p>
              <p className="text-sm text-gray-600">Total des rapports</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {reports.filter(r => r.status === 'ready').length}
              </p>
              <p className="text-sm text-gray-600">Prêts</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {reports.filter(r => r.status === 'generating').length}
              </p>
              <p className="text-sm text-gray-600">En cours</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {reports.reduce((sum, r) => sum + r.metrics.totalRecords, 0)}
              </p>
              <p className="text-sm text-gray-600">Enregistrements</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
