import { requireAuth } from '@/lib/auth-server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { InterventionsOverview } from '@/components/interventions/interventions-overview';

export default async function InterventionsPage() {
  await requireAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Interventions</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez vos interventions médicales et visites à domicile
          </p>
        </div>
        
        <InterventionsOverview />
      </div>
    </DashboardLayout>
  );
}