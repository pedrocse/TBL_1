import React, { useState, useEffect } from 'react';
import clsx from 'clsx';
import { FileText, ArrowLeft, CheckCircle2, ArrowRight, Trophy, Lock, RefreshCw, ShieldCheck, Percent } from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ExamPhaseWeights } from '../components/ExamPhaseWeights';
import { ExamPhaseTBL } from '../components/ExamPhaseTBL';

type ExamPhase = 'WEIGHTS' | 'WEIGHTS_RESULT' | 'TBL' | 'TBL_RESULT';

export const StudentExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { getExam, refreshExams } = useExam();
  
  const exam = getExam(examId || '');
  const [phase, setPhase] = useState<ExamPhase>('WEIGHTS');
  
  // State Fase 1
  const [weightAnswers, setWeightAnswers] = useState<Record<string, Record<string, number>>>({});
  
  // State Fase 2
  const [tblScores, setTblScores] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!exam) {
      refreshExams();
    }
  }, [examId]);

  useEffect(() => {
      const timer = setTimeout(() => {
         if (!getExam(examId || '')) {
             navigate('/student');
         }
      }, 1000);
      return () => clearTimeout(timer);
  }, [examId, getExam, navigate]);

  if (!exam) return (
      <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
  );

  const questions = exam.questions;

  // --- Handlers ---
  const handleWeightChange = (qId: string, vals: Record<string, number>) => {
    setWeightAnswers(prev => ({ ...prev, [qId]: vals }));
  };

  const submitWeights = () => {
    setPhase('WEIGHTS_RESULT');
    window.scrollTo(0, 0);
  };

  const submitTBL = (scores: Record<string, number>) => {
    setTblScores(scores);
    setPhase('TBL_RESULT');
    window.scrollTo(0, 0);
  };

  // --- Cálculos de Resultado ---
  const calculateWeightResults = () => {
    let totalPercentageSum = 0;
    const results = questions.map(q => {
      const userDistribution = weightAnswers[q.id] || {};
      const pointsOnCorrect = userDistribution[q.correctAlternativeId] || 0;
      const percentage = (pointsOnCorrect / q.totalPoints) * 100;
      totalPercentageSum += percentage;
      return { question: q, pointsOnCorrect, percentage, userDistribution };
    });
    return { results, averageScore: totalPercentageSum / questions.length };
  };

  const calculateTBLResults = () => {
    let totalScore = 0;
    let maxPossible = 0;
    questions.forEach(q => {
        totalScore += tblScores[q.id] || 0;
        maxPossible += q.totalPoints;
    });
    const percentage = (totalScore / maxPossible) * 100;
    return { totalScore, maxPossible, percentage };
  };

  // --- Renderização Condicional ---

  if (questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md bg-white p-8 rounded-xl shadow-sm border">
          <FileText size={48} className="mx-auto text-gray-300 mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Prova Vazia</h2>
          <Link to="/student" className="text-indigo-600 font-medium hover:underline">Voltar</Link>
        </div>
      </div>
    );
  }

  // RESULTADO FINAL (COMPARATIVO)
  if (phase === 'TBL_RESULT') {
    const weightRes = calculateWeightResults();
    const tblRes = calculateTBLResults();

    // Cálculo Ponderado Final
    const p1Score = weightRes.averageScore;
    const p2Score = tblRes.percentage;
    const p1Weight = exam.phase1Weight;
    const p2Weight = exam.phase2Weight;
    
    const finalGrade = ((p1Score * p1Weight) + (p2Score * p2Weight)) / 100;

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Parabéns! Você concluiu a prova.</h1>
            <p className="text-gray-600">Confira seu desempenho detalhado abaixo.</p>
          </div>

          {/* Placar Principal */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Nota Final Ponderada</h2>
              <div className="text-6xl font-extrabold tracking-tight mb-2">
                {finalGrade.toFixed(1)}%
              </div>
              <p className="text-indigo-100 text-sm">
                Cálculo: (Fase 1 × {p1Weight}%) + (Fase 2 × {p2Weight}%)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {/* Card Fase 1 */}
              <div className="p-8 flex flex-col items-center text-center">
                <div className="bg-indigo-50 p-3 rounded-full text-indigo-600 mb-4">
                  <FileText size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Fase 1: Certeza</h3>
                <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide font-bold">Peso: {p1Weight}%</p>
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  {p1Score.toFixed(0)}%
                </div>
                <span className="text-sm text-gray-500">Aproveitamento</span>
              </div>

              {/* Card Fase 2 */}
              <div className="p-8 flex flex-col items-center text-center">
                <div className="bg-purple-50 p-3 rounded-full text-purple-600 mb-4">
                  <Trophy size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Fase 2: TBL</h3>
                <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide font-bold">Peso: {p2Weight}%</p>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {p2Score.toFixed(0)}%
                </div>
                <span className="text-sm text-gray-500">Aproveitamento</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center pt-8">
            <Link 
              to="/student" 
              className="flex items-center gap-2 px-8 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-900 transition-colors font-medium"
            >
              <ArrowLeft size={18} /> Voltar para Lista de Provas
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // RESULTADO PARCIAL FASE 1
  if (phase === 'WEIGHTS_RESULT') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white p-12 rounded-xl shadow-lg text-center border-t-4 border-indigo-600">
            <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Fase 1 Finalizada!</h2>
            <p className="text-gray-600 text-lg mb-8">
              Suas respostas foram salvas.
            </p>
            
            <div className="bg-indigo-50 text-indigo-800 p-6 rounded-xl border border-indigo-100 inline-block max-w-lg">
                <p className="font-medium flex items-center justify-center gap-2">
                  <Lock size={18} />
                  Resultados Ocultos
                </p>
                <p className="text-sm mt-2 opacity-90">
                  Aguarde a liberação para prosseguir para a Fase 2.
                </p>
            </div>
          </div>

          {/* BLOQUEIO DA FASE 2 */}
          <div className="mt-8">
            {exam.isPhase2Released ? (
              <button 
                onClick={() => { setPhase('TBL'); window.scrollTo(0, 0); }}
                className="w-full flex items-center justify-center gap-2 py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-lg transition-colors shadow-lg animate-bounce-subtle"
              >
                <span>Iniciar Fase 2 (TBL)</span>
                <ArrowRight size={24} />
              </button>
            ) : (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-8 text-center shadow-sm">
                <div className="bg-amber-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-amber-600">
                  <Lock size={32} />
                </div>
                <h3 className="text-xl font-bold text-amber-800 mb-2">Aguardando Liberação do Professor</h3>
                <p className="text-amber-700 mb-6 max-w-md mx-auto">
                  A Fase 2 (Feedback Imediato) ainda não foi liberada.
                </p>
                <button 
                  onClick={refreshExams}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-amber-300 text-amber-700 rounded-lg hover:bg-amber-50 transition-colors font-medium shadow-sm"
                >
                  <RefreshCw size={20} /> Verificar se já foi liberado
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // RENDERIZAÇÃO DO EXAME
  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
           <Link to="/student" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors">
            <ArrowLeft size={18} /> Sair
          </Link>
          <div className="text-sm font-medium text-gray-500 flex items-center gap-2">
            {phase === 'WEIGHTS' ? (
              <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded">Fase 1 (Peso: {exam.phase1Weight}%)</span>
            ) : (
              <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">Fase 2 (Peso: {exam.phase2Weight}%)</span>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 shadow-sm mb-6 overflow-hidden">
          <div className={clsx("h-3 w-full", phase === 'WEIGHTS' ? "bg-indigo-600" : "bg-purple-600")}></div>
          <div className="p-6 sm:p-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{exam.title}</h1>
            <p className="text-gray-600">{exam.description}</p>
          </div>
        </div>

        {phase === 'WEIGHTS' ? (
          <ExamPhaseWeights 
            questions={questions}
            answers={weightAnswers}
            onAnswerChange={handleWeightChange}
            onSubmit={submitWeights}
          />
        ) : (
          <ExamPhaseTBL 
            questions={questions}
            onSubmit={submitTBL}
          />
        )}
      </div>
    </div>
  );
};
