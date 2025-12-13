import React, { useEffect } from 'react';
import { Plus, Minus, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import { Alternative } from '../types';
import { ProgressBar } from './ui/ProgressBar';
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
  disabled = false,
}) => {
  // Calcula o total distribuído atualmente
  const currentTotal = Object.values(values).reduce((acc, val) => acc + val, 0);
  const remaining = totalPoints - currentTotal;
  const isComplete = remaining === 0;

  // Inicializa valores com 0 se estiverem vazios
  useEffect(() => {
    const initialValues: Record<string, number> = {};
    let hasChanges = false;
    alternatives.forEach(alt => {
      if (values[alt.id] === undefined) {
        initialValues[alt.id] = 0;
        hasChanges = true;
      }
    });
    if (hasChanges) {
      onChange({ ...values, ...initialValues });
    }
  }, [alternatives, values, onChange]);

  const handleIncrement = (id: string) => {
    if (disabled || currentTotal >= totalPoints) return;
    onChange({
      ...values,
      [id]: (values[id] || 0) + 1,
    });
  };

  const handleDecrement = (id: string) => {
    if (disabled || (values[id] || 0) <= 0) return;
    onChange({
      ...values,
      [id]: (values[id] || 0) - 1,
    });
  };

  return (
    <div className={clsx("space-y-4", disabled && "opacity-75")}>
      {/* Header de Status */}
      <div className="flex items-center justify-between text-sm mb-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-700">Distribuição de Pontos:</span>
          <span className={clsx(
            "font-bold px-2 py-0.5 rounded text-xs",
            isComplete ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
          )}>
            {currentTotal} / {totalPoints}
          </span>
        </div>
        <div className="text-gray-500">
          {disabled ? (
            <span className="flex items-center gap-1 text-gray-500 font-medium">
              <Lock size={16} /> Resposta Enviada
            </span>
          ) : remaining > 0 ? (
            <span className="flex items-center gap-1 text-blue-600">
              Restam {remaining} <span className="hidden sm:inline">pontos</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-green-600 font-medium">
              <CheckCircle2 size={16} /> Pronto para enviar
            </span>
          )}
        </div>
      </div>

      <ProgressBar current={currentTotal} total={totalPoints} />

      {/* Lista de Alternativas */}
      <div className="space-y-3 mt-4">
        {alternatives.map((alt) => {
          const val = values[alt.id] || 0;
          const canIncrement = !disabled && currentTotal < totalPoints;
          const canDecrement = !disabled && val > 0;

          return (
            <div 
              key={alt.id} 
              className={clsx(
                "flex items-center justify-between p-3 rounded-lg border transition-all duration-200",
                val > 0 ? "border-blue-200 bg-blue-50/30" : "border-gray-200",
                disabled && "bg-gray-50"
              )}
            >
              <span className="text-gray-700 flex-1 mr-4 text-sm sm:text-base">{alt.text}</span>
              
              <div className={clsx(
                "flex items-center gap-3 p-1 rounded-md shadow-sm border border-gray-100",
                disabled ? "bg-gray-100" : "bg-white"
              )}>
                <button
                  onClick={() => handleDecrement(alt.id)}
                  disabled={!canDecrement}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed text-gray-600 transition-colors"
                  aria-label="Diminuir peso"
                >
                  <Minus size={16} />
                </button>
                
                <span className="w-6 text-center font-semibold text-gray-800 select-none">
                  {val}
                </span>
                
                <button
                  onClick={() => handleIncrement(alt.id)}
                  disabled={!canIncrement}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-blue-50 text-blue-600 disabled:opacity-30 disabled:cursor-not-allowed disabled:text-gray-400 transition-colors"
                  aria-label="Aumentar peso"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      
      {!isComplete && !disabled && (
        <div className="flex items-center gap-2 text-xs text-amber-600 mt-2 animate-pulse">
          <AlertCircle size={14} />
          <span>Distribua todos os pontos para habilitar o envio.</span>
        </div>
      )}
    </div>
  );
};
