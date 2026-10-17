import React from 'react';
import { WifiOff, RotateCcw } from 'lucide-react';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => {
  return (
    <div className="py-16 px-4 text-center max-w-md mx-auto flex flex-col items-center">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-4">
        <WifiOff size={32} />
      </div>
      <h3 className="text-lg font-bold text-slate-800 mb-1">समाचार लोड गर्न सकिएन</h3>
      <p className="text-slate-500 text-sm mb-6">{message}</p>
      <button
        onClick={onRetry}
        className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm px-5 py-2.5 rounded-lg shadow-sm transition-colors"
      >
        <RotateCcw size={16} />
        पुनः प्रयास गर्नुहोस्
      </button>
    </div>
  );
};
