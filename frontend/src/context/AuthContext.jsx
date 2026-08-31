import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api, { setAuthToken } from '../api/axios';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('ahsan_chat_token'));
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!token) {
        setReady(true);
        return;
      }
      setAuthToken(token);
      try {
        const { data } = await api.get('/auth/me');
        if (!cancelled) setUser(data.user);
      } catch {
        if (!cancelled) {
          setToken(null);
          setAuthToken(null);
          localStorage.removeItem('ahsan_chat_token');
        }
      } finally {
        if (!cancelled) setReady(true);
      }
    }

    restoreSession();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applySession(nextUser, nextToken) {
    setUser(nextUser);
    setToken(nextToken);
    setAuthToken(nextToken);
    localStorage.setItem('ahsan_chat_token', nextToken);
  }

  async function signup({ username, email, password }) {
    const { data } = await api.post('/auth/signup', { username, email, password });
    applySession(data.user, data.token);
  }

  async function login({ email, password }) {
    const { data } = await api.post('/auth/login', { email, password });
    applySession(data.user, data.token);
  }

  function logout() {
    setUser(null);
    setToken(null);
    setAuthToken(null);
    localStorage.removeItem('ahsan_chat_token');
  }

  const value = useMemo(
    () => ({ user, token, ready, signup, login, logout }),
    [user, token, ready]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
