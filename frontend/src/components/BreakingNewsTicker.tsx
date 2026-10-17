import React, { useState, useEffect } from 'react';
import { Zap, ChevronRight } from 'lucide-react';
import { Article } from '../types/news';

interface BreakingNewsTickerProps {
  articles: Article[];
  onArticleClick: (article: Article) => void;
}

export const BreakingNewsTicker: React.FC<BreakingNewsTickerProps> = ({
  articles,
  onArticleClick
}) => {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (articles.length <= 1) return;
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % articles.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [articles.length]);

  if (!articles.length) return null;
  const current = articles[index] || articles[0];

  return (
    <div className="bg-red-50 border-y border-red-200">
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 overflow-hidden flex-1">
          <span className="flex items-center gap-1.5 bg-red-600 text-white text-xs font-bold px-2.5 py-1 rounded shadow-sm shrink-0">
            <Zap size={14} className="fill-white" />
            ताजा अपडेट
          </span>
          <button
            onClick={() => onArticleClick(current)}
            className="text-slate-900 hover:text-red-700 font-semibold text-sm truncate text-left transition-colors"
          >
            {current.title}
          </button>
        </div>
        <button
          onClick={() => onArticleClick(current)}
          className="text-red-600 hover:text-red-700 p-1 flex items-center text-xs font-bold shrink-0"
        >
          हेर्नुहोस् <ChevronRight size={14} />
        </button>
      </div>
    </div>
  );
};
