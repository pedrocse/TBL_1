import React from 'react';
import { clsx } from 'clsx';

interface ProgressBarProps {
  current: number;
  total: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {
  const percentage = Math.min(100, Math.max(0, (current / total) * 100));
  const isComplete = current === total;
  const isOver = current > total;

  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden transition-all">
      <div
        className={clsx(
          "h-full transition-all duration-300 ease-out",
          isOver ? "bg-red-500" : isComplete ? "bg-green-500" : "bg-blue-500"
        )}
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
