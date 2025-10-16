import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Tapp + - Rappels d\'interventions médicales',
  description: 'Application web de gestion des rappels d\'interventions pour médecins avec notifications automatiques',
  keywords: ['médecine', 'rappels', 'interventions', 'notifications', 'santé'],
  authors: [{ name: 'Tapp + Team' }],
  viewport: 'width=device-width, initial-scale=1',
  icons: {
    icon: '/logo_tapp+.jpg',
    shortcut: '/logo_tapp+.jpg',
    apple: '/logo_tapp+.jpg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="h-full">
      <body className={`${inter.className} h-full antialiased`}>
        <Providers>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#374151',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 10px 40px -10px rgba(0, 0, 0, 0.15)',
              },
              success: {
                iconTheme: {
                  primary: '#22c55e',
                  secondary: '#fff',
                },
              },
              error: {
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
