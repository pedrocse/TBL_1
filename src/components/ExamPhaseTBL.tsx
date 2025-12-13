import React, { useState, useEffect } from 'react';
import { Question } from '../types';
import { TBLQuestionCard } from './TBLQuestionCard';
import { Send, Trophy, ArrowRight } from 'lucide-react';
import { clsx } from 'clsx';

interface ExamPhaseTBLProps {
  questions: Question[];
  onSubmit: (scores: Record<string, number>) => void;
}

export const ExamPhaseTBL: React.FC<ExamPhaseTBLProps> = ({ questions, onSubmit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  
  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const isCurrentSolved = scores[currentQuestion.id] !== undefined;
  const isComplete = Object.keys(scores).length === questions.length;

  const handleScoreUpdate = (qId: string, score: number) => {
    setScores(prev => ({ ...prev, [qId]: score }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div className="animate-fade-in max-w-3xl mx-auto">
      {/* Header da Fase */}
      <div className="bg-purple-50 border border-purple-100 rounded-lg p-4 mb-6 flex items-start gap-3">
        <div className="bg-purple-100 p-2 rounded-full text-purple-600 mt-1">
          <span className="font-bold text-sm">2ª</span>
        </div>
        <div>
          <h3 className="font-bold text-purple-900">Fase 2: Feedback Imediato (TBL)</h3>
          <p className="text-sm text-purple-700">
            Encontre a resposta correta para avançar. A pontuação diminui a cada erro.
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
            className="bg-purple-600 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      {/* Cartão da Questão Atual */}
      <div className="min-h-[400px]">
        <TBLQuestionCard
          key={currentQuestion.id}
          question={currentQuestion}
          onScoreUpdate={handleScoreUpdate}
        />
      </div>

      {/* Barra de Navegação */}
      <div className="flex justify-end mt-8 mb-12 pt-6 border-t border-gray-100">
        {isLastQuestion ? (
          <button
            onClick={() => onSubmit(scores)}
            disabled={!isComplete}
            className={clsx(
              "flex items-center gap-2 px-8 py-3 rounded-lg font-medium text-white shadow-sm transition-all",
              isComplete
                ? "bg-purple-600 hover:bg-purple-700 hover:shadow-md transform hover:-translate-y-0.5" 
                : "bg-gray-400 cursor-not-allowed opacity-70"
            )}
          >
            <span>Finalizar Prova Completa</span>
            <Trophy size={18} />
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!isCurrentSolved}
            className={clsx(
              "flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-white shadow-sm transition-all",
              isCurrentSolved 
                ? "bg-purple-600 hover:bg-purple-700 hover:shadow-md transform hover:-translate-y-0.5" 
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
