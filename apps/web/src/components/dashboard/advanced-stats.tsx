'use client';

import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SimpleChart } from '@/components/charts/simple-chart';
import { LoadingCard } from '@/components/ui/loading';
import { 
  ChartBarIcon, 
  ArrowUpIcon,
  CalendarIcon,
  UserGroupIcon,
  BellIcon
} from '@heroicons/react/24/outline';

export function AdvancedStats() {
  const { data: stats, isLoading } = useQuery(
    'dashboard-stats',
    () => apiClient.getReminderStats(),
    {
      refetchInterval: 60000,
    }
  );

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LoadingCard lines={4} />
        <LoadingCard lines={4} />
      </div>
    );
  }

  // Données simulées pour les graphiques
  const weeklyData = [
    { label: 'Lun', value: 12, color: '#3B82F6' },
    { label: 'Mar', value: 19, color: '#3B82F6' },
    { label: 'Mer', value: 8, color: '#3B82F6' },
    { label: 'Jeu', value: 15, color: '#3B82F6' },
    { label: 'Ven', value: 22, color: '#3B82F6' },
    { label: 'Sam', value: 6, color: '#3B82F6' },
    { label: 'Dim', value: 3, color: '#3B82F6' },
  ];

  const priorityData = [
    { label: 'Urgentes', value: 5, color: '#EF4444' },
    { label: 'Normales', value: 23, color: '#3B82F6' },
    { label: 'Faibles', value: 8, color: '#10B981' },
  ];

  const channelData = [
    { label: 'Email', value: 18, color: '#3B82F6' },
    { label: 'SMS', value: 12, color: '#10B981' },
    { label: 'Push', value: 6, color: '#F59E0B' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Graphique des interventions par jour */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChartBarIcon className="h-5 w-5" />
            Interventions cette semaine
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleChart
            data={weeklyData}
            type="bar"
            height={200}
          />
        </CardContent>
      </Card>

      {/* Graphique des priorités */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Répartition par priorité
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleChart
            data={priorityData}
            type="pie"
            height={200}
          />
        </CardContent>
      </Card>

      {/* Graphique des canaux de notification */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellIcon className="h-5 w-5" />
            Canaux de notification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SimpleChart
            data={channelData}
            type="bar"
            height={200}
          />
        </CardContent>
      </Card>

      {/* Tendances */}
      <Card>
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <ArrowUpIcon className="h-5 w-5" />
             Tendances
           </CardTitle>
         </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
               <div className="flex items-center gap-2">
                 <ArrowUpIcon className="h-5 w-5 text-green-600" />
                 <span className="text-sm font-medium text-green-800">
                   Interventions terminées
                 </span>
               </div>
              <span className="text-lg font-bold text-green-600">+15%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="h-5 w-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Nouveaux patients
                </span>
              </div>
              <span className="text-lg font-bold text-blue-600">+8%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
              <div className="flex items-center gap-2">
                <BellIcon className="h-5 w-5 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Rappels envoyés
                </span>
              </div>
              <span className="text-lg font-bold text-yellow-600">+12%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
