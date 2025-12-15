import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Award, Calendar, FileText, X, Eye } from 'lucide-react';
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
                            title="Ver Detalhes das Notas"
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

      {/* Modal de Detalhes (Apenas Notas) */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="bg-indigo-600 p-6 text-white flex justify-between items-start shrink-0">
              <div>
                <h3 className="text-xl font-bold">Detalhamento de Notas</h3>
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
            
            <div className="p-0 overflow-y-auto bg-white">
               <table className="w-full text-left border-collapse">
                 <thead className="bg-gray-50 sticky top-0">
                   <tr className="text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                     <th className="p-4">Questão</th>
                     <th className="p-4 text-center text-indigo-700">Fase 1 (%)</th>
                     <th className="p-4 text-center text-purple-700">Fase 2 (%)</th>
                     <th className="p-4 text-right text-gray-900">Nota Final (0-10)</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-gray-100">
                   {selectedResult.questionDetails.map((qDetail, idx) => {
                     const exam = getExam(selectedResult.examId);
                     
                     // Cálculo do percentual final ponderado para esta questão
                     const p1W = exam?.phase1Weight || 50;
                     const p2W = exam?.phase2Weight || 50;
                     const finalPct = ((qDetail.phase1Score * p1W) + (qDetail.phase2Score * p2W)) / 100;
                     const finalGrade0to10 = (finalPct / 10).toFixed(1);

                     return (
                       <tr key={qDetail.questionId} className="hover:bg-gray-50">
                         <td className="p-4 font-medium text-gray-700">
                           Questão {idx + 1}
                         </td>
                         <td className="p-4 text-center text-gray-600">
                           {qDetail.phase1Score.toFixed(0)}%
                         </td>
                         <td className="p-4 text-center text-gray-600">
                           {qDetail.phase2Score.toFixed(0)}%
                         </td>
                         <td className="p-4 text-right font-bold text-gray-900">
                           {finalGrade0to10}
                         </td>
                       </tr>
                     );
                   })}
                 </tbody>
               </table>
            </div>
            
            <div className="p-4 border-t border-gray-100 flex justify-end shrink-0 bg-gray-50">
              <button
                onClick={handleCloseDetails}
                className="px-6 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition-colors shadow-sm"
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
