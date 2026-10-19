import React, { useState } from 'react';
import { Search as SearchIcon, X, Clock, ArrowLeft } from 'lucide-react';
import { Article } from '../types/news';
import { NewsCard } from '../components/NewsCard';
import { EmptyState } from '../components/EmptyState';

interface SearchPageProps {
  articles: Article[];
  bookmarkedIds: Set<string>;
  onArticleClick: (article: Article) => void;
  onBookmarkToggle: (articleId: string) => void;
  initialQuery?: string;
  onBack?: () => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  articles,
  bookmarkedIds,
  onArticleClick,
  onBookmarkToggle,
  initialQuery = '',
  onBack
}) => {
  const [query, setQuery] = useState(initialQuery);
  const popularKeywords = ['बजेट', 'हिमपात', 'नेपाल', 'खेलकुद', 'शिक्षा', 'स्वास्थ्य'];
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'बजेट',
    'हिमपात',
    'नेपाल',
    'क्रिकेट',
    'शिक्षा'
  ]);

  const handleRemoveRecent = (item: string) => {
    setRecentSearches((prev) => prev.filter((i) => i !== item));
  };

  const trimmed = query.trim().toLowerCase();
  const results = !trimmed
    ? []
    : articles.filter(
        (a) =>
          a.title.toLowerCase().includes(trimmed) ||
          a.summary.toLowerCase().includes(trimmed) ||
          a.author.toLowerCase().includes(trimmed) ||
          a.categoryLabel.includes(trimmed) ||
          a.tags?.some((t) => t.toLowerCase().includes(trimmed))
      );

  return (
    <div className="max-w-4xl mx-auto px-4 py-4 md:py-6 space-y-6 pb-20">
      {/* Search Input Box (Screen 4 style) */}
      <div className="flex items-center gap-3">
        {onBack && (
          <button 
            onClick={onBack}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <ArrowLeft size={20} className="text-slate-700 dark:text-slate-300" />
          </button>
        )}
        <div className="relative flex-1">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="समाचार खोज्नुहोस्..."
            className="w-full pl-11 pr-10 py-3 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-full text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white dark:focus:bg-slate-800 text-sm transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {query.trim() === '' ? (
        <div className="space-y-6">
          {/* 1. "लोकप्रिय खोजी" (Screen 4 style) */}
          <div className="space-y-3">
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              लोकप्रिय खोजी
            </h3>
            <div className="flex flex-wrap gap-2">
              {popularKeywords.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setQuery(tag)}
                  className="text-xs bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-medium px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
                >
                  <SearchIcon size={12} className="text-slate-400" />
                  <span>{tag}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. "हालै खोजिएका" (Screen 4 style) */}
          {recentSearches.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-900 dark:text-white">
                हालै खोजिएका
              </h3>
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentSearches.map((item) => (
                  <div
                    key={item}
                    className="flex items-center justify-between py-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/50 px-2 rounded-lg cursor-pointer transition"
                    onClick={() => setQuery(item)}
                  >
                    <div className="flex items-center gap-3">
                      <SearchIcon size={16} className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {item}
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveRecent(item);
                      }}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X size={15} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : results.length === 0 ? (
        <EmptyState
          title="कुनै नतिजा भेटिएन"
          message={`"${query}" सम्बन्धी कुनै पनि समाचार फेला परेन। कृपया अन्य शब्दहरू प्रयोग गर्नुहोस्।`}
          actionText="खोजी खाली गर्नुहोस्"
          onAction={() => setQuery('')}
        />
      ) : (
        <div className="space-y-4">
          <p className="text-sm font-semibold text-slate-500">
            "{query}" का लागि <span className="text-red-600 font-bold">{results.length}</span> परिणामहरू भेटिए
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((art) => (
              <NewsCard
                key={art.id}
                article={art}
                isBookmarked={bookmarkedIds.has(art.id)}
                onArticleClick={onArticleClick}
                onBookmarkToggle={onBookmarkToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
