import React from 'react';
import { Alternative } from '../types';
import { Plus, Minus, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';

interface WeightDistributorProps {
  alternatives: Alternative[];
  totalPoints: number;
  values: Record<string, number>;
  onChange: (newValues: Record<string, number>) => void;
  disabled?: boolean;
}

export const WeightDistributor: React.FC<WeightDistributorProps> = ({
  alternatives,
  totalPoints,
  values,
  onChange,
  disabled = false
}) => {
  const currentTotal = Object.values(values).reduce((acc, val) => acc + val, 0);
  const remainingPoints = totalPoints - currentTotal;

  const handleIncrement = (altId: string) => {
    if (remainingPoints <= 0 || disabled) return;
    const currentVal = values[altId] || 0;
    onChange({
      ...values,
      [altId]: currentVal + 1
    });
  };

  const handleDecrement = (altId: string) => {
    if (disabled) return;
    const currentVal = values[altId] || 0;
    if (currentVal > 0) {
      const newValues = { ...values, [altId]: currentVal - 1 };
      // Opcional: remover a chave se for 0, mas manter 0 também funciona
      onChange(newValues);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 mb-4">
        <span className="text-sm font-medium text-gray-700">Pontos para distribuir:</span>
        <div className="flex items-center gap-2">
          <span className={clsx(
            "font-bold text-lg transition-colors",
            remainingPoints === 0 ? "text-green-600" : "text-indigo-600"
          )}>
            {remainingPoints}
          </span>
          <span className="text-gray-400 text-sm">/ {totalPoints}</span>
        </div>
      </div>

      <div className="space-y-3">
        {alternatives.map((alt) => {
          const val = values[alt.id] || 0;
          return (
            <div 
              key={alt.id} 
              className={clsx(
                "flex items-center justify-between p-3 rounded-lg border transition-all",
                val > 0 ? "border-indigo-200 bg-indigo-50/30" : "border-gray-200 bg-white"
              )}
            >
              <div className="flex-1 mr-4">
                <span className="text-gray-700 text-sm font-medium leading-tight block">{alt.text}</span>
              </div>

              <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-gray-200 shadow-sm shrink-0">
                <button
                  onClick={() => handleDecrement(alt.id)}
                  disabled={disabled || val === 0}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-red-500 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  type="button"
                  aria-label="Diminuir pontos"
                >
                  <Minus size={16} />
                </button>
                
                <span className="w-8 text-center font-bold text-gray-900 select-none">{val}</span>
                
                <button
                  onClick={() => handleIncrement(alt.id)}
                  disabled={disabled || remainingPoints === 0}
                  className="w-8 h-8 flex items-center justify-center rounded-md text-gray-500 hover:bg-gray-100 hover:text-green-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  type="button"
                  aria-label="Aumentar pontos"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {remainingPoints > 0 && !disabled && (
        <div className="flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded mt-2 animate-pulse">
          <AlertCircle size={14} />
          <span>Distribua todos os pontos restantes para confirmar sua resposta.</span>
        </div>
      )}
    </div>
  );
};
