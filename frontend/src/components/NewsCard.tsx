import React from 'react';
import { Bookmark } from 'lucide-react';
import { Article } from '../types/news';

interface NewsCardProps {
  article: Article;
  isBookmarked: boolean;
  onArticleClick: (article: Article) => void;
  onBookmarkToggle: (articleId: string) => void;
}

export const NewsCard: React.FC<NewsCardProps> = ({
  article,
  isBookmarked,
  onArticleClick,
  onBookmarkToggle
}) => {
  return (
    <article
      onClick={() => onArticleClick(article)}
      className="bg-white rounded-xl p-3.5 border border-slate-200 hover:border-slate-300 shadow-sm hover:shadow transition-all flex gap-3.5 cursor-pointer group"
    >
      <div className="relative w-28 h-24 md:w-36 md:h-28 rounded-lg overflow-hidden shrink-0 bg-slate-100">
        <img
          src={article.imageUrl}
          alt={article.altText || article.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {article.isBreaking && (
          <span className="absolute top-1 left-1 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow">
            ताजा
          </span>
        )}
      </div>

      <div className="flex flex-col justify-between flex-1 min-w-0">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold text-red-600 uppercase tracking-wide">
              {article.categoryLabel}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmarkToggle(article.id);
              }}
              className="text-slate-400 hover:text-amber-500 transition-colors p-1"
              title="सुरक्षित राख्नुहोस्"
            >
              <Bookmark size={16} className={isBookmarked ? 'fill-amber-400 text-amber-400' : ''} />
            </button>
          </div>

          <h3 className="font-bold text-slate-900 group-hover:text-red-700 text-sm md:text-base leading-snug line-clamp-2 transition-colors">
            {article.title}
          </h3>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 mt-2">
          <span>{article.publishedAt}</span>
          <span>{article.readTimeMinutes} मिनेट पढाइ</span>
        </div>
      </div>
    </article>
  );
};
