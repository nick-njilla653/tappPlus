import { requireAuth } from '@/lib/auth-server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { StatsOverview } from '@/components/stats/stats-overview';

export default async function StatsPage() {
  await requireAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statistiques</h1>
          <p className="mt-1 text-sm text-gray-600">
            Analysez vos performances et métriques médicales
          </p>
        </div>
        
        <StatsOverview />
      </div>
    </DashboardLayout>
  );
}