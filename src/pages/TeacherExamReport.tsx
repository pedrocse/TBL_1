import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileSpreadsheet, Download } from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { useGrade } from '../context/GradeContext';

export const TeacherExamReport = () => {
  const { examId } = useParams();
  const { getExam } = useExam();
  const { getExamResults } = useGrade();

  const exam = getExam(examId || '');
  
  if (!exam) return (
      <div className="p-8 text-center">Prova não encontrada.</div>
  );

  const results = getExamResults(exam.id);
  
  // Ordenar por nome do aluno
  const sortedResults = [...results].sort((a, b) => a.studentName.localeCompare(b.studentName));

  const handleExportCSV = () => {
    if (sortedResults.length === 0) return;

    // Cabeçalho do CSV
    const headers = [
      'Aluno',
      'Data',
      ...exam.questions.map((_, i) => `Q${i + 1} (%)`),
      'Fase 1 (0-10)',
      'Fase 2 (0-10)',
      'Total (0-10)'
    ];

    // Linhas de dados
    const rows = sortedResults.map(r => {
      // Notas das questões individuais (mantendo em % para análise de acerto)
      const qScores = exam.questions.map(q => {
        const qResult = r.questionDetails.find(d => d.questionId === q.id);
        if (!qResult) return '0%';
        const qFinal = ((qResult.phase1Score * exam.phase1Weight) + (qResult.phase2Score * exam.phase2Weight)) / 100;
        return qFinal.toFixed(0) + '%';
      });

      return [
        `"${r.studentName}"`, // Aspas para evitar quebra com nomes compostos
        new Date(r.submittedAt).toLocaleDateString(),
        ...qScores,
        (r.phase1TotalScore / 10).toFixed(2).replace('.', ','), // Converte para 0-10
        (r.phase2TotalScore / 10).toFixed(2).replace('.', ','), // Converte para 0-10
        (r.finalScore / 10).toFixed(2).replace('.', ',')       // Converte para 0-10
      ];
    });

    // Monta o conteúdo com separador de ponto e vírgula (padrão Excel PT-BR)
    const csvContent = [
      headers.join(';'),
      ...rows.map(r => r.join(';'))
    ].join('\n');

    // Cria o Blob e dispara o download
    // \ufeff é o BOM para garantir que o Excel abra com a codificação correta (UTF-8)
    const blob = new Blob(["\ufeff" + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${exam.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_relatorio.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
               <Link to="/teacher" className="text-gray-400 hover:text-gray-600">
                 <ArrowLeft size={20} />
               </Link>
               <h1 className="text-2xl font-bold text-gray-900">Relatório de Desempenho</h1>
            </div>
            <p className="text-gray-500 text-sm ml-7">
              Prova: <span className="font-semibold text-gray-700">{exam.title}</span>
            </p>
          </div>
          
          <div className="flex gap-2 items-center">
             <div className="text-sm text-right mr-4 hidden md:block">
                <p className="text-gray-500">Peso Fase 1: <strong>{exam.phase1Weight}%</strong></p>
                <p className="text-gray-500">Peso Fase 2: <strong>{exam.phase2Weight}%</strong></p>
             </div>
             
             <button 
               onClick={handleExportCSV}
               disabled={sortedResults.length === 0}
               className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors border ${
                 sortedResults.length === 0 
                   ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                   : 'bg-white text-green-700 border-green-200 hover:bg-green-50 shadow-sm'
               }`}
             >
               <Download size={18} /> Exportar CSV
             </button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {sortedResults.length === 0 ? (
            <div className="p-12 text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <FileSpreadsheet size={32} />
              </div>
              <h3 className="text-lg font-medium text-gray-900">Nenhum resultado ainda</h3>
              <p className="text-gray-500 mt-1">Nenhum aluno finalizou esta prova.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="bg-gray-100 text-gray-700 text-xs uppercase tracking-wider border-b border-gray-200">
                    <th className="p-4 font-bold sticky left-0 bg-gray-100 z-10 shadow-sm">Aluno</th>
                    <th className="p-4 font-bold border-r border-gray-200">Data</th>
                    
                    {/* Colunas Dinâmicas para Questões */}
                    {exam.questions.map((q, idx) => (
                      <th key={q.id} className="p-2 text-center font-medium text-gray-500 w-16 border-r border-gray-200" title={q.title}>
                        Q{idx + 1}
                      </th>
                    ))}

                    <th className="p-4 font-bold text-center bg-indigo-50 text-indigo-800">Fase 1 (0-10)</th>
                    <th className="p-4 font-bold text-center bg-purple-50 text-purple-800">Fase 2 (0-10)</th>
                    <th className="p-4 font-bold text-right bg-gray-200 text-gray-900 sticky right-0 z-10 shadow-sm">Total (0-10)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {sortedResults.map((result) => (
                    <tr key={result.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-medium text-gray-900 sticky left-0 bg-white hover:bg-gray-50 z-10 shadow-sm">
                        {result.studentName}
                      </td>
                      <td className="p-4 text-gray-500 border-r border-gray-200">
                        {new Date(result.submittedAt).toLocaleDateString()}
                      </td>

                      {/* Notas por Questão (Mantido em % para indicar aproveitamento) */}
                      {exam.questions.map((q) => {
                        const qResult = result.questionDetails.find(d => d.questionId === q.id);
                        if (!qResult) return <td key={q.id} className="p-2 text-center text-gray-300">-</td>;
                        
                        const qFinal = ((qResult.phase1Score * exam.phase1Weight) + (qResult.phase2Score * exam.phase2Weight)) / 100;
                        
                        return (
                          <td key={q.id} className="p-2 text-center border-r border-gray-200">
                            <span className={qFinal >= 70 ? "text-green-600 font-medium" : "text-gray-600"}>
                              {qFinal.toFixed(0)}%
                            </span>
                          </td>
                        );
                      })}

                      <td className="p-4 text-center bg-indigo-50/30 text-indigo-700 font-medium">
                        {(result.phase1TotalScore / 10).toFixed(1)}
                      </td>
                      <td className="p-4 text-center bg-purple-50/30 text-purple-700 font-medium">
                        {(result.phase2TotalScore / 10).toFixed(1)}
                      </td>
                      <td className="p-4 text-right font-bold text-gray-900 bg-gray-50 sticky right-0 z-10 shadow-sm">
                        {(result.finalScore / 10).toFixed(1)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
