import { useEffect, useState } from 'react';
import { api, getToken, setToken, clearToken } from '../services/api';
import { AuthContext } from './useAuth';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // Only "loading" if there's a saved token we still need to check
  const [loading, setLoading] = useState(Boolean(getToken()));

  // On page refresh: if a token is saved, ask the server who it belongs to
  useEffect(() => {
    if (!getToken()) return;

    api('/auth/me')
      .then((data) => setUser(data.user))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const data = await api('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (form) => {
    const data = await api('/auth/register', { method: 'POST', body: form });
    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    clearToken();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}