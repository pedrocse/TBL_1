import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Calendar, FileText, X, Eye, CheckCircle2, XCircle, Image as ImageIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useGrade } from '../context/GradeContext';
import { useExam } from '../context/ExamContext';
import { clsx } from 'clsx';
import { ExamResult } from '../types';

export const StudentGrades = () => {
  const { user } = useAuth();
  const { getStudentResults } = useGrade();
  const { getExam } = useExam();
  
  // Estado para controlar qual prova está sendo detalhada
  const [selectedResult, setSelectedResult] = useState<ExamResult | null>(null);

  if (!user) return null;

  const myGrades = getStudentResults(user.id);

  const handleOpenDetails = (result: ExamResult) => {
    setSelectedResult(result);
  };

  const handleCloseDetails = () => {
    setSelectedResult(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Award className="text-indigo-600" /> Minhas Notas
            </h1>
            <p className="text-gray-500 text-sm mt-1">Histórico de avaliações realizadas</p>
          </div>
          <Link 
            to="/student"
            className="flex items-center gap-2 text-gray-600 hover:text-indigo-600 transition-colors font-medium"
          >
            <ArrowLeft size={18} /> Voltar para Provas
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {myGrades.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <FileText size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Nenhuma nota encontrada</h3>
              <p className="text-gray-500 mt-1">Você ainda não completou nenhuma prova.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                    <th className="p-4 font-medium">Prova</th>
                    <th className="p-4 font-medium">Data</th>
                    <th className="p-4 font-medium text-center">Fase 1 (0-10)</th>
                    <th className="p-4 font-medium text-center">Fase 2 (0-10)</th>
                    <th className="p-4 font-medium text-right">Nota Final (0-10)</th>
                    <th className="p-4 font-medium text-center">Detalhes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {myGrades.map((grade) => {
                    const exam = getExam(grade.examId);
                    return (
                      <tr key={grade.id} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4">
                          <div className="font-medium text-gray-900">
                            {exam ? exam.title : 'Prova Removida'}
                          </div>
                          {exam && <div className="text-xs text-gray-500">{exam.description}</div>}
                        </td>
                        <td className="p-4 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Calendar size={14} />
                            {new Date(grade.submittedAt).toLocaleDateString()}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(grade.submittedAt).toLocaleTimeString()}
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-block bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md text-sm font-medium">
                            {(grade.phase1TotalScore / 10).toFixed(1)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <span className="inline-block bg-purple-50 text-purple-700 px-2 py-1 rounded-md text-sm font-medium">
                            {(grade.phase2TotalScore / 10).toFixed(1)}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <span className={clsx(
                            "inline-block px-3 py-1 rounded-full text-sm font-bold",
                            grade.finalScore >= 70 ? "bg-green-100 text-green-700" :
                            grade.finalScore >= 50 ? "bg-yellow-100 text-yellow-700" :
                            "bg-red-100 text-red-700"
                          )}>
                            {(grade.finalScore / 10).toFixed(1)}
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <button 
                            onClick={() => handleOpenDetails(grade)}
                            className="text-gray-400 hover:text-indigo-600 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                            title="Ver Gabarito e Detalhes"
                          >
                            <Eye size={20} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Detalhes (Gabarito) */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-start shrink-0">
              <div>
                <h3 className="text-xl font-bold">Gabarito e Desempenho</h3>
                <p className="text-indigo-100 text-sm mt-1">
                  {getExam(selectedResult.examId)?.title || 'Prova'}
                </p>
              </div>
              <button 
                onClick={handleCloseDetails}
                className="text-indigo-200 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto bg-gray-50">
               <div className="space-y-6">
                 {selectedResult.questionDetails.map((qDetail, idx) => {
                   const exam = getExam(selectedResult.examId);
                   const question = exam?.questions.find(q => q.id === qDetail.questionId);
                   
                   // Cálculo do percentual final ponderado para esta questão
                   const p1W = exam?.phase1Weight || 50;
                   const p2W = exam?.phase2Weight || 50;
                   const finalPct = ((qDetail.phase1Score * p1W) + (qDetail.phase2Score * p2W)) / 100;

                   if (!question) return null;

                   return (
                     <div key={qDetail.questionId} className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                       {/* Header da Questão */}
                       <div className="bg-gray-50 p-4 border-b border-gray-100 flex justify-between items-center">
                          <span className="font-bold text-gray-700">Questão {idx + 1}</span>
                          <div className="flex gap-3 text-xs font-medium">
                            <span className="text-indigo-600 bg-indigo-50 px-2 py-1 rounded">Fase 1: {qDetail.phase1Score.toFixed(0)}%</span>
                            <span className="text-purple-600 bg-purple-50 px-2 py-1 rounded">Fase 2: {qDetail.phase2Score.toFixed(0)}%</span>
                            <span className={clsx(
                                "px-2 py-1 rounded",
                                finalPct >= 70 ? "text-green-700 bg-green-50" : "text-orange-700 bg-orange-50"
                            )}>
                                Final: {finalPct.toFixed(0)}%
                            </span>
                          </div>
                       </div>

                       <div className="p-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-2">{question.title}</h4>
                          {question.description && <p className="text-gray-600 text-sm mb-4">{question.description}</p>}
                          
                          {question.imageUrl && (
                            <div className="mb-4 rounded-lg overflow-hidden border border-gray-100 bg-gray-50 max-w-md mx-auto">
                                <img 
                                src={question.imageUrl} 
                                alt="Imagem da questão"
                                className="w-full h-auto object-contain"
                                />
                            </div>
                          )}

                          <div className="space-y-2 mt-4">
                            {question.alternatives.map((alt) => {
                                const isCorrect = alt.id === question.correctAlternativeId;
                                return (
                                    <div key={alt.id} className={clsx(
                                        "p-3 rounded-lg border flex items-center justify-between",
                                        isCorrect 
                                            ? "bg-green-50 border-green-200 text-green-900" 
                                            : "bg-white border-gray-100 text-gray-500"
                                    )}>
                                        <span className="text-sm font-medium">{alt.text}</span>
                                        {isCorrect && (
                                            <span className="flex items-center gap-1 text-xs font-bold text-green-600 bg-white px-2 py-1 rounded-full shadow-sm">
                                                <CheckCircle2 size={14} /> Resposta Correta
                                            </span>
                                        )}
                                    </div>
                                );
                            })}
                          </div>
                       </div>
                     </div>
                   );
                 })}
               </div>
            </div>
            
            <div className="p-4 border-t border-gray-100 flex justify-end shrink-0 bg-white">
              <button
                onClick={handleCloseDetails}
                className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg font-medium transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
