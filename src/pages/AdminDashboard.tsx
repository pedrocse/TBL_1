import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, LogOut, Trash2, Search, User as UserIcon, GraduationCap, PenTool } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { User } from '../types';
import { clsx } from 'clsx';

export const AdminDashboard = () => {
  const { user, logout, getAllUsers, deleteUserById } = useAuth();
  const navigate = useNavigate();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Carrega usuários ao montar
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    setUsersList(getAllUsers());
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteUser = (targetId: string, targetName: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o usuário "${targetName}"? Esta ação é irreversível.`)) {
      deleteUserById(targetId);
      loadUsers(); // Recarrega a lista
    }
  };

  // Filtra usuários (exceto o próprio admin logado)
  const filteredUsers = usersList.filter(u => 
    u.id !== user?.id && 
    (u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
     u.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 border-l-4 border-red-600">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Shield className="text-red-600" /> Painel Administrativo
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              Gerenciamento de usuários do sistema
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">Administrador</p>
            </div>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>

        {/* Conteúdo Principal */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h2 className="text-lg font-semibold text-gray-800">Usuários Cadastrados</h2>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Buscar por nome ou email..." 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none w-full sm:w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Usuário</th>
                  <th className="p-4 font-medium">Perfil</th>
                  <th className="p-4 font-medium">Contato</th>
                  <th className="p-4 font-medium text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      Nenhum usuário encontrado.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map(u => (
                    <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gray-200 p-2 rounded-full text-gray-600">
                            <UserIcon size={20} />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{u.name}</p>
                            <p className="text-xs text-gray-500">Nasc: {new Date(u.birthDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <span className={clsx(
                          "px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 w-fit",
                          u.role === 'teacher' ? "bg-indigo-100 text-indigo-700" : 
                          u.role === 'student' ? "bg-green-100 text-green-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {u.role === 'teacher' && <PenTool size={12} />}
                          {u.role === 'student' && <GraduationCap size={12} />}
                          {u.role === 'admin' && <Shield size={12} />}
                          {u.role === 'teacher' ? 'Professor' : u.role === 'student' ? 'Aluno' : 'Admin'}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        <p>{u.email}</p>
                        <p>{u.phone}</p>
                      </td>
                      <td className="p-4 text-right">
                        <button 
                          onClick={() => handleDeleteUser(u.id, u.name)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2 rounded-lg transition-colors"
                          title="Excluir Usuário"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
