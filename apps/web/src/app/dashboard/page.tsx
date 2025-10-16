import { requireAuth } from '@/lib/auth-server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { DashboardOverview } from '@/components/dashboard/dashboard-overview';

export default async function DashboardPage() {
  await requireAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tableau de bord</h1>
          <p className="mt-1 text-sm text-gray-600">
            Vue d'ensemble de vos interventions et rappels
          </p>
        </div>
        
        <DashboardOverview />
      </div>
    </DashboardLayout>
  );
}
