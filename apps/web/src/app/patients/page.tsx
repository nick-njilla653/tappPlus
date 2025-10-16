import { requireAuth } from '@/lib/auth-server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { PatientsOverview } from '@/components/patients/patients-overview';

export default async function PatientsPage() {
  await requireAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez vos patients et leurs informations médicales
          </p>
        </div>
        
        <PatientsOverview />
      </div>
    </DashboardLayout>
  );
}