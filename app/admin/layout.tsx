"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../components/AuthProvider';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // brief check: if not logged in redirect to /login
    if (!user) {
      try {
        const raw = localStorage.getItem('mock_user');
        if (!raw) {
          router.push('/login');
          return;
        }
      } catch (e) {
        router.push('/login');
        return;
      }
    }

    // Previously enforced role-based access here — removed to allow any authenticated user

    setChecking(false);
  }, [router, user]);

  if (checking) return null;

  return <>{children}</>;
}
