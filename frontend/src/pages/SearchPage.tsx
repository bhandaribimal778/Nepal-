import React, { useState } from 'react';
import { Search as SearchIcon, X, TrendingUp } from 'lucide-react';
import { Article } from '../types/news';
import { NewsCard } from '../components/NewsCard';
import { EmptyState } from '../components/EmptyState';

interface SearchPageProps {
  articles: Article[];
  bookmarkedIds: Set<string>;
  onArticleClick: (article: Article) => void;
  onBookmarkToggle: (articleId: string) => void;
  initialQuery?: string;
}

export const SearchPage: React.FC<SearchPageProps> = ({
  articles,
  bookmarkedIds,
  onArticleClick,
  onBookmarkToggle,
  initialQuery = ''
}) => {
  const [query, setQuery] = useState(initialQuery);
  const trendingTags = ['मेट्रो रेल', 'जलविद्युत', 'म्याराथन', 'सगरमाथा', '५जी', 'स्टार्टअप', 'चलचित्र'];

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
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-20">
      {/* Search Input Box */}
      <div className="bg-white p-4 md:p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="relative">
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="समाचार, शीर्षक वा लेखक खोज्नुहोस्..."
            className="w-full pl-12 pr-10 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-600 focus:bg-white text-base transition-all"
            autoFocus
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Popular Tags */}
        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1">
            <TrendingUp size={14} className="text-red-600" />
            लोकप्रिय ट्याग:
          </span>
          {trendingTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="text-xs bg-red-50 text-red-700 hover:bg-red-100 font-semibold px-3 py-1 rounded-full transition-colors"
            >
              #{tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header and Cards */}
      {query.trim() === '' ? (
        <EmptyState
          title="समाचार खोज्नुहोस्"
          message="कुनै पनि शीर्षक, लेखक वा विषयवस्तु टाइप गर्नुहोस्।"
        />
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
