import React, { useState } from 'react';
import { Question } from '../types';
import { CheckCircle2, XCircle, AlertCircle, Send, MousePointerClick } from 'lucide-react';
import { clsx } from 'clsx';

interface TBLQuestionCardProps {
  question: Question;
  onScoreUpdate: (questionId: string, score: number, attempts: number) => void;
}

export const TBLQuestionCard: React.FC<TBLQuestionCardProps> = ({ question, onScoreUpdate }) => {
  const [attempts, setAttempts] = useState<string[]>([]); // IDs das alternativas erradas tentadas
  const [isSolved, setIsSolved] = useState(false);
  const [score, setScore] = useState<number | null>(null);
  
  // Novo estado: Alternativa selecionada mas ainda não enviada
  const [selectedAltId, setSelectedAltId] = useState<string | null>(null);

  const handleSelect = (altId: string) => {
    if (isSolved || attempts.includes(altId)) return;
    setSelectedAltId(altId);
  };

  const handleConfirm = () => {
    if (!selectedAltId) return;
    const altId = selectedAltId;

    if (altId === question.correctAlternativeId) {
      // Acertou!
      const errors = attempts.length;
      let finalScore = 0;

      // Lógica de Pontuação TBL
      if (question.totalPoints === 4) {
        if (errors === 0) finalScore = 4;
        else if (errors === 1) finalScore = 2;
        else if (errors === 2) finalScore = 1;
        else finalScore = 0;
      } else {
        if (errors === 0) finalScore = 5;
        else if (errors === 1) finalScore = 3;
        else if (errors === 2) finalScore = 2;
        else if (errors === 3) finalScore = 1;
        else finalScore = 0;
      }

      setIsSolved(true);
      setScore(finalScore);
      onScoreUpdate(question.id, finalScore, errors + 1);
    } else {
      // Errou
      setAttempts(prev => [...prev, altId]);
      setSelectedAltId(null); // Limpa seleção para forçar nova escolha
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden mb-6 transition-all">
      <div className={clsx("h-2 w-full transition-colors", isSolved ? "bg-green-500" : "bg-purple-600")}></div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {question.title}
          </h3>
          {isSolved && (
             <span className="bg-green-100 text-green-800 text-xs font-bold px-2 py-1 rounded-full">
               +{score} pontos
             </span>
          )}
        </div>
        
        {question.description && (
          <p className="text-sm text-gray-500 mb-4">
            {question.description}
          </p>
        )}

        {/* Imagem da Questão */}
        {question.imageUrl && (
          <div className="mb-6 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
            <img 
              src={question.imageUrl} 
              alt={`Imagem da questão ${question.title}`}
              className="w-full max-h-96 object-contain mx-auto"
            />
          </div>
        )}

        <div className="space-y-3">
          {question.alternatives.map((alt) => {
            const isWrong = attempts.includes(alt.id);
            const isCorrect = isSolved && alt.id === question.correctAlternativeId;
            const isSelected = selectedAltId === alt.id;
            const isDisabled = isSolved || isWrong;

            return (
              <button
                key={alt.id}
                onClick={() => handleSelect(alt.id)}
                disabled={isDisabled}
                className={clsx(
                  "w-full text-left p-4 rounded-lg border transition-all flex items-center justify-between group relative overflow-hidden",
                  isCorrect 
                    ? "bg-green-50 border-green-500 text-green-900 ring-1 ring-green-500" 
                    : isWrong
                      ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                      : isSelected
                        ? "bg-purple-50 border-purple-500 text-purple-900 ring-1 ring-purple-500"
                        : "bg-white border-gray-200 hover:border-purple-300 hover:bg-purple-50 text-gray-700"
                )}
              >
                <span className="relative z-10 font-medium">{alt.text}</span>
                
                {isCorrect && <CheckCircle2 className="text-green-600" size={20} />}
                {isWrong && <XCircle className="text-red-400" size={20} />}
                {isSelected && !isSolved && <MousePointerClick className="text-purple-600" size={20} />}
                
                {!isDisabled && !isSelected && (
                  <div className="absolute inset-0 bg-purple-50 opacity-0 group-hover:opacity-10 transition-opacity" />
                )}
              </button>
            );
          })}
        </div>

        {/* Área de Ação / Feedback */}
        <div className="mt-6 pt-4 border-t border-gray-100">
          {isSolved ? (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 p-3 rounded-lg">
              <CheckCircle2 size={16} />
              <span>Correto! Você garantiu {score} de {question.totalPoints} pontos.</span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex-1">
                {attempts.length > 0 && !selectedAltId && (
                   <span className="text-sm text-red-600 flex items-center gap-1 animate-pulse">
                     <AlertCircle size={16} /> Resposta incorreta. Tente outra opção.
                   </span>
                )}
                {attempts.length === 0 && !selectedAltId && (
                  <span className="text-sm text-gray-500">Selecione uma alternativa e clique em enviar.</span>
                )}
              </div>
              
              <button
                onClick={handleConfirm}
                disabled={!selectedAltId}
                className={clsx(
                  "flex items-center gap-2 px-6 py-2 rounded-lg font-medium text-white transition-all",
                  selectedAltId
                    ? "bg-purple-600 hover:bg-purple-700 shadow-md transform hover:-translate-y-0.5"
                    : "bg-gray-300 cursor-not-allowed"
                )}
              >
                Enviar Resposta <Send size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
