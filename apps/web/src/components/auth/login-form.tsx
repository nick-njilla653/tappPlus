'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useApi } from '@/hooks/use-api';
import { setAuthCookies } from '@/lib/auth';

const loginSchema = z.object({
  email: z.string().email('Adresse email invalide'),
  password: z.string().min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const apiClient = useApi();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const { user, access_token, refresh_token } = await apiClient.login(
        data.email,
        data.password
      );

      setAuthCookies(access_token, refresh_token);
      
      toast.success(`Bienvenue, ${user.email} !`);
      router.push('/dashboard');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erreur de connexion');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="label">
            Adresse email
          </label>
          <input
            {...register('email')}
            type="email"
            autoComplete="email"
            className="input"
            placeholder="votre@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-danger-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="label">
            Mot de passe
          </label>
          <input
            {...register('password')}
            type="password"
            autoComplete="current-password"
            className="input"
            placeholder="••••••••"
          />
          {errors.password && (
            <p className="mt-1 text-sm text-danger-600">{errors.password.message}</p>
          )}
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3 text-base font-medium"
        >
          {isLoading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Connexion...
            </div>
          ) : (
            'Se connecter'
          )}
        </button>
      </div>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Compte de démonstration :{' '}
          <span className="font-medium text-primary-600">
            admin@meditache.com / admin123
          </span>
        </p>
      </div>
    </form>
  );
}
