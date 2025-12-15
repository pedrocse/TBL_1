import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FileText, ArrowRight, LogOut, User, Lock, X, Award, RotateCcw } from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import { useGrade } from '../context/GradeContext';
import { clsx } from 'clsx';

export const StudentDashboard = () => {
  const { exams } = useExam();
  const { user, logout } = useAuth();
  const { hasStudentTakenExam } = useGrade();
  const navigate = useNavigate();

  // State para o Modal de Senha
  const [selectedExamId, setSelectedExamId] = useState<string | null>(null);
  const [accessCodeInput, setAccessCodeInput] = useState('');
  const [error, setError] = useState('');

  // Filtra apenas as provas que estão PUBLICADAS
  const availableExams = exams.filter(exam => exam.isPublished);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Abre o modal
  const handleStartClick = (examId: string) => {
    setSelectedExamId(examId);
    setAccessCodeInput('');
    setError('');
  };

  // Valida a senha
  const handleAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const exam = exams.find(e => e.id === selectedExamId);
    
    if (!exam) return;

    // Compara a senha digitada com a senha da prova (case insensitive)
    if (exam.accessCode && accessCodeInput.toUpperCase() === exam.accessCode.toUpperCase()) {
      navigate(`/student/exam/${exam.id}`);
    } else {
      setError('Senha incorreta. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Área do Aluno</h1>
            <div className="flex items-center gap-2 text-gray-500 text-sm mt-1">
              <User size={16} />
              <span>Bem-vindo, <strong>{user?.name}</strong></span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Link 
              to="/student/grades"
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              <Award size={18} />
              Minhas Notas
            </Link>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors border border-gray-200"
            >
              <LogOut size={18} />
              Sair
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableExams.length === 0 ? (
            <div className="col-span-full text-center py-12 bg-white rounded-xl border border-dashed border-gray-300">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">Não há provas disponíveis no momento.</p>
              <p className="text-sm text-gray-400 mt-1">Aguarde o professor liberar a avaliação.</p>
            </div>
          ) : (
            availableExams.map(exam => {
              const taken = user ? hasStudentTakenExam(user.id, exam.id) : false;
              
              return (
                <div key={exam.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full hover:shadow-md transition-all">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{exam.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{exam.description || 'Sem descrição.'}</p>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500 mb-6">
                      <span className="bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-medium">
                        {exam.questions.length} Questões
                      </span>
                      {taken ? (
                        <span className="flex items-center gap-1 text-green-600 font-bold">
                          <Award size={12} /> Concluída
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Lock size={12} /> Senha Necessária
                        </span>
                      )}
                    </div>
                  </div>

                  {taken ? (
                    <div className="flex gap-2">
                      <Link 
                        to="/student/grades"
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium bg-green-100 text-green-700 hover:bg-green-200 transition-colors text-sm"
                      >
                        Ver Nota
                      </Link>
                      <button 
                        onClick={() => handleStartClick(exam.id)}
                        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors text-sm"
                        title="Refazer a prova"
                      >
                        <RotateCcw size={16} /> Refazer
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={() => handleStartClick(exam.id)}
                      disabled={exam.questions.length === 0}
                      className={clsx(
                        "w-full flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-colors",
                        exam.questions.length > 0 
                          ? "bg-indigo-600 text-white hover:bg-indigo-700" 
                          : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      )}
                    >
                      {exam.questions.length > 0 ? (
                        <>Iniciar Prova <ArrowRight size={16} /></>
                      ) : (
                        'Sem Questões'
                      )}
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal de Senha */}
      {selectedExamId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">Acesso Restrito</h3>
                <p className="text-indigo-100 text-sm mt-1">Esta prova requer uma senha.</p>
              </div>
              <button 
                onClick={() => setSelectedExamId(null)}
                className="text-indigo-200 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleAccessSubmit} className="p-6">
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Digite a senha fornecida pelo professor:
                </label>
                <input
                  type="text"
                  value={accessCodeInput}
                  onChange={(e) => {
                    setAccessCodeInput(e.target.value.toUpperCase());
                    setError('');
                  }}
                  className="w-full p-4 text-center text-2xl font-mono tracking-widest border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 outline-none uppercase"
                  placeholder="ABCD"
                  maxLength={4}
                  autoFocus
                />
                {error && (
                  <p className="mt-2 text-sm text-red-600 font-medium flex items-center gap-1 justify-center">
                    {error}
                  </p>
                )}
              </div>
              
              <button
                type="submit"
                className="w-full py-3 bg-indigo-600 text-white rounded-lg font-bold text-lg hover:bg-indigo-700 transition-colors"
              >
                Acessar Prova
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
