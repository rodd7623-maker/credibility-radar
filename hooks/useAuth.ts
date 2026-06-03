import { useState, useEffect } from 'react';
import { blink } from '@/lib/blink';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = blink.auth.onAuthStateChanged((state) => {
      setUser(state.user as AuthUser | null);
      if (!state.isLoading) setLoading(false);
    });
    return unsub;
  }, []);

  const signOut = async () => {
    await blink.auth.signOut();
    setUser(null);
  };

  return { user, loading, isAuthenticated: !!user, signOut };
}
