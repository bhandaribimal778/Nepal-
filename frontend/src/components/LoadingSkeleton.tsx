import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-pulse">
      {/* Featured Skeleton */}
      <div className="bg-slate-200 h-72 md:h-96 rounded-2xl w-full"></div>
      
      {/* Headings */}
      <div className="h-6 bg-slate-200 rounded w-1/4"></div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="bg-white p-3.5 rounded-xl border border-slate-200 flex gap-3.5">
            <div className="w-28 h-24 bg-slate-200 rounded-lg shrink-0"></div>
            <div className="flex-1 space-y-2 py-1">
              <div className="h-4 bg-slate-200 rounded w-1/3"></div>
              <div className="h-4 bg-slate-200 rounded w-full"></div>
              <div className="h-4 bg-slate-200 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
