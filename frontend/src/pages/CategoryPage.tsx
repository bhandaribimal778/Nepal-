import React from 'react';
import { Article, NewsCategory } from '../types/news';
import { CATEGORIES } from '../fixtures/newsFixtures';
import { NewsCard } from '../components/NewsCard';
import { EmptyState } from '../components/EmptyState';
import { 
  Building2, 
  TrendingUp, 
  Users, 
  Trophy, 
  Film, 
  Laptop, 
  Heart, 
  BookOpen, 
  Globe2, 
  MapPin, 
  Map, 
  Clock, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';

interface CategoryPageProps {
  category: NewsCategory;
  articles: Article[];
  bookmarkedIds: Set<string>;
  onArticleClick: (article: Article) => void;
  onBookmarkToggle: (articleId: string) => void;
  onSelectCategory: (cat: NewsCategory) => void;
}

interface CategoryCardItem {
  slug: NewsCategory;
  name: string;
  icon: React.ElementType;
  bgColor: string;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  articles,
  bookmarkedIds,
  onArticleClick,
  onBookmarkToggle,
  onSelectCategory
}) => {
  const categoryGridList: CategoryCardItem[] = [
    { slug: 'politics', name: 'राजनीति', icon: Building2, bgColor: 'bg-red-500' },
    { slug: 'economy', name: 'अर्थतन्त्र', icon: TrendingUp, bgColor: 'bg-emerald-500' },
    { slug: 'society', name: 'समाज', icon: Users, bgColor: 'bg-blue-500' },
    { slug: 'sports', name: 'खेलकुद', icon: Trophy, bgColor: 'bg-orange-500' },
    { slug: 'entertainment', name: 'मनोरञ्जन', icon: Film, bgColor: 'bg-purple-500' },
    { slug: 'tech', name: 'प्रविधि', icon: Laptop, bgColor: 'bg-cyan-500' },
    { slug: 'opinion', name: 'स्वास्थ्य', icon: Heart, bgColor: 'bg-pink-500' },
    { slug: 'world', name: 'शिक्षा', icon: BookOpen, bgColor: 'bg-amber-500' },
    { slug: 'world', name: 'अन्तर्राष्ट्रिय', icon: Globe2, bgColor: 'bg-indigo-600' },
    { slug: 'society', name: 'स्थानीय', icon: MapPin, bgColor: 'bg-sky-500' },
    { slug: 'politics', name: 'प्रदेश', icon: Map, bgColor: 'bg-blue-600' }
  ];

  const filtered =
    category === 'all'
      ? articles
      : articles.filter((a) => a.category === category);

  const popularArticles = articles.slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 space-y-6 pb-20">
      {/* Top Header Bar */}
      <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button 
          onClick={() => onSelectCategory('all')} 
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <ArrowLeft size={20} className="text-slate-800 dark:text-slate-200" />
        </button>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white">
          श्रेणीहरू
        </h2>
      </div>

      {/* 3-Column / Responsive Colorful Category Grid (Screen 2 style) */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 md:gap-4">
        {categoryGridList.map((item, idx) => {
          const IconComp = item.icon;
          const isSelected = category === item.slug;
          return (
            <button
              key={idx}
              onClick={() => onSelectCategory(item.slug)}
              className={`p-3 md:p-4 rounded-xl border bg-white dark:bg-slate-900 flex flex-col items-center justify-center gap-2.5 transition-all shadow-sm hover:shadow-md hover:scale-[1.03] text-center ${
                isSelected 
                  ? 'border-red-600 ring-2 ring-red-500/20' 
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className={`w-11 h-11 md:w-12 md:h-12 rounded-xl ${item.bgColor} text-white flex items-center justify-center shadow-sm`}>
                <IconComp size={22} />
              </div>
              <span className="font-bold text-xs md:text-sm text-slate-800 dark:text-slate-200 line-clamp-1">
                {item.name}
              </span>
            </button>
          );
        })}
      </div>

      {/* Section "लोकप्रिय" (Popular News) - Screen 2 style */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            लोकप्रिय
          </h3>
          <button 
            onClick={() => onSelectCategory('all')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-0.5"
          >
            सबै हेर्नुहोस्
            <ChevronRight size={14} />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {popularArticles.map((art) => (
            <div
              key={art.id}
              onClick={() => onArticleClick(art)}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-3 flex items-center gap-3 cursor-pointer hover:border-slate-300 dark:hover:border-slate-700 transition shadow-sm hover:shadow"
            >
              <img
                src={art.imageUrl}
                alt={art.title}
                className="w-16 h-16 rounded-lg object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-bold text-xs md:text-sm text-slate-900 dark:text-white line-clamp-2 leading-snug">
                  {art.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <Clock size={11} className="text-slate-400" />
                  <span>{art.relativeTime || art.publishedAt}</span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Results if specific category selected */}
      {category !== 'all' && (
        <div className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {CATEGORIES.find((c) => c.slug === category)?.name || 'समाचार'} ({filtered.length})
          </h3>

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
      )}
    </div>
  );
};
