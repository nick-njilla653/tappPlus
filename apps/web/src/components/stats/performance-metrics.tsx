'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  UserGroupIcon,
  BellIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

interface KPIData {
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
  status: 'excellent' | 'good' | 'warning' | 'critical';
  description: string;
}

interface PerformanceMetricsProps {
  period: string;
}

export function PerformanceMetrics({ period }: PerformanceMetricsProps) {
  const [kpis, setKpis] = useState<KPIData[]>([]);
  const [loading, setLoading] = useState(true);

  // Chargement des données via React Query
  const { data: interventionsData, isLoading: interventionsLoading } = useQuery(
    'interventions-metrics',
    () => apiClient.getInterventions(),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des interventions:', error);
        toast.error('Erreur lors du chargement des métriques des interventions');
      }
    }
  );

  const { data: peopleData, isLoading: peopleLoading } = useQuery(
    'people-metrics',
    () => apiClient.getPeople({ limit: 1000 }),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des personnes:', error);
        toast.error('Erreur lors du chargement des métriques des patients');
      }
    }
  );

  const { data: remindersStats, isLoading: remindersLoading } = useQuery(
    'reminders-metrics',
    () => apiClient.getReminderStats(),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des statistiques des rappels:', error);
        toast.error('Erreur lors du chargement des métriques des rappels');
      }
    }
  );

  useEffect(() => {
    if (!interventionsLoading && !peopleLoading && !remindersLoading) {
      // Calcul des KPIs basés sur les données réelles
      const interventions = interventionsData || [];
      const people = peopleData?.data || [];
      const reminders = remindersStats || { total: 0, sent: 0, failed: 0, successRate: '0' };

      const completedInterventions = interventions.filter((i: any) => i.status === 'DONE').length;
      const totalInterventions = interventions.length;
      const successRate = totalInterventions > 0 ? (completedInterventions / totalInterventions) * 100 : 0;

      const urgentInterventions = interventions.filter((i: any) => i.priority === 'URGENT').length;
      const urgentCompleted = interventions.filter((i: any) => i.priority === 'URGENT' && i.status === 'DONE').length;
      const urgentSuccessRate = urgentInterventions > 0 ? (urgentCompleted / urgentInterventions) * 100 : 0;

      const cancelledInterventions = interventions.filter((i: any) => i.status === 'CANCELLED').length;
      const cancellationRate = totalInterventions > 0 ? (cancelledInterventions / totalInterventions) * 100 : 0;

      const calculatedKPIs: KPIData[] = [
        {
          name: 'Taux de réussite des interventions',
          value: Math.round(successRate * 10) / 10,
          target: 90,
          unit: '%',
          trend: successRate >= 90 ? 'up' : 'down',
          change: successRate >= 90 ? 2.6 : -2.6,
          status: successRate >= 90 ? 'excellent' : successRate >= 80 ? 'good' : 'warning',
          description: 'Pourcentage d\'interventions terminées avec succès'
        },
        {
          name: 'Temps de réponse moyen',
          value: 2.3, // Simulation - pas de données réelles pour le temps de réponse
          target: 3.0,
          unit: 'h',
          trend: 'down',
          change: -0.4,
          status: 'excellent',
          description: 'Temps moyen entre la demande et la première intervention'
        },
        {
          name: 'Satisfaction patient',
          value: 4.7, // Simulation - pas de données réelles pour la satisfaction
          target: 4.5,
          unit: '/5',
          trend: 'up',
          change: 0.2,
          status: 'excellent',
          description: 'Note moyenne de satisfaction des patients'
        },
        {
          name: 'Taux de rappels livrés',
          value: parseFloat(reminders.successRate || '0'),
          target: 95,
          unit: '%',
          trend: parseFloat(reminders.successRate || '0') >= 95 ? 'up' : 'down',
          change: parseFloat(reminders.successRate || '0') >= 95 ? 1.8 : -1.8,
          status: parseFloat(reminders.successRate || '0') >= 95 ? 'excellent' : 'warning',
          description: 'Pourcentage de rappels livrés avec succès'
        },
        {
          name: 'Patients actifs',
          value: people.length,
          target: 30,
          unit: '',
          trend: people.length >= 30 ? 'up' : 'down',
          change: people.length >= 30 ? 3 : -3,
          status: people.length >= 30 ? 'excellent' : people.length >= 20 ? 'good' : 'warning',
          description: 'Nombre de patients actuellement suivis'
        },
        {
          name: 'Interventions urgentes traitées',
          value: Math.round(urgentSuccessRate * 10) / 10,
          target: 95,
          unit: '%',
          trend: urgentSuccessRate >= 95 ? 'up' : 'down',
          change: urgentSuccessRate >= 95 ? 2.1 : -2.1,
          status: urgentSuccessRate >= 95 ? 'excellent' : urgentSuccessRate >= 80 ? 'good' : 'warning',
          description: 'Pourcentage d\'interventions urgentes traitées dans les délais'
        },
        {
          name: 'Taux d\'annulation',
          value: Math.round(cancellationRate * 10) / 10,
          target: 5,
          unit: '%',
          trend: cancellationRate <= 5 ? 'down' : 'up',
          change: cancellationRate <= 5 ? -1.5 : 1.5,
          status: cancellationRate <= 5 ? 'excellent' : cancellationRate <= 10 ? 'good' : 'warning',
          description: 'Pourcentage d\'interventions annulées par les patients'
        },
        {
          name: 'Coût moyen par intervention',
          value: 45.2, // Simulation - pas de données réelles pour les coûts
          target: 40,
          unit: '€',
          trend: 'up',
          change: 3.2,
          status: 'warning',
          description: 'Coût moyen d\'une intervention médicale'
        }
      ];

      setKpis(calculatedKPIs);
      setLoading(false);
    }
  }, [interventionsLoading, peopleLoading, remindersLoading, interventionsData, peopleData, remindersStats, period]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'text-green-600 bg-green-100';
      case 'good':
        return 'text-blue-600 bg-blue-100';
      case 'warning':
        return 'text-yellow-600 bg-yellow-100';
      case 'critical':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'Excellent';
      case 'good':
        return 'Bon';
      case 'warning':
        return 'Attention';
      case 'critical':
        return 'Critique';
      default:
        return 'Inconnu';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUpIcon className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDownIcon className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 bg-gray-400 rounded-full" />;
    }
  };

  const getTrendColor = (trend: string, change: number) => {
    if (trend === 'up') return 'text-green-600';
    if (trend === 'down') return 'text-red-600';
    return 'text-gray-600';
  };

  const getProgressPercentage = (value: number, target: number) => {
    return Math.min((value / target) * 100, 100);
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
      {/* KPIs principaux */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.slice(0, 4).map((kpi) => (
          <Card key={kpi.name}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-gray-700 truncate">
                  {kpi.name}
                </h3>
                <Badge className={getStatusColor(kpi.status)}>
                  {getStatusLabel(kpi.status)}
                </Badge>
              </div>
              
              <div className="flex items-baseline mb-2">
                <span className="text-3xl font-bold text-gray-900">
                  {kpi.value}{kpi.unit}
                </span>
                <div className={`ml-2 flex items-center text-sm ${getTrendColor(kpi.trend, kpi.change)}`}>
                  {getTrendIcon(kpi.trend)}
                  <span className="ml-1">{Math.abs(kpi.change)}{kpi.unit}</span>
                </div>
              </div>

              <div className="mb-2">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Objectif: {kpi.target}{kpi.unit}</span>
                  <span>{getProgressPercentage(kpi.value, kpi.target).toFixed(0)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      kpi.status === 'excellent' ? 'bg-green-500' :
                      kpi.status === 'good' ? 'bg-blue-500' :
                      kpi.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${getProgressPercentage(kpi.value, kpi.target)}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-xs text-gray-500">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* KPIs détaillés */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {kpis.slice(4).map((kpi) => (
          <Card key={kpi.name}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{kpi.name}</CardTitle>
                <Badge className={getStatusColor(kpi.status)}>
                  {getStatusLabel(kpi.status)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900">
                    {kpi.value}{kpi.unit}
                  </span>
                  <div className={`ml-2 flex items-center text-sm ${getTrendColor(kpi.trend, kpi.change)}`}>
                    {getTrendIcon(kpi.trend)}
                    <span className="ml-1">{Math.abs(kpi.change)}{kpi.unit}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600">Objectif: {kpi.target}{kpi.unit}</p>
                  <p className="text-xs text-gray-500">
                    {getProgressPercentage(kpi.value, kpi.target).toFixed(0)}% atteint
                  </p>
                </div>
              </div>

              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full ${
                      kpi.status === 'excellent' ? 'bg-green-500' :
                      kpi.status === 'good' ? 'bg-blue-500' :
                      kpi.status === 'warning' ? 'bg-yellow-500' :
                      'bg-red-500'
                    }`}
                    style={{ width: `${getProgressPercentage(kpi.value, kpi.target)}%` }}
                  ></div>
                </div>
              </div>

              <p className="text-sm text-gray-600">{kpi.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Résumé des performances */}
      <Card>
        <CardHeader>
          <CardTitle>Résumé des performances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 mb-3">
                <CheckCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Objectifs atteints</h4>
              <p className="text-2xl font-bold text-green-600">
                {kpis.filter(kpi => kpi.value >= kpi.target).length}/{kpis.length}
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-100 mb-3">
                <ArrowUpIcon className="h-6 w-6 text-blue-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">En progression</h4>
              <p className="text-2xl font-bold text-blue-600">
                {kpis.filter(kpi => kpi.trend === 'up').length}
              </p>
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-100 mb-3">
                <ExclamationTriangleIcon className="h-6 w-6 text-yellow-600" />
              </div>
              <h4 className="text-sm font-medium text-gray-900 mb-1">Attention requise</h4>
              <p className="text-2xl font-bold text-yellow-600">
                {kpis.filter(kpi => kpi.status === 'warning' || kpi.status === 'critical').length}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
