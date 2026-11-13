import { createContext, useContext, useEffect, useState } from 'react';
import { api, getToken, setToken } from './api';

const Ctx = createContext(null);
export const useAuth = () => useContext(Ctx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!getToken());

  // Au chargement : si un token existe, on récupère l'utilisateur
  useEffect(() => {
    if (!getToken()) return;
    api('/auth/me')
      .then(setUser)
      .catch((e) => { if (e.status === 401) setToken(null); })
      .finally(() => setLoading(false));
  }, []);

  const sauver = ({ token, user }) => { setToken(token); setUser(user); };

  const login = async (email, password) =>
    sauver(await api('/auth/login', { method: 'POST', body: { email, password } }));

  const register = async (nom, email, password) =>
    sauver(await api('/auth/register', { method: 'POST', body: { nom, email, password } }));

  const logout = () => { setToken(null); setUser(null); };

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  );
}