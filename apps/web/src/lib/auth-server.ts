import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function getServerSession() {
  const cookieStore = cookies();
  const token = cookieStore.get('access_token')?.value;
  
  if (!token) {
    return null;
  }

  try {
    // Ici, vous pourriez valider le token côté serveur
    // Pour l'instant, on retourne juste un objet de session basique
    return {
      token,
      isAuthenticated: true,
    };
  } catch (error) {
    return null;
  }
}

export async function requireAuth() {
  const session = await getServerSession();
  
  if (!session) {
    redirect('/auth/login');
  }
  
  return session;
}