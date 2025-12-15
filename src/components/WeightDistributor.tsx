import React from 'react';
import { Alternative } from '../types';
import { Plus, Minus } from 'lucide-react';
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
    if (disabled || remainingPoints <= 0) return;
    const currentVal = values[altId] || 0;
    onChange({ ...values, [altId]: currentVal + 1 });
  };

  const handleDecrement = (altId: string) => {
    if (disabled) return;
    const currentVal = values[altId] || 0;
    if (currentVal > 0) {
      onChange({ ...values, [altId]: currentVal - 1 });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-200">
        <span className="text-sm font-medium text-gray-700">Pontos Restantes:</span>
        <span className={clsx(
          "font-bold text-lg",
          remainingPoints === 0 ? "text-green-600" : "text-indigo-600"
        )}>
          {remainingPoints}
        </span>
      </div>

      <div className="space-y-3">
        {alternatives.map((alt) => {
          const val = values[alt.id] || 0;
          return (
            <div key={alt.id} className="flex items-center justify-between p-3 border rounded-lg hover:border-indigo-200 transition-colors bg-white">
              <span className="text-gray-700 flex-1 mr-4 text-sm">{alt.text}</span>
              
              <div className="flex items-center gap-3 bg-gray-50 p-1 rounded-lg">
                <button
                  onClick={() => handleDecrement(alt.id)}
                  disabled={disabled || val === 0}
                  className="p-1 hover:bg-white rounded-md text-gray-500 hover:text-red-500 disabled:opacity-30 transition-all shadow-sm"
                >
                  <Minus size={16} />
                </button>
                
                <span className="w-6 text-center font-bold text-gray-900">{val}</span>
                
                <button
                  onClick={() => handleIncrement(alt.id)}
                  disabled={disabled || remainingPoints === 0}
                  className="p-1 hover:bg-white rounded-md text-gray-500 hover:text-green-600 disabled:opacity-30 transition-all shadow-sm"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
