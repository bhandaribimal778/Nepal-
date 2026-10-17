import React from 'react';
import { Article, NewsCategory } from '../types/news';
import { CATEGORIES } from '../fixtures/newsFixtures';
import { NewsCard } from '../components/NewsCard';
import { EmptyState } from '../components/EmptyState';

interface CategoryPageProps {
  category: NewsCategory;
  articles: Article[];
  bookmarkedIds: Set<string>;
  onArticleClick: (article: Article) => void;
  onBookmarkToggle: (articleId: string) => void;
  onSelectCategory: (cat: NewsCategory) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  articles,
  bookmarkedIds,
  onArticleClick,
  onBookmarkToggle,
  onSelectCategory
}) => {
  const currentCatInfo = CATEGORIES.find((c) => c.slug === category) || CATEGORIES[0];
  const filtered =
    category === 'all'
      ? articles
      : articles.filter((a) => a.category === category);

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 pb-20">
      <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-red-500 text-xs font-bold uppercase tracking-wider">
            विधा / श्रेणी
          </span>
          <h2 className="text-2xl md:text-3xl font-black mt-1">
            {currentCatInfo.name}
          </h2>
          <p className="text-slate-400 text-xs md:text-sm mt-1">
            {currentCatInfo.name} विधाका ताजा तथा महत्त्वपूर्ण राष्ट्रिय समाचारहरू
          </p>
        </div>
        <div className="text-sm font-semibold bg-slate-800 px-4 py-2 rounded-lg text-slate-300 self-start md:self-auto">
          कुल {filtered.length} समाचार
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="कुनै समाचार फेला परेन"
          message="यस विधामा हाल कुनै समाचार उपलब्ध छैन।"
          actionText="सबै समाचार हेर्नुहोस्"
          onAction={() => onSelectCategory('all')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((art) => (
            <NewsCard
              key={art.id}
              article={art}
              isBookmarked={bookmarkedIds.has(art.id)}
              onArticleClick={onArticleClick}
              onBookmarkToggle={onBookmarkToggle}
            />
          ))}
        </div>
      )}
    </div>
  );
};
