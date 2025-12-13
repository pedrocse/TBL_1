import React, { useState } from 'react';
import { Question } from '../types';
import { QuestionCard } from './QuestionCard';
import { Send, ArrowRight, ArrowLeft } from 'lucide-react';
import { clsx } from 'clsx';

interface ExamPhaseWeightsProps {
  questions: Question[];
  answers: Record<string, Record<string, number>>;
  onAnswerChange: (questionId: string, newValues: Record<string, number>) => void;
  onSubmit: () => void;
}

export const ExamPhaseWeights: React.FC<ExamPhaseWeightsProps> = ({
  questions,
  answers,
  onAnswerChange,
  onSubmit
}) => {
  // Estado para controlar qual questão está visível
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Estado local para controlar quais questões foram confirmadas
  const [confirmedQuestions, setConfirmedQuestions] = useState<Set<string>>(new Set());

  const currentQuestion = questions[currentIndex];
  const isCurrentConfirmed = confirmedQuestions.has(currentQuestion.id);
  const isLastQuestion = currentIndex === questions.length - 1;
  const allConfirmed = questions.every(q => confirmedQuestions.has(q.id));

  const handleConfirmQuestion = (qId: string) => {
    setConfirmedQuestions(prev => new Set(prev).add(qId));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header da Fase */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-4 mb-6 flex items-start gap-3">
        <div className="bg-indigo-100 p-2 rounded-full text-indigo-600 mt-1">
          <span className="font-bold text-sm">1ª</span>
        </div>
        <div>
          <h3 className="font-bold text-indigo-900">Fase 1: Distribuição de Pesos</h3>
          <p className="text-sm text-indigo-700">
            Distribua os pontos e clique em <strong>Confirmar Resposta</strong> para avançar.
          </p>
        </div>
      </div>

      {/* Barra de Progresso */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2 font-medium">
          <span>Questão {currentIndex + 1} de {questions.length}</span>
          <span>{Math.round(((currentIndex + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Cartão da Questão Atual */}
      <div className="min-h-[400px]">
        <QuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          values={answers[currentQuestion.id] || {}}
          onChange={(vals) => onAnswerChange(currentQuestion.id, vals)}
          isConfirmed={isCurrentConfirmed}
          onConfirm={() => handleConfirmQuestion(currentQuestion.id)}
        />
      </div>

      {/* Barra de Navegação */}
      <div className="flex items-center justify-between mt-8 mb-12 pt-6 border-t border-gray-100">
        <button
          onClick={handlePrevious}
          disabled={currentIndex === 0}
          className={clsx(
            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors",
            currentIndex === 0 
              ? "text-gray-300 cursor-not-allowed" 
              : "text-gray-600 hover:bg-gray-100 hover:text-indigo-600"
          )}
        >
          <ArrowLeft size={18} />
          Anterior
        </button>

        {isLastQuestion ? (
          <button
            onClick={onSubmit}
            disabled={!allConfirmed}
            className={clsx(
              "flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-white shadow-sm transition-all",
              allConfirmed 
                ? "bg-green-600 hover:bg-green-700 hover:shadow-md transform hover:-translate-y-0.5" 
                : "bg-gray-400 cursor-not-allowed opacity-70"
            )}
          >
            <span>Finalizar Fase 1</span>
            <Send size={18} />
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!isCurrentConfirmed}
            className={clsx(
              "flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white shadow-sm transition-all",
              isCurrentConfirmed 
                ? "bg-indigo-600 hover:bg-indigo-700 hover:shadow-md transform hover:-translate-y-0.5" 
                : "bg-gray-300 cursor-not-allowed"
            )}
          >
            <span>Próxima Questão</span>
            <ArrowRight size={18} />
          </button>
        )}
      </div>
    </div>
  );
};
