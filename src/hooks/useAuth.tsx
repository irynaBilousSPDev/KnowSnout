import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import {
  getCurrentUser,
  onAuthStateChange,
  signIn,
  signOut,
  signUp,
  type AuthUser,
} from '@/src/services/auth';

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const current = await getCurrentUser();
    setUser(current);
  }, []);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const current = await getCurrentUser();
        if (mounted) setUser(current);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    const unsubscribe = onAuthStateChange((next) => {
      if (mounted) {
        setUser(next);
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      refresh,
      signIn: async (email, password) => {
        const next = await signIn(email, password);
        setUser(next);
      },
      signUp: async (email, password) => {
        const next = await signUp(email, password);
        setUser(next);
      },
      signOut: async () => {
        await signOut();
        setUser(null);
      },
    }),
    [user, loading, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
