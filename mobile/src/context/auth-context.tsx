import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { ApiError, api, clearToken, getToken, setToken } from '@/services/api';

export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'staff' | 'resident';
  unit?: string;
};

type RegisterForm = {
  name: string;
  email: string;
  password: string;
  unit?: string;
};

type AuthResponse = { token: string; user: User };

type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (form: RegisterForm) => Promise<User>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  // Reading the saved token is async on mobile, so we always start in "loading"
  const [loading, setLoading] = useState(true);

  // On app start: if a token is saved, ask the server who it belongs to
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const token = await getToken();
        if (!token) return;

        const data = await api<{ user: User }>('/auth/me');
        if (active) setUser(data.user);
      } catch (err) {
        // Only forget the token if the server says it's invalid.
        // A network error (no Wi-Fi) shouldn't log you out.
        if (err instanceof ApiError && err.status === 401) {
          await clearToken();
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const login = async (email: string, password: string) => {
    const data = await api<AuthResponse>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    await setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (form: RegisterForm) => {
    const data = await api<AuthResponse>('/auth/register', {
      method: 'POST',
      body: form,
    });
    await setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}