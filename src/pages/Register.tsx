import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ArrowLeft, GraduationCap, PenTool, AlertCircle, Eye, EyeOff, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import clsx from 'clsx';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'student' as UserRole,
    gender: '',
    birthDate: '',
    password: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('As senhas não coincidem.');
      return;
    }

    try {
      const { confirmPassword, ...dataToSend } = formData;
      register(dataToSend);
      // Redirecionamento baseado no role
      if (formData.role === 'admin') navigate('/admin');
      else if (formData.role === 'teacher') navigate('/teacher');
      else navigate('/student');
    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 py-12 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-600 px-8 py-6 flex items-center justify-between">
          <div className="text-white">
            <h1 className="text-2xl font-bold">Criar Conta</h1>
            <p className="text-indigo-100 text-sm mt-1">Preencha seus dados para começar</p>
          </div>
          <Link to="/login" className="text-indigo-100 hover:text-white transition-colors">
            <ArrowLeft size={24} />
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {/* Seleção de Perfil */}
          <div className="grid grid-cols-3 gap-3 mb-8">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'student' })}
              className={clsx(
                "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                formData.role === 'student'
                  ? "border-green-600 bg-green-50 text-green-700"
                  : "border-gray-200 hover:border-green-200 text-gray-500"
              )}
            >
              <GraduationCap size={24} />
              <span className="font-bold text-sm">Aluno</span>
            </button>
            
            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'teacher' })}
              className={clsx(
                "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                formData.role === 'teacher'
                  ? "border-indigo-600 bg-indigo-50 text-indigo-700"
                  : "border-gray-200 hover:border-indigo-200 text-gray-500"
              )}
            >
              <PenTool size={24} />
              <span className="font-bold text-sm">Professor</span>
            </button>

            <button
              type="button"
              onClick={() => setFormData({ ...formData, role: 'admin' })}
              className={clsx(
                "p-3 rounded-xl border-2 flex flex-col items-center gap-2 transition-all",
                formData.role === 'admin'
                  ? "border-red-600 bg-red-50 text-red-700"
                  : "border-gray-200 hover:border-red-200 text-gray-500"
              )}
            >
              <Shield size={24} />
              <span className="font-bold text-sm">Admin</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome Completo</label>
              <input
                required
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="Ex: João da Silva"
              />
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                required
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone</label>
              <input
                required
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                placeholder="(00) 00000-0000"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
              <input
                required
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="col-span-full">
              <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
              <select
                required
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
              >
                <option value="">Selecione...</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro não informar">Prefiro não informar</option>
              </select>
            </div>

            {/* Campos de Senha */}
            <div className="col-span-full border-t pt-4 mt-2">
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Segurança</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
                  <div className="relative">
                    <input
                      required
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                      placeholder="Mínimo 6 caracteres"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Senha</label>
                  <input
                    required
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    placeholder="Repita a senha"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-6 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Finalizar Cadastro
          </button>
        </form>
      </div>
    </div>
  );
};
