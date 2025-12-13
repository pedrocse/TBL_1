import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  register: (userData: Omit<User, 'id'>) => void;
  logout: () => void;
  deleteAccount: () => void;
  // Funções de Admin
  getAllUsers: () => User[];
  deleteUserById: (id: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  // Carregar usuário da sessão ao iniciar
  useEffect(() => {
    const storedUser = localStorage.getItem('dualite_app_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (email: string, password: string): boolean => {
    const usersDb = JSON.parse(localStorage.getItem('dualite_app_users') || '[]');
    
    const foundUser = usersDb.find((u: User) => u.email === email && u.password === password);

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword as User);
      localStorage.setItem('dualite_app_session', JSON.stringify(userWithoutPassword));
      return true;
    }
    return false;
  };

  const register = (userData: Omit<User, 'id'>) => {
    const newUser: User = { ...userData, id: uuidv4() };
    
    const usersDb = JSON.parse(localStorage.getItem('dualite_app_users') || '[]');
    
    if (usersDb.some((u: User) => u.email === userData.email)) {
        throw new Error('Email já cadastrado');
    }

    usersDb.push(newUser);
    localStorage.setItem('dualite_app_users', JSON.stringify(usersDb));

    const { password, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword as User);
    localStorage.setItem('dualite_app_session', JSON.stringify(userWithoutPassword));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('dualite_app_session');
  };

  const deleteAccount = () => {
    if (!user) return;
    const usersDb = JSON.parse(localStorage.getItem('dualite_app_users') || '[]');
    const updatedUsers = usersDb.filter((u: User) => u.id !== user.id);
    localStorage.setItem('dualite_app_users', JSON.stringify(updatedUsers));
    logout();
  };

  // --- Funções de Admin ---

  const getAllUsers = (): User[] => {
    const usersDb = JSON.parse(localStorage.getItem('dualite_app_users') || '[]');
    // Retorna usuários sem expor a senha diretamente (opcional, mas boa prática)
    return usersDb.map(({ password, ...u }: User) => u);
  };

  const deleteUserById = (id: string) => {
    const usersDb = JSON.parse(localStorage.getItem('dualite_app_users') || '[]');
    const updatedUsers = usersDb.filter((u: User) => u.id !== id);
    localStorage.setItem('dualite_app_users', JSON.stringify(updatedUsers));
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      login, 
      register, 
      logout,
      deleteAccount,
      getAllUsers,
      deleteUserById
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
