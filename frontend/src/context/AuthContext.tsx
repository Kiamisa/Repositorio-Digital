import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';

interface User {
  email: string;
  perfil: string;
}

interface AuthContextData {
  user: User | null;
  token: string | null;
  login: (token: string, email: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
  isAdminOrGestor: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));

  useEffect(() => {
    // Recupera estado ao recarregar página
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (newToken: string, email: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    
    // Simulação de perfil (igual fizemos no Vue, pois o backend v1 só retorna token)
    // Num backend v2, decodificaríamos o token JWT real.
    const perfil = (email.includes('admin') || email.includes('maria')) ? 'ADMIN' : 'FUNCIONARIO';
    const newUser = { email, perfil };
    
    localStorage.setItem('user', JSON.stringify(newUser));
    setUser(newUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  const isAdminOrGestor = user?.perfil === 'ADMIN' || user?.perfil === 'GESTOR';

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token, isAdminOrGestor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);