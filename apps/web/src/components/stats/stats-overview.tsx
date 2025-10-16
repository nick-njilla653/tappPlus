'use client';

import { useState, useEffect } from 'react';
import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { 
  ChartBarIcon,
  CalendarIcon,
  UserGroupIcon,
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading';
import { AdvancedCharts } from './advanced-charts';
import { PerformanceMetrics } from './performance-metrics';
import { TimeFilters } from './time-filters';
import { DetailedReports } from './detailed-reports';
import { DataExports } from './data-exports';
import { PerformanceAlerts } from './performance-alerts';

interface StatData {
  period: string;
  interventions: number;
  patients: number;
  reminders: number;
  successRate: number;
}

// Interface pour les statistiques de l'API
interface ApiStats {
  interventions: {
    total: number;
    completed: number;
    pending: number;
    cancelled: number;
  };
  people: {
    total: number;
    active: number;
    inactive: number;
  };
  reminders: {
    total: number;
    sent: number;
    failed: number;
    pending: number;
    cancelled: number;
    successRate: string;
  };
}

const calculateChange = (current: number, previous: number) => {
  if (previous === 0) return { value: 0, isPositive: true };
  const change = ((current - previous) / previous) * 100;
  return { value: Math.abs(change), isPositive: change >= 0 };
};

export function StatsOverview() {
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'charts' | 'metrics' | 'reports' | 'exports' | 'alerts'>('overview');
  const [timeFilters, setTimeFilters] = useState({
    period: '30d' as const,
    startDate: '',
    endDate: '',
    compareWith: 'previous' as const,
    granularity: 'day' as const,
    timezone: 'Europe/Paris'
  });

  // Chargement des statistiques via React Query
  const { data: interventionsData, isLoading: interventionsLoading } = useQuery(
    'interventions-stats',
    () => apiClient.getInterventions(),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des interventions:', error);
        toast.error('Erreur lors du chargement des statistiques des interventions');
      }
    }
  );

  const { data: peopleData, isLoading: peopleLoading } = useQuery(
    'people-stats',
    () => apiClient.getPeople({ limit: 1000 }),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des personnes:', error);
        toast.error('Erreur lors du chargement des statistiques des patients');
      }
    }
  );

  const { data: remindersStats, isLoading: remindersLoading } = useQuery(
    'reminders-stats',
    () => apiClient.getReminderStats(),
    {
      onError: (error) => {
        console.error('Erreur lors du chargement des statistiques des rappels:', error);
        toast.error('Erreur lors du chargement des statistiques des rappels');
      }
    }
  );

  // Calcul des statistiques actuelles
  const currentStats = {
    interventions: interventionsData?.length || 0,
    patients: peopleData?.data?.length || 0,
    reminders: remindersStats?.total || 0,
    successRate: parseFloat(remindersStats?.successRate || '0')
  };

  // Pour les comparaisons, on utilise des valeurs par défaut
  const previousStats = {
    interventions: Math.floor(currentStats.interventions * 0.9), // Simulation -10%
    patients: Math.floor(currentStats.patients * 0.95), // Simulation -5%
    reminders: Math.floor(currentStats.reminders * 0.85), // Simulation -15%
    successRate: currentStats.successRate * 0.95 // Simulation -5%
  };

  useEffect(() => {
    if (!interventionsLoading && !peopleLoading && !remindersLoading) {
      setLoading(false);
    }
  }, [interventionsLoading, peopleLoading, remindersLoading]);

  const interventionsChange = calculateChange(currentStats.interventions, previousStats.interventions);
  const patientsChange = calculateChange(currentStats.patients, previousStats.patients);
  const remindersChange = calculateChange(currentStats.reminders, previousStats.reminders);
  const successRateChange = calculateChange(currentStats.successRate, previousStats.successRate);

  const mainStats = [
    {
      name: 'Interventions ce mois',
      value: currentStats.interventions,
      change: interventionsChange,
      icon: CalendarIcon,
      color: 'blue',
    },
    {
      name: 'Patients actifs',
      value: currentStats.patients,
      change: patientsChange,
      icon: UserGroupIcon,
      color: 'green',
    },
    {
      name: 'Rappels envoyés',
      value: currentStats.reminders,
      change: remindersChange,
      icon: BellIcon,
      color: 'purple',
    },
    {
      name: 'Taux de réussite',
      value: `${currentStats.successRate}%`,
      change: successRateChange,
      icon: CheckCircleIcon,
      color: 'yellow',
    },
  ];

  const detailedStats = [
    {
      title: 'Interventions par statut',
      data: [
        { name: 'Terminées', value: 38, color: 'bg-green-500' },
        { name: 'En cours', value: 5, color: 'bg-blue-500' },
        { name: 'Planifiées', value: 2, color: 'bg-yellow-500' },
      ]
    },
    {
      title: 'Rappels par type',
      data: [
        { name: 'Email', value: 35, color: 'bg-blue-500' },
        { name: 'SMS', value: 25, color: 'bg-green-500' },
        { name: 'Push', value: 7, color: 'bg-purple-500' },
      ]
    },
    {
      title: 'Patients par statut',
      data: [
        { name: 'Actifs', value: 22, color: 'bg-green-500' },
        { name: 'À risque', value: 4, color: 'bg-yellow-500' },
        { name: 'Inactifs', value: 2, color: 'bg-gray-500' },
      ]
    }
  ];

  const handleTimeFiltersChange = (filters: any) => {
    setTimeFilters(filters);
    setSelectedPeriod(filters.period);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Navigation par onglets */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ChartBarIcon className="h-4 w-4 inline mr-2" />
            Vue d'ensemble
          </button>
          <button
            onClick={() => setActiveTab('charts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'charts'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ChartBarIcon className="h-4 w-4 inline mr-2" />
            Graphiques
          </button>
          <button
            onClick={() => setActiveTab('metrics')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'metrics'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <Cog6ToothIcon className="h-4 w-4 inline mr-2" />
            Métriques
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'reports'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <DocumentTextIcon className="h-4 w-4 inline mr-2" />
            Rapports
          </button>
          <button
            onClick={() => setActiveTab('exports')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'exports'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ArrowDownTrayIcon className="h-4 w-4 inline mr-2" />
            Exports
          </button>
          <button
            onClick={() => setActiveTab('alerts')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'alerts'
                ? 'border-primary-500 text-primary-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            <ExclamationTriangleIcon className="h-4 w-4 inline mr-2" />
            Alertes
          </button>
        </nav>
      </div>

      {/* Filtres temporels */}
      <TimeFilters 
        onFiltersChange={handleTimeFiltersChange}
        initialFilters={timeFilters}
      />

      {/* Contenu des onglets */}
      {activeTab === 'overview' && (
        <>
          {/* Main Stats */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {mainStats.map((stat) => (
              <Card key={stat.name}>
                <CardContent className="p-5">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                    </div>
                    <div className="ml-5 w-0 flex-1">
                      <dl>
                        <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
                        <dd className="flex items-baseline">
                          <div className="text-2xl font-semibold text-gray-900">{stat.value}</div>
                          <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                            stat.change.isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stat.change.isPositive ? (
                              <ArrowUpIcon className="self-center flex-shrink-0 h-4 w-4 text-green-500" />
                            ) : (
                              <ArrowDownIcon className="self-center flex-shrink-0 h-4 w-4 text-red-500" />
                            )}
                            <span className="sr-only">
                              {stat.change.isPositive ? 'Augmenté' : 'Diminué'} de
                            </span>
                            {stat.change.value.toFixed(1)}%
                          </div>
                        </dd>
                      </dl>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {detailedStats.map((section) => (
              <Card key={section.title}>
                <CardHeader>
                  <CardTitle>{section.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.data.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-3 h-3 rounded-full ${item.color} mr-3`}></div>
                          <span className="text-sm font-medium text-gray-900">{item.name}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Résumé des activités récentes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex items-center p-3 bg-green-50 rounded-lg">
                  <CheckCircleIcon className="h-8 w-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-green-800">Interventions terminées</p>
                    <p className="text-lg font-semibold text-green-900">38</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                  <ClockIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-blue-800">En cours</p>
                    <p className="text-lg font-semibold text-blue-900">5</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                  <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-yellow-800">Urgentes</p>
                    <p className="text-lg font-semibold text-yellow-900">2</p>
                  </div>
                </div>
                <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                  <BellIcon className="h-8 w-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-purple-800">Rappels en attente</p>
                    <p className="text-lg font-semibold text-purple-900">3</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {activeTab === 'charts' && (
        <AdvancedCharts period={selectedPeriod} />
      )}

      {activeTab === 'metrics' && (
        <PerformanceMetrics period={selectedPeriod} />
      )}

      {activeTab === 'reports' && (
        <DetailedReports period={selectedPeriod} />
      )}

      {activeTab === 'exports' && (
        <DataExports period={selectedPeriod} />
      )}

      {activeTab === 'alerts' && (
        <PerformanceAlerts period={selectedPeriod} />
      )}
    </div>
  );
}
