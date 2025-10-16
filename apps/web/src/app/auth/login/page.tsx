import { LoginForm } from '@/components/auth/login-form';
import { Logo } from '@/components/ui/logo';

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto flex justify-center">
            <Logo size="lg" showText={false} />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Connexion à TAPP+
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Gestion des rappels d'interventions médicales
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
