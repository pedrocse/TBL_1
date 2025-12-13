import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, FileText, ArrowRight, Calendar, LogOut, User, UserX, PlayCircle, PauseCircle, Key, Lock, Unlock } from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

export const TeacherDashboard = () => {
  const { exams, createExam, deleteExam, toggleExamPublication, togglePhase2Release } = useExam();
  const { user, logout, deleteAccount } = useAuth();
  const navigate = useNavigate();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    const id = createExam(newTitle, newDesc);
    setIsCreating(false);
    setNewTitle('');
    setNewDesc('');
    navigate(`/teacher/exam/${id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita.')) {
      deleteAccount();
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Painel do Professor</h1>
            <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
              <User size={16} />
              <span>Olá, <strong>{user?.name}</strong></span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <button 
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Plus size={20} />
              Nova Prova
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors border border-gray-200"
            >
              <LogOut size={18} />
              Sair
            </button>
            <button 
              onClick={handleDeleteAccount}
              className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition-colors border border-red-100"
              title="Excluir Conta"
            >
              <UserX size={18} />
            </button>
          </div>
        </div>

        {/* Modal de Criação */}
        {isCreating && (
          <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-indigo-100 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Criar Nova Prova</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título da Prova</label>
                <input 
                  type="text" 
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Ex: Prova de Matemática - 1º Bimestre"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                <input 
                  type="text" 
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                  placeholder="Breve descrição sobre o conteúdo..."
                />
              </div>
              <div className="flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                >
                  Criar e Editar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de Provas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {exams.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Você ainda não criou nenhuma prova.</p>
            </div>
          ) : (
            exams.map(exam => (
              <div key={exam.id} className={clsx(
                "rounded-xl shadow-sm border transition-all p-6 flex flex-col justify-between group",
                exam.isPublished ? "bg-white border-green-200 ring-1 ring-green-100" : "bg-gray-50 border-gray-200"
              )}>
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex flex-col">
                      <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{exam.title}</h3>
                      <span className={clsx(
                        "text-xs font-bold px-2 py-0.5 rounded-full w-fit mt-1",
                        exam.isPublished ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-600"
                      )}>
                        {exam.isPublished ? 'PUBLICADA' : 'RASCUNHO (OCULTA)'}
                      </span>
                    </div>
                    <button 
                      onClick={() => deleteExam(exam.id)}
                      className="text-gray-400 hover:text-red-500 p-1 rounded hover:bg-red-50 transition-colors"
                      title="Excluir Prova"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2 mt-2">{exam.description || 'Sem descrição.'}</p>
                  
                  {/* Área da Senha */}
                  {exam.isPublished && exam.accessCode && (
                    <div className="bg-green-50 border border-green-100 rounded-lg p-3 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-800 text-sm">
                        <Key size={16} />
                        <span>Senha para Alunos:</span>
                      </div>
                      <span className="text-xl font-mono font-bold text-green-700 tracking-widest bg-white px-2 py-0.5 rounded border border-green-200">
                        {exam.accessCode}
                      </span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                    <span className="flex items-center gap-1 bg-gray-100 px-2 py-1 rounded">
                      <FileText size={14} />
                      {exam.questions.length} Questões
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(exam.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <Link 
                    to={`/teacher/exam/${exam.id}`}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-indigo-200 text-indigo-700 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                  >
                    Editar Questões <ArrowRight size={16} />
                  </Link>

                  {/* Botão de Publicar/Ocultar */}
                  <button 
                    onClick={() => toggleExamPublication(exam.id)}
                    className={clsx(
                      "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg font-medium transition-colors text-white",
                      exam.isPublished 
                        ? "bg-orange-500 hover:bg-orange-600" 
                        : "bg-green-600 hover:bg-green-700"
                    )}
                  >
                    {exam.isPublished ? (
                      <>
                        <PauseCircle size={18} /> Ocultar Prova
                      </>
                    ) : (
                      <>
                        <PlayCircle size={18} /> Liberar e Gerar Senha
                      </>
                    )}
                  </button>

                  {/* Botão de Controle da Fase 2 (Só aparece se publicado) */}
                  {exam.isPublished && (
                    <button
                      onClick={() => togglePhase2Release(exam.id)}
                      className={clsx(
                        "w-full flex items-center justify-center gap-2 py-2 rounded-lg font-medium transition-colors border",
                        exam.isPhase2Released
                          ? "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100"
                          : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
                      )}
                    >
                      {exam.isPhase2Released ? (
                        <>
                          <Unlock size={16} /> Fase 2 Liberada
                        </>
                      ) : (
                        <>
                          <Lock size={16} /> Liberar Fase 2 (TBL)
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
