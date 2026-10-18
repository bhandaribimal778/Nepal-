import React from 'react';
import { Bookmark, Share2 } from 'lucide-react';
import { Article } from '../types/news';

interface FeaturedStoryProps {
  article: Article;
  isBookmarked: boolean;
  onArticleClick: (article: Article) => void;
  onBookmarkToggle: (articleId: string) => void;
  onShare: (article: Article) => void;
}

export const FeaturedStory: React.FC<FeaturedStoryProps> = ({
  article,
  isBookmarked,
  onArticleClick,
  onBookmarkToggle,
  onShare
}) => {
  return (
    <article className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-slate-200">
      <div className="relative h-64 md:h-96 w-full cursor-pointer group" onClick={() => onArticleClick(article)}>
        <img
          src={article.imageUrl}
          alt={article.altText || article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />

        {/* Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-md shadow">
            मुख्य समाचार
          </span>
          <span className="bg-slate-900/80 backdrop-blur-sm text-white text-xs font-semibold px-2.5 py-1 rounded-md">
            {article.categoryLabel}
          </span>
        </div>

        {/* Quick action buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBookmarkToggle(article.id);
            }}
            className="w-9 h-9 rounded-full bg-slate-900/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
            title="सुरक्षित राख्नुहोस्"
          >
            <Bookmark size={18} className={isBookmarked ? 'fill-amber-400 text-amber-400' : ''} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onShare(article);
            }}
            className="w-9 h-9 rounded-full bg-slate-900/60 backdrop-blur-sm flex items-center justify-center text-white hover:bg-slate-900 transition-colors"
            title="साझेदारी गर्नुहोस्"
          >
            <Share2 size={18} />
          </button>
        </div>

        {/* Bottom Headline on Hero */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <p className="text-xs text-slate-300 mb-1">
            {article.publishedAt} • {article.readTimeMinutes} मिनेट पढाइ
          </p>
          <h2 className="text-xl md:text-3xl font-bold leading-tight line-clamp-2 group-hover:text-red-200 transition-colors">
            {article.title}
          </h2>
        </div>
      </div>

      <div className="p-5">
        <p className="text-slate-600 text-sm md:text-base leading-relaxed mb-4 line-clamp-3">
          {article.summary}
        </p>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-800">✍️ {article.author}</span>
            <span>({article.authorRole})</span>
          </div>
          <button
            onClick={() => onArticleClick(article)}
            className="text-red-600 font-bold hover:underline flex items-center gap-1"
          >
            विस्तृत पढ्नुहोस् →
          </button>
        </div>
      </div>
    </article>
  );
};
