import { requireAuth } from '@/lib/auth-server';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { SettingsOverview } from '@/components/settings/settings-overview';

export default async function SettingsPage() {
  await requireAuth();

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
          <p className="mt-1 text-sm text-gray-600">
            Configurez votre compte et les préférences de l'application
          </p>
        </div>
        
        <SettingsOverview />
      </div>
    </DashboardLayout>
  );
}