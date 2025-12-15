import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Trash2, FileText, ArrowRight, Calendar, LogOut, User, PlayCircle, PauseCircle, Key, Lock, Unlock, FileBarChart, Percent } from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import { clsx } from 'clsx';

export const TeacherDashboard = () => {
  const { exams, createExam, deleteExam, toggleExamPublication, togglePhase2Release } = useExam();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  
  // Novos estados para peso na criação
  const [weightP1, setWeightP1] = useState(70);
  const [weightP2, setWeightP2] = useState(30);

  const handleWeightP1Change = (val: number) => {
    const newP1 = Math.min(100, Math.max(0, val));
    setWeightP1(newP1);
    setWeightP2(100 - newP1);
  };

  const handleWeightP2Change = (val: number) => {
    const newP2 = Math.min(100, Math.max(0, val));
    setWeightP2(newP2);
    setWeightP1(100 - newP2);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    
    if (weightP1 + weightP2 !== 100) {
        alert("A soma dos pesos deve ser 100%");
        return;
    }

    const id = createExam(newTitle, newDesc, weightP1, weightP2);
    setIsCreating(false);
    setNewTitle('');
    setNewDesc('');
    // Reseta para o padrão sugerido pelo usuário
    setWeightP1(70);
    setWeightP2(30);
    navigate(`/teacher/exam/${id}`);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
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
          </div>
        </div>

        {/* Modal de Criação */}
        {isCreating && (
          <div className="mb-8 bg-white p-6 rounded-xl shadow-md border border-indigo-100 animate-fade-in">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Criar Nova Prova</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="col-span-full">
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
                <div className="col-span-full">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
                  <input 
                    type="text" 
                    value={newDesc}
                    onChange={e => setNewDesc(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="Breve descrição sobre o conteúdo..."
                  />
                </div>

                {/* Configuração de Pesos na Criação */}
                <div className="col-span-full bg-gray-50 p-4 rounded-lg border border-gray-200 mt-2">
                    <h3 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                      <Percent size={16} /> Distribuição de Pesos (Nota Final)
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Fase 1 (Certeza)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            min="0" max="100"
                            value={weightP1}
                            onChange={e => handleWeightP1Change(parseInt(e.target.value) || 0)}
                            className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-700"
                          />
                          <span className="absolute right-3 top-2 text-gray-400 font-bold">%</span>
                        </div>
                      </div>
                      <div className="text-gray-400 font-bold pt-6">+</div>
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">Fase 2 (TBL)</label>
                        <div className="relative">
                          <input 
                            type="number" 
                            min="0" max="100"
                            value={weightP2}
                            onChange={e => handleWeightP2Change(parseInt(e.target.value) || 0)}
                            className="w-full p-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 font-bold text-purple-700"
                          />
                          <span className="absolute right-3 top-2 text-gray-400 font-bold">%</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-2">
                      Total: <span className={clsx("font-bold", weightP1 + weightP2 === 100 ? "text-green-600" : "text-red-500")}>
                        {weightP1 + weightP2}%
                      </span>
                    </p>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
                >
                  Criar Prova
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
                  
                  {/* Pesos */}
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-3 bg-gray-100 p-2 rounded-lg">
                    <Percent size={12} />
                    <span>Pesos: F1 <strong>{exam.phase1Weight}%</strong> / F2 <strong>{exam.phase2Weight}%</strong></span>
                  </div>

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
                  <div className="grid grid-cols-2 gap-3">
                    <Link 
                      to={`/teacher/exam/${exam.id}`}
                      className="flex items-center justify-center gap-2 bg-white border border-indigo-200 text-indigo-700 py-2 rounded-lg font-medium hover:bg-indigo-50 transition-colors text-sm"
                    >
                      Editar <ArrowRight size={14} />
                    </Link>
                    <Link 
                      to={`/teacher/exam/${exam.id}/report`}
                      className="flex items-center justify-center gap-2 bg-indigo-50 border border-indigo-200 text-indigo-700 py-2 rounded-lg font-medium hover:bg-indigo-100 transition-colors text-sm"
                    >
                      <FileBarChart size={14} /> Relatório
                    </Link>
                  </div>

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
