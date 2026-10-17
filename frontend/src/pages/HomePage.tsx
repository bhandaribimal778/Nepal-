import React from 'react';
import { Article, NewsCategory } from '../types/news';
import { BreakingNewsTicker } from '../components/BreakingNewsTicker';
import { FeaturedStory } from '../components/FeaturedStory';
import { NewsCard } from '../components/NewsCard';
import { EmptyState } from '../components/EmptyState';

interface HomePageProps {
  articles: Article[];
  selectedCategory: NewsCategory;
  bookmarkedIds: Set<string>;
  onArticleClick: (article: Article) => void;
  onBookmarkToggle: (articleId: string) => void;
  onShare: (article: Article) => void;
  onResetCategory: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  articles,
  selectedCategory,
  bookmarkedIds,
  onArticleClick,
  onBookmarkToggle,
  onShare,
  onResetCategory
}) => {
  const breaking = articles.filter((a) => a.isBreaking);
  const featured = articles.find((a) => a.isFeatured) || articles[0];
  const latest = articles.filter((a) => a.id !== featured?.id);

  const filteredLatest =
    selectedCategory === 'all'
      ? latest
      : articles.filter((a) => a.category === selectedCategory);

  return (
    <div className="space-y-6 pb-20">
      {breaking.length > 0 && (
        <BreakingNewsTicker articles={breaking} onArticleClick={onArticleClick} />
      )}

      <div className="max-w-7xl mx-auto px-4 space-y-8">
        {/* Featured story (only when "all" is active and featured exists) */}
        {selectedCategory === 'all' && featured && (
          <section>
            <FeaturedStory
              article={featured}
              isBookmarked={bookmarkedIds.has(featured.id)}
              onArticleClick={onArticleClick}
              onBookmarkToggle={onBookmarkToggle}
              onShare={onShare}
            />
          </section>
        )}

        {/* Latest News Grid */}
        <section>
          <div className="flex items-center justify-between mb-4 border-b border-slate-200 pb-2">
            <h2 className="text-xl font-black text-slate-900 border-l-4 border-red-600 pl-3">
              {selectedCategory === 'all' ? 'ताजा समाचार' : 'वर्गीकृत समाचार'}
            </h2>
            <span className="text-xs font-semibold text-slate-500">
              कुल {filteredLatest.length} समाचार
            </span>
          </div>

          {filteredLatest.length === 0 ? (
            <EmptyState
              title="यस वर्गमा कुनै समाचार छैन"
              message="कृपया अन्य वर्गहरू छान्नुहोस् वा सबै समाचार हेर्नुहोस्।"
              actionText="सबै समाचार देखाउनुहोस्"
              onAction={onResetCategory}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredLatest.map((art) => (
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
        </section>
      </div>
    </div>
  );
};
