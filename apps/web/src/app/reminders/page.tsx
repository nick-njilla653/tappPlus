import { requireAuth } from '@/lib/auth-server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { RemindersOverview } from '@/components/reminders/reminders-overview';

export default async function RemindersPage() {
  await requireAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Rappels</h1>
          <p className="mt-1 text-sm text-gray-600">
            Gérez vos rappels et notifications automatiques
          </p>
        </div>
        
        <RemindersOverview />
      </div>
    </DashboardLayout>
  );
}