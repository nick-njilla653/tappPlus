'use client';

import { useQuery } from 'react-query';
import { apiClient } from '@/lib/api';
import { StatsCard } from './stats-card';
import { UpcomingInterventions } from './upcoming-interventions';
import { RecentActivity } from './recent-activity';
import { QuickActions } from './quick-actions';
import { AdvancedStats } from './advanced-stats';
import { 
  CalendarIcon, 
  UserGroupIcon, 
  BellIcon, 
  ExclamationTriangleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export function DashboardOverview() {
  const { data: upcomingInterventions, isLoading: loadingInterventions } = useQuery(
    'upcoming-interventions',
    () => apiClient.getUpcomingInterventions(7),
    {
      refetchInterval: 30000, // Refetch every 30 seconds
    }
  );

  const { data: reminderStats, isLoading: loadingStats } = useQuery(
    'reminder-stats',
    () => apiClient.getReminderStats(),
    {
      refetchInterval: 60000, // Refetch every minute
    }
  );

  const stats = [
    {
      name: 'Interventions à venir',
      value: upcomingInterventions?.length || 0,
      icon: CalendarIcon,
      color: 'primary',
      change: '+12%',
      changeType: 'positive',
    },
    {
      name: 'Rappels envoyés',
      value: reminderStats?.sent || 0,
      icon: BellIcon,
      color: 'success',
      change: '+8%',
      changeType: 'positive',
    },
    {
      name: 'Interventions urgentes',
      value: upcomingInterventions?.filter((i: any) => i.priority === 'URGENT').length || 0,
      icon: ExclamationTriangleIcon,
      color: 'danger',
      change: '-2%',
      changeType: 'negative',
    },
    {
      name: 'Taux de réussite',
      value: reminderStats?.successRate || '0',
      unit: '%',
      icon: CheckCircleIcon,
      color: 'success',
      change: '+5%',
      changeType: 'positive',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatsCard key={stat.name} stat={stat} />
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Upcoming Interventions */}
        <div className="lg:col-span-2">
          <UpcomingInterventions 
            interventions={upcomingInterventions} 
            isLoading={loadingInterventions} 
          />
        </div>

        {/* Quick Actions & Recent Activity */}
        <div className="space-y-6">
          <QuickActions />
          <RecentActivity />
        </div>
      </div>

      {/* Advanced Statistics */}
      <AdvancedStats />
    </div>
  );
}

