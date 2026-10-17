import React from 'react';
import { Search, Bookmark } from 'lucide-react';

interface HeaderProps {
  onSearchClick: () => void;
  onSavedClick: () => void;
  savedCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onSearchClick, onSavedClick, savedCount }) => {
  return (
    <header className="bg-slate-900 text-white shadow-md sticky top-0 z-50">
      {/* Top utility sub-bar */}
      <div className="max-w-7xl mx-auto px-4 py-1.5 flex justify-between items-center text-xs border-b border-slate-800 text-slate-300">
        <div>शनिबार, १ कात्तिक २०८३ | काठमाडौँ (२४°C)</div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
          <span className="text-amber-400 font-semibold">प्रत्यक्ष २४/७ समाचार</span>
        </div>
      </div>

      {/* Main Header */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="w-10 h-10 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-2xl shadow">
            ने
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-1.5">
              नेपाल न्यूज
            </h1>
            <p className="text-[10px] tracking-widest text-slate-400 uppercase font-semibold">
              Nepal News Portal
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onSearchClick}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
            title="समाचार खोज्नुहोस्"
            aria-label="खोज्नुहोस्"
          >
            <Search size={18} />
          </button>
          <button
            onClick={onSavedClick}
            className="p-2.5 rounded-full bg-slate-800 hover:bg-slate-700 text-amber-400 relative transition-colors"
            title="सुरक्षित समाचार"
            aria-label="सुरक्षित समाचार"
          >
            <Bookmark size={18} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
