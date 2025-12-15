import React, { useState, useEffect, useMemo } from 'react';
import clsx from 'clsx';
import { FileText, ArrowLeft, ArrowRight, Trophy, Lock, RefreshCw, ShieldCheck } from 'lucide-react';
import { useExam } from '../context/ExamContext';
import { useAuth } from '../context/AuthContext';
import { useGrade } from '../context/GradeContext';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { ExamPhaseWeights } from '../components/ExamPhaseWeights';
import { ExamPhaseTBL } from '../components/ExamPhaseTBL';
import { QuestionResult } from '../types';

type ExamPhase = 'WEIGHTS' | 'WEIGHTS_RESULT' | 'TBL' | 'TBL_RESULT';

export const StudentExam = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { getExam, refreshExams } = useExam();
  const { user } = useAuth();
  const { saveResult, hasStudentTakenExam } = useGrade();
  
  const exam = getExam(examId || '');
  const [phase, setPhase] = useState<ExamPhase>('WEIGHTS');
  
  // State Fase 1
  const [weightAnswers, setWeightAnswers] = useState<Record<string, Record<string, number>>>({});
  
  // State Fase 2
  const [tblScores, setTblScores] = useState<Record<string, number>>({});
  
  // Controle de salvamento para evitar loops
  const [isSaved, setIsSaved] = useState(false);

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

  // Verifica se o aluno já fez a prova
  useEffect(() => {
    if (user && examId && hasStudentTakenExam(user.id, examId) && !isSaved) {
       // Lógica opcional de redirecionamento se já fez
    }
  }, [user, examId, hasStudentTakenExam, isSaved]);

  // --- Cálculos de Resultado (Memoized) ---
  const results = useMemo(() => {
    if (!exam || exam.questions.length === 0) return null;

    let totalPercentageSumP1 = 0;
    let totalScoreP2 = 0;
    let maxPossibleP2 = 0;
    const questionDetails: QuestionResult[] = [];

    exam.questions.forEach(q => {
      // Fase 1 Calc
      const userDistribution = weightAnswers[q.id] || {};
      const pointsOnCorrect = userDistribution[q.correctAlternativeId] || 0;
      const percentageP1 = (pointsOnCorrect / q.totalPoints) * 100;
      totalPercentageSumP1 += percentageP1;

      // Fase 2 Calc
      const scoreP2 = tblScores[q.id] || 0;
      totalScoreP2 += scoreP2;
      maxPossibleP2 += q.totalPoints;

      questionDetails.push({
        questionId: q.id,
        phase1Score: percentageP1,
        phase2Score: (scoreP2 / q.totalPoints) * 100,
        maxPoints: q.totalPoints
      });
    });

    const p1Score = totalPercentageSumP1 / exam.questions.length;
    const p2Score = maxPossibleP2 > 0 ? (totalScoreP2 / maxPossibleP2) * 100 : 0;
    
    const p1Weight = exam.phase1Weight;
    const p2Weight = exam.phase2Weight;
    const finalGrade = ((p1Score * p1Weight) + (p2Score * p2Weight)) / 100;

    return { p1Score, p2Score, finalGrade, questionDetails };
  }, [exam, weightAnswers, tblScores]);

  // --- Efeito para Salvar Resultado ---
  useEffect(() => {
    if (phase === 'TBL_RESULT' && !isSaved && results && user && exam) {
      saveResult({
        examId: exam.id,
        studentId: user.id,
        studentName: user.name,
        phase1TotalScore: results.p1Score,
        phase2TotalScore: results.p2Score,
        finalScore: results.finalGrade,
        questionDetails: results.questionDetails
      });
      setIsSaved(true);
    }
  }, [phase, isSaved, results, user, exam, saveResult]);

  if (!exam || !user) return (
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
    const { p1Score, p2Score, finalGrade } = results || { p1Score: 0, p2Score: 0, finalGrade: 0 };

    const displayP1 = p1Score;
    const displayP2 = p2Score;
    const displayFinal = finalGrade;

    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Parabéns! Você concluiu a prova.</h1>
            <p className="text-gray-600">Sua nota foi registrada com sucesso.</p>
          </div>

          {/* Placar Principal */}
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-8 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Nota Final Ponderada</h2>
              <div className="text-6xl font-extrabold tracking-tight mb-2">
                {(displayFinal / 10).toFixed(1)} <span className="text-2xl font-medium opacity-70">/ 10</span>
              </div>
              <p className="text-indigo-100 text-sm">
                Cálculo: (Fase 1 × {exam.phase1Weight}%) + (Fase 2 × {exam.phase2Weight}%)
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-gray-100">
              {/* Card Fase 1 */}
              <div className="p-8 flex flex-col items-center text-center">
                <div className="bg-indigo-50 p-3 rounded-full text-indigo-600 mb-4">
                  <FileText size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Fase 1: Certeza</h3>
                <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide font-bold">Peso: {exam.phase1Weight}%</p>
                <div className="text-4xl font-bold text-indigo-600 mb-2">
                  {(displayP1 / 10).toFixed(1)}
                </div>
                <span className="text-sm text-gray-500">Nota (0-10)</span>
              </div>

              {/* Card Fase 2 */}
              <div className="p-8 flex flex-col items-center text-center">
                <div className="bg-purple-50 p-3 rounded-full text-purple-600 mb-4">
                  <Trophy size={24} />
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">Fase 2: TBL</h3>
                <p className="text-xs text-gray-500 mb-4 uppercase tracking-wide font-bold">Peso: {exam.phase2Weight}%</p>
                <div className="text-4xl font-bold text-purple-600 mb-2">
                  {(displayP2 / 10).toFixed(1)}
                </div>
                <span className="text-sm text-gray-500">Nota (0-10)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-4 pt-8">
            <Link 
              to="/student" 
              className="flex items-center gap-2 px-6 py-3 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition-colors font-medium"
            >
              <ArrowLeft size={18} /> Voltar ao Início
            </Link>
            <Link 
              to="/student/grades" 
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors font-medium shadow-md"
            >
               Ver Minhas Notas <ArrowRight size={18} />
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
