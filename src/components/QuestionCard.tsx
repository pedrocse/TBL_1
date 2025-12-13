import React from 'react';
import { Question } from '../types';
import { WeightDistributor } from './WeightDistributor';
import { Check, Lock } from 'lucide-react';
import { clsx } from 'clsx';

interface QuestionCardProps {
  question: Question;
  values: Record<string, number>;
  onChange: (newValues: Record<string, number>) => void;
  isConfirmed: boolean;
  onConfirm: () => void;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ 
  question, 
  values, 
  onChange,
  isConfirmed,
  onConfirm
}) => {
  
  const currentTotal = Object.values(values).reduce((acc, val) => acc + val, 0);
  const canConfirm = currentTotal === question.totalPoints;

  return (
    <div className={clsx(
      "bg-white rounded-xl border shadow-sm overflow-hidden mb-6 transition-all",
      isConfirmed ? "border-green-200" : "border-gray-200 hover:shadow-md"
    )}>
      {/* Faixa superior colorida */}
      <div className={clsx(
        "h-2 w-full transition-colors",
        isConfirmed ? "bg-green-500" : "bg-indigo-600"
      )}></div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-medium text-gray-900">
            {question.title}
          </h3>
          {isConfirmed && (
            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
              <Lock size={12} /> Confirmado
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

        <div className="mt-6">
          <WeightDistributor
            alternatives={question.alternatives}
            totalPoints={question.totalPoints}
            values={values}
            onChange={onChange}
            disabled={isConfirmed}
          />
        </div>

        {/* Botão de Confirmação Individual */}
        {!isConfirmed && (
          <div className="mt-6 pt-4 border-t border-gray-100 flex justify-end">
            <button
              onClick={onConfirm}
              disabled={!canConfirm}
              className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all",
                canConfirm 
                  ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm" 
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
              )}
            >
              <Check size={16} />
              Confirmar Resposta
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
