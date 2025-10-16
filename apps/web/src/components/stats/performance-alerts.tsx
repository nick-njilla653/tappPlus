'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  XCircleIcon,
  BellIcon,
  Cog6ToothIcon,
  PlusIcon,
  TrashIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface Alert {
  id: string;
  name: string;
  metric: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  lastTriggered?: string;
  triggerCount: number;
  description: string;
}

interface PerformanceAlertsProps {
  period: string;
}

export function PerformanceAlerts({ period }: PerformanceAlertsProps) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<Alert | null>(null);
  const [loading, setLoading] = useState(true);

  // Chargement des données via React Query
  const { data: interventionsData, isLoading: interventionsLoading } = useQuery(
    'interventions-alerts',
    () => apiClient.getInterventions(),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des interventions:', error);
        toast.error('Erreur lors du chargement des données pour les alertes');
      }
    }
  );

  const { data: peopleData, isLoading: peopleLoading } = useQuery(
    'people-alerts',
    () => apiClient.getPeople({ limit: 1000 }),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des personnes:', error);
        toast.error('Erreur lors du chargement des données pour les alertes');
      }
    }
  );

  const { data: remindersStats, isLoading: remindersLoading } = useQuery(
    'reminders-alerts',
    () => apiClient.getReminderStats(),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des statistiques des rappels:', error);
        toast.error('Erreur lors du chargement des données pour les alertes');
      }
    }
  );

  useEffect(() => {
    if (!interventionsLoading && !peopleLoading && !remindersLoading) {
      // Génération d'alertes basées sur les données réelles
      const interventions = interventionsData || [];
      const people = peopleData?.data || [];
      const reminders = remindersStats || { total: 0, sent: 0, failed: 0, successRate: '0' };

      const completedInterventions = interventions.filter((i: any) => i.status === 'DONE').length;
      const totalInterventions = interventions.length;
      const successRate = totalInterventions > 0 ? (completedInterventions / totalInterventions) * 100 : 0;

      const cancelledInterventions = interventions.filter((i: any) => i.status === 'CANCELLED').length;
      const cancellationRate = totalInterventions > 0 ? (cancelledInterventions / totalInterventions) * 100 : 0;

      const urgentInterventions = interventions.filter((i: any) => i.priority === 'URGENT').length;

      // Génération d'alertes dynamiques basées sur les données
      const dynamicAlerts: Alert[] = [
        {
          id: '1',
          name: 'Taux de réussite faible',
          metric: 'success_rate',
          condition: 'less_than',
          threshold: 85,
          severity: successRate < 85 ? 'high' : 'medium',
          isActive: true,
          lastTriggered: successRate < 85 ? new Date().toISOString() : undefined,
          triggerCount: successRate < 85 ? 1 : 0,
          description: 'Alerte quand le taux de réussite des interventions tombe en dessous de 85%'
        },
        {
          id: '2',
          name: 'Temps de réponse élevé',
          metric: 'response_time',
          condition: 'greater_than',
          threshold: 4,
          severity: 'medium',
          isActive: true,
          lastTriggered: undefined,
          triggerCount: 0,
          description: 'Alerte quand le temps de réponse moyen dépasse 4 heures'
        },
        {
          id: '3',
          name: 'Nombre de patients critiques',
          metric: 'critical_patients',
          condition: 'greater_than',
          threshold: 5,
          severity: urgentInterventions > 5 ? 'critical' : 'medium',
          isActive: true,
          lastTriggered: urgentInterventions > 5 ? new Date().toISOString() : undefined,
          triggerCount: urgentInterventions > 5 ? 1 : 0,
          description: 'Alerte quand le nombre de patients en état critique dépasse 5'
        },
        {
          id: '4',
          name: 'Taux d\'annulation élevé',
          metric: 'cancellation_rate',
          condition: 'greater_than',
          threshold: 15,
          severity: cancellationRate > 15 ? 'high' : 'medium',
          isActive: true,
          lastTriggered: cancellationRate > 15 ? new Date().toISOString() : undefined,
          triggerCount: cancellationRate > 15 ? 1 : 0,
          description: 'Alerte quand le taux d\'annulation dépasse 15%'
        },
        {
          id: '5',
          name: 'Taux de rappels échoués',
          metric: 'reminder_failure_rate',
          condition: 'greater_than',
          threshold: 10,
          severity: parseFloat(reminders.successRate || '0') < 90 ? 'high' : 'medium',
          isActive: true,
          lastTriggered: parseFloat(reminders.successRate || '0') < 90 ? new Date().toISOString() : undefined,
          triggerCount: parseFloat(reminders.successRate || '0') < 90 ? 1 : 0,
          description: 'Alerte quand le taux d\'échec des rappels dépasse 10%'
        }
      ];

      setAlerts(dynamicAlerts);
      setLoading(false);
    }
  }, [interventionsLoading, peopleLoading, remindersLoading, interventionsData, peopleData, remindersStats, period]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'Faible';
      case 'medium':
        return 'Moyen';
      case 'high':
        return 'Élevé';
      case 'critical':
        return 'Critique';
      default:
        return severity;
    }
  };

  const getConditionLabel = (condition: string) => {
    switch (condition) {
      case 'greater_than':
        return 'Supérieur à';
      case 'less_than':
        return 'Inférieur à';
      case 'equals':
        return 'Égal à';
      case 'not_equals':
        return 'Différent de';
      default:
        return condition;
    }
  };

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'success_rate':
        return 'Taux de réussite';
      case 'response_time':
        return 'Temps de réponse';
      case 'critical_patients':
        return 'Patients critiques';
      case 'cancellation_rate':
        return 'Taux d\'annulation';
      default:
        return metric;
    }
  };

  const toggleAlert = (id: string) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isActive: !alert.isActive } : alert
    ));
  };

  const deleteAlert = (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette alerte ?')) {
      setAlerts(alerts.filter(alert => alert.id !== id));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <BellIcon className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total alertes</p>
                <p className="text-2xl font-bold text-gray-900">{alerts.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Actives</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alerts.filter(a => a.isActive).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Déclenchées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alerts.filter(a => a.triggerCount > 0).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <XCircleIcon className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">Critiques</p>
                <p className="text-2xl font-bold text-gray-900">
                  {alerts.filter(a => a.severity === 'critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Liste des alertes */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alertes de performance</CardTitle>
            <Button onClick={() => setShowCreateModal(true)}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Nouvelle alerte
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-medium text-gray-900">{alert.name}</h3>
                      <Badge className={getSeverityColor(alert.severity)}>
                        {getSeverityLabel(alert.severity)}
                      </Badge>
                      <Badge variant={alert.isActive ? 'default' : 'secondary'}>
                        {alert.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-3">{alert.description}</p>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Métrique:</span>
                        <p className="text-gray-900">{getMetricLabel(alert.metric)}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Condition:</span>
                        <p className="text-gray-900">
                          {getConditionLabel(alert.condition)} {alert.threshold}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Déclenchée:</span>
                        <p className="text-gray-900">
                          {alert.triggerCount} fois
                          {alert.lastTriggered && (
                            <span className="block text-xs text-gray-500">
                              Dernière fois: {new Date(alert.lastTriggered).toLocaleDateString('fr-FR')}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleAlert(alert.id)}
                    >
                      {alert.isActive ? 'Désactiver' : 'Activer'}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingAlert(alert)}
                    >
                      <PencilIcon className="h-4 w-4 mr-1" />
                      Modifier
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteAlert(alert.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <TrashIcon className="h-4 w-4 mr-1" />
                      Supprimer
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {alerts.length === 0 && (
              <div className="text-center py-8">
                <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Aucune alerte</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Créez votre première alerte de performance.
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setShowCreateModal(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Créer une alerte
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Historique des alertes */}
      <Card>
        <CardHeader>
          <CardTitle>Historique des alertes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alerts
              .filter(alert => alert.triggerCount > 0)
              .map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full ${getSeverityColor(alert.severity)}`}>
                      <BellIcon className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">{alert.name}</h4>
                      <p className="text-xs text-gray-500">
                        {alert.lastTriggered && 
                          `Dernière alerte: ${new Date(alert.lastTriggered).toLocaleDateString('fr-FR')}`
                        }
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{alert.triggerCount} fois</p>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {getSeverityLabel(alert.severity)}
                    </Badge>
                  </div>
                </div>
              ))}

            {alerts.filter(alert => alert.triggerCount > 0).length === 0 && (
              <div className="text-center py-4">
                <p className="text-sm text-gray-500">Aucune alerte déclenchée récemment</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
