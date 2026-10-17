import React from 'react';
import { Home, Layers, Search, Bookmark } from 'lucide-react';
import { CATEGORIES } from '../fixtures/newsFixtures';
import { NewsCategory, PageRoute } from '../types/news';

interface NavigationProps {
  currentRoute: PageRoute;
  onNavigate: (route: PageRoute) => void;
  selectedCategory: NewsCategory;
  onCategorySelect: (cat: NewsCategory) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  currentRoute,
  onNavigate,
  selectedCategory,
  onCategorySelect
}) => {
  return (
    <>
      {/* Category Ribbon (Desktop / Tablet / Mobile horizontal scroll) */}
      <nav className="bg-white border-b border-slate-200 shadow-sm sticky top-[73px] z-40 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 flex items-center space-x-1 py-2">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.slug && currentRoute.type !== 'saved';
            return (
              <button
                key={cat.slug}
                onClick={() => {
                  onCategorySelect(cat.slug);
                  if (currentRoute.type !== 'home' && currentRoute.type !== 'category') {
                    onNavigate({ type: 'category', category: cat.slug });
                  }
                }}
                className={`px-3.5 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-150 ${
                  isSelected
                    ? 'bg-slate-900 text-white shadow-sm ring-2 ring-red-600'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Bottom Navigation for Mobile / Handheld View */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-50 flex justify-around items-center py-2 px-1 shadow-lg">
        <button
          onClick={() => onNavigate({ type: 'home' })}
          className={`flex flex-col items-center py-1 px-3 text-xs font-semibold ${
            currentRoute.type === 'home' ? 'text-red-600' : 'text-slate-500'
          }`}
        >
          <Home size={20} />
          <span className="mt-1">गृहपृष्ठ</span>
        </button>

        <button
          onClick={() => onNavigate({ type: 'category', category: selectedCategory })}
          className={`flex flex-col items-center py-1 px-3 text-xs font-semibold ${
            currentRoute.type === 'category' ? 'text-red-600' : 'text-slate-500'
          }`}
        >
          <Layers size={20} />
          <span className="mt-1">वर्गहरू</span>
        </button>

        <button
          onClick={() => onNavigate({ type: 'search' })}
          className={`flex flex-col items-center py-1 px-3 text-xs font-semibold ${
            currentRoute.type === 'search' ? 'text-red-600' : 'text-slate-500'
          }`}
        >
          <Search size={20} />
          <span className="mt-1">खोज्नुहोस्</span>
        </button>

        <button
          onClick={() => onNavigate({ type: 'saved' })}
          className={`flex flex-col items-center py-1 px-3 text-xs font-semibold ${
            currentRoute.type === 'saved' ? 'text-red-600' : 'text-slate-500'
          }`}
        >
          <Bookmark size={20} />
          <span className="mt-1">सुरक्षित</span>
        </button>
      </div>
    </>
  );
};
